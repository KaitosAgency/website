import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/supabase/supabase-types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const isProduction = process.env.NODE_ENV === 'production'
    const envHint = isProduction
      ? 'Please configure these variables in your deployment platform or .env.production file'
      : 'Please check your .env.local file'
    
    // En production, on log l'erreur mais on retourne un client avec des valeurs vides
    // pour éviter de casser l'application complètement
    if (isProduction) {
      console.error(
        `Missing Supabase environment variables. ${envHint}.\n` +
        'Required variables:\n' +
        '  - NEXT_PUBLIC_SUPABASE_URL\n' +
        '  - NEXT_PUBLIC_SUPABASE_ANON_KEY\n\n' +
        'Get these values from: https://supabase.com/dashboard/project/_/settings/api'
      )
      // Retourner un client avec des valeurs vides pour éviter le crash
      // Les appels API échoueront mais l'application ne plantera pas
      return createBrowserClient<Database>(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder-key'
      )
    }
    
    throw new Error(
      `Missing Supabase environment variables. ${envHint}.\n` +
      'Required variables:\n' +
      '  - NEXT_PUBLIC_SUPABASE_URL\n' +
      '  - NEXT_PUBLIC_SUPABASE_ANON_KEY\n\n' +
      'Get these values from: https://supabase.com/dashboard/project/_/settings/api'
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

