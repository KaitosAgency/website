import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Récupérer le token SoundCloud depuis la base de données
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('soundcloud_access_token, soundcloud_user_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profil utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (!profile.soundcloud_access_token) {
      return NextResponse.json(
        { error: 'Aucun token SoundCloud trouvé. Veuillez vous connecter à SoundCloud.' },
        { status: 401 }
      );
    }

    // Utiliser le token depuis la base de données
    const accessToken = profile.soundcloud_access_token;

    // Mettre à jour le cookie pour rester synchronisé (optionnel, pour compatibilité)
    const cookieStore = await cookies();
    const response = NextResponse.json({});
    
    // Mettre à jour le cookie si nécessaire
    const existingCookieToken = cookieStore.get('soundcloud_access_token')?.value;
    if (existingCookieToken !== accessToken) {
      response.cookies.set('soundcloud_access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 jours
      });
    }

    // Récupérer les données utilisateur depuis SoundCloud
    const userResponse = await fetch('https://api.soundcloud.com/me', {
      headers: {
        'Authorization': `OAuth ${accessToken}`,
      },
    });
    
    if (!userResponse.ok) {
      // Si le token est invalide, retourner une erreur appropriée
      if (userResponse.status === 401) {
        return NextResponse.json(
          { error: 'Token SoundCloud invalide ou expiré. Veuillez vous reconnecter.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    
    // Mettre à jour le cookie avec les données utilisateur pour compatibilité
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

    // Retourner les données utilisateur
    return NextResponse.json(userData);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}


