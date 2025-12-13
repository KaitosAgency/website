import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const supabase = await createClient();

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('OAuth Callback - Code:', code?.substring(0, 50) + '...');
    console.log('OAuth Callback - State:', state);
    console.log('OAuth Callback - Error:', error);

    // Vérifier s'il y a une erreur
    if (error) {
      console.error('OAuth Error:', error);
      return NextResponse.redirect(`${baseUrl}/music?error=${encodeURIComponent(error)}`);
    }

    // Vérifier le code
    if (!code) {
      console.error('No code received');
      return NextResponse.redirect(`${baseUrl}/music?error=no_code`);
    }

    // Vérifier le state pour la sécurité CSRF
    const cookieStore = await cookies();
    const storedState = cookieStore.get('soundcloud_oauth_state')?.value;

    console.log('Stored state:', storedState);
    console.log('Received state:', state);

    if (!state || state !== storedState) {
      console.error('State mismatch - stored:', storedState, 'received:', state);
      // En développement, on peut être plus permissif
      if (process.env.NODE_ENV === 'development') {
        console.warn('State mismatch ignored in development mode');
      } else {
        return NextResponse.redirect(`${baseUrl}/music?error=invalid_state`);
      }
    }

    // Supprimer le cookie state
    cookieStore.delete('soundcloud_oauth_state');

    // Récupérer l'URL de redirection depuis la base de données
    const { data: adminConfig } = await supabase
      .from('music_admin')
      .select('music_url')
      .single();

    // Construction de l'URL de redirection
    // Si music_url est défini (ex: kaitos.com), on l'utilise pour construire l'URL complète
    // Sinon on fallback sur la variable d'env ou localhost
    let redirectUri = process.env.SOUNDCLOUD_REDIRECT_URI || 'http://localhost:3000/api/auth/soundcloud/callback';

    if ((adminConfig as any)?.music_url) {
      const domain = (adminConfig as any).music_url;
      // On s'assure que le domaine ne contient pas de protocole
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      redirectUri = `https://${cleanDomain}/api/auth/soundcloud/callback`;
    }

    // Appeler l'Edge Function pour échanger le code contre un token
    console.log('Exchanging code for token via Edge Function...');
    console.log('Redirect URI:', redirectUri);

    const { data: tokenData, error: tokenError } = await supabase.functions.invoke('soundcloud-auth', {
      body: {
        action: 'exchange_token',
        code: code,
        redirect_uri: redirectUri,
      },
    });

    if (tokenError || !tokenData) {
      console.error('Token exchange error:', tokenError);
      const errorMessage = tokenError?.message || tokenData?.error || 'Token exchange failed';
      return NextResponse.redirect(`${baseUrl}/music?error=token_exchange_failed&details=${encodeURIComponent(errorMessage.substring(0, 100))}`);
    }

    console.log('Token data received:', Object.keys(tokenData));
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    if (!accessToken) {
      console.error('No access token in response:', tokenData);
      return NextResponse.redirect(`${baseUrl}/music?error=no_token`);
    }

    // Récupérer les informations de l'utilisateur
    console.log('Fetching user data...');
    const userResponse = await fetch('https://api.soundcloud.com/me', {
      headers: {
        'Authorization': `OAuth ${accessToken}`,
      },
    });

    console.log('User response status:', userResponse.status);

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('User fetch error:', errorText);
      return NextResponse.redirect(`${baseUrl}/music?error=user_fetch_failed&status=${userResponse.status}`);
    }

    const userData = await userResponse.json();
    console.log('User data received:', userData.username || userData.id);

    // Récupérer l'utilisateur Supabase actuel
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (supabaseUser) {
      // Vérifier si une entrée existe déjà dans soundcloud_users
      const { data: existingSoundcloudUser } = await supabase
        .from('soundcloud_users')
        .select('automation')
        .eq('user_id', supabaseUser.id)
        .single();

      // Préparer les données à insérer/mettre à jour
      const updateData: any = {
        access_token: accessToken,
        automation: existingSoundcloudUser?.automation || false,
      };

      // Ajouter le refresh token s'il est disponible
      if (refreshToken) {
        updateData.refresh_token = refreshToken;
      }

      // Mettre à jour ou insérer dans la table soundcloud_users
      const { error: upsertError } = await supabase
        .from('soundcloud_users')
        .upsert({
          user_id: supabaseUser.id,
          ...updateData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (upsertError) {
        console.error('Error upserting soundcloud_users:', upsertError);
      }
    }

    // Stocker le token et les données utilisateur dans des cookies sécurisés
    const response = NextResponse.redirect(`${baseUrl}/music/dashboard?soundcloud_connected=true`);

    // Stocker le token dans un cookie httpOnly
    response.cookies.set('soundcloud_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
    });

    // Stocker les données utilisateur de base dans un cookie
    response.cookies.set('soundcloud_user', JSON.stringify({
      id: userData.id,
      username: userData.username,
      full_name: userData.full_name,
      avatar_url: userData.avatar_url,
      permalink_url: userData.permalink_url,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
    });

    console.log('Redirecting to dashboard...');
    return response;
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    return NextResponse.redirect(`${baseUrl}/music?error=server_error&message=${encodeURIComponent(error?.message || 'Unknown error')}`);
  }
}
