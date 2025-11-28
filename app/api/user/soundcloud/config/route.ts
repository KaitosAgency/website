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

    // Récupérer la configuration SoundCloud de l'utilisateur
    const { data, error } = await supabase
      .from('soundcloud')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching soundcloud config:', error);
      return NextResponse.json(
        { error: 'Failed to fetch configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      config: data || null 
    });
  } catch (error: any) {
    console.error('Error in soundcloud config route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const { styles } = await request.json();

    if (!Array.isArray(styles)) {
      return NextResponse.json(
        { error: 'Styles must be an array' },
        { status: 400 }
      );
    }

    if (styles.length > 3) {
      return NextResponse.json(
        { error: 'Maximum 3 styles allowed' },
        { status: 400 }
      );
    }

    // Vérifier si une configuration existe déjà
    const { data: existingConfig } = await supabase
      .from('soundcloud')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existingConfig) {
      // Mettre à jour la configuration existante
      const { data, error } = await supabase
        .from('soundcloud')
        .update({ styles })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating soundcloud config:', error);
        return NextResponse.json(
          { error: 'Failed to update configuration' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Créer une nouvelle configuration
      const { data, error } = await supabase
        .from('soundcloud')
        .insert({
          user_id: user.id,
          styles,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating soundcloud config:', error);
        return NextResponse.json(
          { error: 'Failed to create configuration' },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json({ 
      success: true,
      config: result 
    });
  } catch (error: any) {
    console.error('Error in soundcloud config route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}



