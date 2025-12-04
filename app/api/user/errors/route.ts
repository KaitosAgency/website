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

    // Récupérer toutes les erreurs
    const { data: errors, error: errorsError } = await supabase
      .from('errors_n8n')
      .select('*')
      .order('created_at', { ascending: false });

    if (errorsError) {
      console.error('Error fetching errors:', errorsError);
      return NextResponse.json(
        { error: 'Failed to fetch errors' },
        { status: 500 }
      );
    }

    // Grouper les erreurs par plateforme
    const groupedErrors: Record<string, any[]> = {
      soundcloud: [],
      other: [],
    };

    errors?.forEach((error) => {
      if (error.soundcloud_error) {
        groupedErrors.soundcloud.push({
          ...error,
          platform: 'soundcloud',
          error_message: error.soundcloud_error,
        });
      } else {
        groupedErrors.other.push({
          ...error,
          platform: 'other',
          error_message: null,
        });
      }
    });

    return NextResponse.json({ errors: groupedErrors });
  } catch (error: any) {
    console.error('Error in errors route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

