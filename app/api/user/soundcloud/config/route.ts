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
      .from('soundcloud_users')
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

    const { styles, max_followings, follow_unfollow, auto_repost, engage_with_artists } = await request.json();

    // Valider styles si fourni
    if (styles !== undefined) {
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
    }

    // Valider max_followings si fourni
    if (max_followings !== undefined && max_followings !== null) {
      const maxFollowingsNum = parseInt(max_followings, 10);
      if (isNaN(maxFollowingsNum) || maxFollowingsNum < 0) {
        return NextResponse.json(
          { error: 'max_followings must be a positive integer or null' },
          { status: 400 }
        );
      }
    }

    // Valider follow_unfollow si fourni
    if (follow_unfollow !== undefined && typeof follow_unfollow !== 'boolean') {
      return NextResponse.json(
        { error: 'follow_unfollow must be a boolean' },
        { status: 400 }
      );
    }

    // Valider auto_repost si fourni
    if (auto_repost !== undefined && typeof auto_repost !== 'boolean') {
      return NextResponse.json(
        { error: 'auto_repost must be a boolean' },
        { status: 400 }
      );
    }

    // Valider engage_with_artists si fourni
    if (engage_with_artists !== undefined && typeof engage_with_artists !== 'boolean') {
      return NextResponse.json(
        { error: 'engage_with_artists must be a boolean' },
        { status: 400 }
      );
    }

    // Vérifier si une configuration existe déjà
    const { data: existingConfig } = await supabase
      .from('soundcloud_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existingConfig) {
      // Mettre à jour la configuration existante
      const updateData: any = {};
      if (styles !== undefined) {
        updateData.styles = styles;
      }
      if (max_followings !== undefined) {
        updateData.max_followings = max_followings === null || max_followings === '' ? null : parseInt(max_followings, 10);
      }
      if (follow_unfollow !== undefined) {
        updateData.follow_unfollow = follow_unfollow;
      }
      if (auto_repost !== undefined) {
        updateData.auto_repost = auto_repost;
      }
      if (engage_with_artists !== undefined) {
        updateData.engage_with_artists = engage_with_artists;
      }
      
      const { data, error } = await supabase
        .from('soundcloud_users')
        .update(updateData)
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
      const insertData: any = {
        user_id: user.id,
      };
      if (styles !== undefined) {
        insertData.styles = styles;
      } else {
        insertData.styles = [];
      }
      if (max_followings !== undefined) {
        insertData.max_followings = max_followings === null || max_followings === '' ? null : parseInt(max_followings, 10);
      }
      if (follow_unfollow !== undefined) {
        insertData.follow_unfollow = follow_unfollow;
      }
      if (auto_repost !== undefined) {
        insertData.auto_repost = auto_repost;
      }
      if (engage_with_artists !== undefined) {
        insertData.engage_with_artists = engage_with_artists;
      }
      
      const { data, error } = await supabase
        .from('soundcloud_users')
        .insert(insertData)
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

