'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { UserProfile } from '@/lib/supabase/supabase-types'
import { User, LogOut } from 'lucide-react'

interface AuthButtonProps {
  isDarkPage?: boolean
}

export function AuthButton({ isDarkPage = false }: AuthButtonProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Vérifier l'utilisateur actuel
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (currentUser) {
        setUser(currentUser)
        
        // Récupérer le profil utilisateur
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()
        
        if (userProfile) {
          setProfile(userProfile)
        }
      }
      
      setLoading(false)
    }

    checkUser()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        // Récupérer le profil
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data)
          })
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className={`w-24 h-9 ${isDarkPage ? 'bg-white/10' : 'bg-secondary/10'} rounded-md animate-pulse`} />
    )
  }

  if (user && profile) {
    const displayName = profile.fullname || profile.email?.split('@')[0] || 'Utilisateur'
    
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
            isDarkPage
              ? 'text-white/90 hover:text-white hover:bg-white/10'
              : 'text-secondary hover:text-primary hover:bg-secondary/5'
          }`}
        >
          <User className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium max-w-[120px] truncate hidden sm:inline">{displayName}</span>
          <span className="text-sm font-medium sm:hidden">Profil</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className={`h-9 w-9 ${
            isDarkPage
              ? 'text-white/80 hover:text-white hover:bg-white/10'
              : 'text-secondary/80 hover:text-secondary hover:bg-secondary/5'
          }`}
          title="Déconnexion"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      asChild
      variant="link"
      className={`${isDarkPage ? 'text-primary hover:text-offwhite' : 'text-secondary hover:text-primary'} font-medium flex items-center gap-1 p-0 text-md`}
    >
      <Link href="/auth/login">Connexion</Link>
    </Button>
  )
}

