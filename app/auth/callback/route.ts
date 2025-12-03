import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Récupérer l'utilisateur après l'authentification
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Vérifier si le profil existe, sinon le créer
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!profile) {
          // Créer le profil pour les utilisateurs OAuth
          const provider = user.app_metadata?.provider || 'google'
          await supabase.from('user_profiles').insert({
            id: user.id,
            email: user.email!,
            fullname: user.user_metadata?.full_name || user.user_metadata?.name || null,
            provider: provider,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          })
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}







