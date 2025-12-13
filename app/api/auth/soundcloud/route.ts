import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
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

    // Générer un state pour la sécurité CSRF
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Appeler l'Edge Function pour obtenir l'URL d'autorisation
    const { data, error } = await supabase.functions.invoke('soundcloud-auth', {
      body: {
        action: 'get_auth_url',
        redirect_uri: redirectUri,
        state: state,
      },
    });

    if (error || !data?.auth_url) {
      console.error('Error calling soundcloud-auth Edge Function:', error);
      return NextResponse.json(
        { error: error?.message || 'Failed to get SoundCloud auth URL from Supabase' },
        { status: 500 }
      );
    }

    // Stocker le state dans un cookie httpOnly pour la sécurité
    const response = NextResponse.redirect(data.auth_url);
    response.cookies.set('soundcloud_oauth_state', data.state || state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error: any) {
    console.error('Error in SoundCloud auth route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

