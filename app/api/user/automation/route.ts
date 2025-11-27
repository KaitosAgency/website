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

    // Récupérer le profil utilisateur avec le token SoundCloud
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('soundcloud_access_token, soundcloud_user_id, email, fullname')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Mettre à jour l'automation dans user_profiles
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ automation })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating automation:', error);
      return NextResponse.json(
        { error: 'Failed to update automation' },
        { status: 500 }
      );
    }

    // Si automation est activé et qu'on a un token SoundCloud, envoyer à N8N
    if (automation && profile.soundcloud_access_token) {
      try {
        await sendToN8N({
          userId: user.id,
          email: profile.email,
          fullname: profile.fullname,
          soundcloudAccessToken: profile.soundcloud_access_token,
          soundcloudUserId: profile.soundcloud_user_id,
          action: 'automation_enabled',
        });
      } catch (n8nError) {
        console.error('Error sending to N8N:', n8nError);
        // On continue même si l'envoi à N8N échoue
      }
    } else if (!automation && profile.soundcloud_access_token) {
      // Si automation est désactivé, notifier N8N
      try {
        await sendToN8N({
          userId: user.id,
          email: profile.email,
          soundcloudAccessToken: profile.soundcloud_access_token,
          soundcloudUserId: profile.soundcloud_user_id,
          action: 'automation_disabled',
        });
      } catch (n8nError) {
        console.error('Error sending to N8N:', n8nError);
      }
    }

    return NextResponse.json({ success: true, automation: data.automation });
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

    // Récupérer l'automation depuis user_profiles
    const { data, error } = await supabase
      .from('user_profiles')
      .select('automation')
      .eq('id', user.id)
      .single();

    if (error) {
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

