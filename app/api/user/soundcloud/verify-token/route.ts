import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          authFailed: true, // Supabase session expired, not SoundCloud token issue
          message: 'Session expirée. Veuillez vous reconnecter.'
        },
        { status: 401 }
      );
    }

    // Récupérer le token SoundCloud depuis la table soundcloud_users
    const { data: soundcloudUserData, error: soundcloudError } = await supabase
      .from('soundcloud_users')
      .select('access_token, refresh_token')
      .eq('user_id', user.id)
      .single();

    if (soundcloudError || !soundcloudUserData) {
      return NextResponse.json({
        valid: false,
        connected: false,
        message: 'Aucun token SoundCloud trouvé. Veuillez vous connecter à SoundCloud.',
        needsReauth: true,
      });
    }

    if (!soundcloudUserData.access_token) {
      return NextResponse.json({
        valid: false,
        connected: false,
        message: 'Aucun token SoundCloud trouvé. Veuillez vous connecter à SoundCloud.',
        needsReauth: true,
      });
    }

    // Utiliser le token actuel
    const accessToken = soundcloudUserData.access_token;

    // Vérifier la validité du token en appelant l'API SoundCloud
    try {
      const userResponse = await fetch('https://api.soundcloud.com/me', {
        headers: {
          'Authorization': `OAuth ${accessToken}`,
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
        // Token invalide ou expiré - essayer de rafraîchir si on a un refresh token
        if (soundcloudUserData.refresh_token) {
          try {
            // Appeler l'Edge Function pour rafraîchir le token
            const { data: tokenData, error: tokenError } = await supabase.functions.invoke('soundcloud-auth', {
              body: {
                action: 'refresh_token',
                refresh_token: soundcloudUserData.refresh_token,
              },
            });

            if (!tokenError && tokenData?.access_token) {
              const { access_token, refresh_token } = tokenData;

              // Mettre à jour le token dans la table soundcloud_users
              const updateData: any = {
                access_token: access_token,
              };

              if (refresh_token) {
                updateData.refresh_token = refresh_token;
              }

              await supabase
                .from('soundcloud_users')
                .update(updateData)
                .eq('user_id', user.id);

              // Re-vérifier avec le nouveau token
              const retryResponse = await fetch('https://api.soundcloud.com/me', {
                headers: {
                  'Authorization': `OAuth ${access_token}`,
                },
              });

              if (retryResponse.ok) {
                const userData = await retryResponse.json();
                return NextResponse.json({
                  valid: true,
                  connected: true,
                  message: 'Token rafraîchi et valide',
                  soundcloudUserId: userData.id,
                  username: userData.username,
                });
              }
            }
          } catch (refreshError) {
            console.error('Error refreshing expired token:', refreshError);
          }
        }

        return NextResponse.json({
          valid: false,
          connected: true,
          message: 'Token invalide ou expiré',
          needsReauth: !soundcloudUserData.refresh_token, // Ne pas demander de réauth si on peut rafraîchir
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

