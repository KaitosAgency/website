import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/supabase/supabase-types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const isProduction = process.env.NODE_ENV === 'production'
    const envHint = isProduction
      ? 'Please configure these variables in your deployment platform (Vercel, Netlify, etc.)'
      : 'Please check your .env.local file'
    
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

