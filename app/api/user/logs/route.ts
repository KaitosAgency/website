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

    // Vérifier que l'utilisateur est admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('type')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.type !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Récupérer toutes les entrées de logs
    const { data: logs, error: logsError } = await supabase
      .from('music_logs' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: 500 }
      );
    }

    // Grouper les logs par plateforme
    const groupedLogs: Record<string, any[]> = {
      soundcloud: [],
      other: [],
    };

    (logs as any[])?.forEach((log) => {
      // Si c'est un log ou une erreur SoundCloud
      if (log.soundcloud_error || log.soundcloud_logs) {
        groupedLogs.soundcloud.push({
          ...log,
          platform: 'soundcloud',
          error_message: log.soundcloud_error,
          log_message: log.soundcloud_logs,
        });
      } else {
        groupedLogs.other.push({
          ...log,
          platform: 'other',
          error_message: null,
          log_message: null,
        });
      }
    });

    return NextResponse.json({ errors: groupedLogs });
  } catch (error: any) {
    console.error('Error in errors route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

