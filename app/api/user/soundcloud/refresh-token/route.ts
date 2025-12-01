import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
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

    // Récupérer le refresh token de l'utilisateur depuis la table soundcloud_users
    const { data: soundcloudUserData, error: soundcloudError } = await supabase
      .from('soundcloud_users')
      .select('refresh_token')
      .eq('user_id', user.id)
      .single();

    if (soundcloudError || !soundcloudUserData) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (!soundcloudUserData.refresh_token) {
      return NextResponse.json(
        { error: 'No refresh token available. Please reconnect your SoundCloud account.' },
        { status: 400 }
      );
    }

    // Appeler l'Edge Function pour rafraîchir le token
    const { data: tokenData, error: tokenError } = await supabase.functions.invoke('soundcloud-auth', {
      body: {
        action: 'refresh_token',
        refresh_token: soundcloudUserData.refresh_token,
      },
    });

    if (tokenError || !tokenData) {
      console.error('Token refresh error:', tokenError);
      return NextResponse.json(
        { error: tokenError?.message || 'Failed to refresh token' },
        { status: 500 }
      );
    }

    const { access_token, refresh_token } = tokenData;

    if (!access_token) {
      return NextResponse.json(
        { error: 'No access token in response' },
        { status: 500 }
      );
    }

    // Mettre à jour le token dans la table soundcloud_users
    const updateData: any = {
      access_token: access_token,
    };

    if (refresh_token) {
      updateData.refresh_token = refresh_token;
    }

    const { error: updateError } = await supabase
      .from('soundcloud_users')
      .update(updateData)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating token:', updateError);
      return NextResponse.json(
        { error: 'Failed to update token in database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Error in refresh token route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

