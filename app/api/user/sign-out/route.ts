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
    // On ne fait pas échouer la déconnexion si N8N échoue
  }
}

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

    // Récupérer le profil utilisateur et les données SoundCloud avant de les supprimer
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('email, fullname')
      .eq('id', user.id)
      .single();

    // Récupérer les données SoundCloud existantes pour notifier N8N si nécessaire
    const { data: soundcloudUserData } = await supabase
      .from('soundcloud_users')
      .select('access_token, automation')
      .eq('user_id', user.id)
      .single();

    // Si l'automation était activée, notifier N8N avant de la désactiver
    if (soundcloudUserData?.automation && soundcloudUserData?.access_token && profile) {
      try {
        await sendToN8N({
          userId: user.id,
          email: profile.email,
          fullname: profile.fullname,
          soundcloudAccessToken: soundcloudUserData.access_token,
          soundcloudUserId: null,
          action: 'automation_disabled',
        });
      } catch (n8nError) {
        console.error('Error sending to N8N:', n8nError);
        // On continue même si l'envoi à N8N échoue
      }
    }

    // Mettre à jour soundcloud_users : mettre à null les tokens et désactiver l'automation
    const { error: updateError } = await supabase
      .from('soundcloud_users')
      .update({
        access_token: null,
        refresh_token: null,
        automation: false,
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating soundcloud_users:', updateError);
      // On continue même si la mise à jour échoue (peut-être que l'utilisateur n'a pas de ligne dans soundcloud_users)
    }

    // Ne pas déconnecter l'utilisateur de Supabase, seulement SoundCloud
    // L'utilisateur reste connecté au dashboard

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in sign-out route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

