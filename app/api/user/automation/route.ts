import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface N8NPayload {
  userId: string;
  email: string;
  fullname?: string | null;
  soundcloudAccessToken: string;
  soundcloudUserId?: string | null;
  action: 'automation_enabled' | 'automation_disabled';
}

async function sendToN8N(payload: N8NPayload) {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!n8nWebhookUrl) {
    console.warn('N8N_WEBHOOK_URL is not configured. Skipping N8N notification.');
    return;
  }

  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`N8N webhook returned ${response.status}: ${await response.text()}`);
    }

    console.log('Successfully sent to N8N:', payload.action);
  } catch (error) {
    console.error('Failed to send to N8N:', error);
    throw error;
  }
}

export async function PATCH(request: Request) {
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

    const { automation } = await request.json();

    if (typeof automation !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid automation value' },
        { status: 400 }
      );
    }

    // Récupérer le profil utilisateur et les données SoundCloud
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('email, fullname')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Récupérer les données SoundCloud existantes
    const { data: soundcloudUserData, error: soundcloudError } = await supabase
      .from('soundcloud_users')
      .select('access_token, automation')
      .eq('user_id', user.id)
      .single();

    // Mettre à jour l'automation dans soundcloud_users
    const { data, error } = await supabase
      .from('soundcloud_users')
      .update({ automation })
      .eq('user_id', user.id)
      .select('automation')
      .single();

    if (error) {
      console.error('Error updating automation:', error);
      return NextResponse.json(
        { error: 'Failed to update automation' },
        { status: 500 }
      );
    }

    // Si automation est activé et qu'on a un token SoundCloud, envoyer à N8N
    if (automation && soundcloudUserData?.access_token) {
      try {
        await sendToN8N({
          userId: user.id,
          email: profile.email,
          fullname: profile.fullname,
          soundcloudAccessToken: soundcloudUserData.access_token,
          soundcloudUserId: null, // On n'a plus cette info directement, à récupérer depuis l'API SoundCloud si nécessaire
          action: 'automation_enabled',
        });
      } catch (n8nError) {
        console.error('Error sending to N8N:', n8nError);
        // On continue même si l'envoi à N8N échoue
      }
    } else if (!automation && soundcloudUserData?.access_token) {
      // Si automation est désactivé, notifier N8N
      try {
        await sendToN8N({
          userId: user.id,
          email: profile.email,
          soundcloudAccessToken: soundcloudUserData.access_token,
          soundcloudUserId: null,
          action: 'automation_disabled',
        });
      } catch (n8nError) {
        console.error('Error sending to N8N:', n8nError);
      }
    }

    return NextResponse.json({ success: true, automation: data?.automation || false });
  } catch (error: any) {
    console.error('Error in automation route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Récupérer l'automation depuis soundcloud_users
    const { data, error } = await supabase
      .from('soundcloud_users')
      .select('automation')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // Si l'utilisateur n'a pas encore d'entrée dans soundcloud_users, retourner false
      if (error.code === 'PGRST116') {
        return NextResponse.json({ automation: false });
      }
      console.error('Error fetching automation:', error);
      return NextResponse.json(
        { error: 'Failed to fetch automation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ automation: data?.automation || false });
  } catch (error: any) {
    console.error('Error in automation route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

