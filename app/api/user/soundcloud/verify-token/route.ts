import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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
      return NextResponse.json({
        valid: false,
        connected: false,
        message: 'Profil utilisateur non trouvé',
        needsReauth: true,
      });
    }

    if (!profile.soundcloud_access_token) {
      return NextResponse.json({
        valid: false,
        connected: false,
        message: 'Aucun token SoundCloud trouvé. Veuillez vous connecter à SoundCloud.',
        needsReauth: true,
      });
    }

    // Vérifier la validité du token en appelant l'API SoundCloud
    try {
      const userResponse = await fetch('https://api.soundcloud.com/me', {
        headers: {
          'Authorization': `OAuth ${profile.soundcloud_access_token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        return NextResponse.json({
          valid: true,
          connected: true,
          message: 'Token valide',
          soundcloudUserId: userData.id,
          username: userData.username,
        });
      } else if (userResponse.status === 401) {
        // Token invalide ou expiré
        return NextResponse.json({
          valid: false,
          connected: true,
          message: 'Token invalide ou expiré',
          needsReauth: true,
        });
      } else {
        return NextResponse.json({
          valid: false,
          connected: true,
          message: `Erreur API SoundCloud: ${userResponse.status}`,
          needsReauth: true,
        });
      }
    } catch (error: any) {
      console.error('Error verifying token:', error);
      return NextResponse.json({
        valid: false,
        connected: true,
        message: 'Erreur lors de la vérification du token',
        needsReauth: true,
      });
    }
  } catch (error: any) {
    console.error('Error in verify-token route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

