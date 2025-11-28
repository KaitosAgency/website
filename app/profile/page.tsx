'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/lib/supabase/supabase-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LayoutPage from '@/components/ui/layoutpage'
import { User, Mail, Calendar, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [fullname, setFullname] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const loadProfile = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (userProfile) {
        setProfile(userProfile)
        setFullname(userProfile.fullname || '')
      }

      setLoading(false)
    }

    loadProfile()
  }, [router])

  const handleSave = async () => {
    if (!user || !profile) return

    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('user_profiles')
      .update({ fullname: fullname || null })
      .eq('id', user.id)

    if (!error) {
      setProfile({ ...profile, fullname: fullname || null })
      setEditing(false)
    }

    setSaving(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <LayoutPage>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">Chargement...</div>
        </div>
      </LayoutPage>
    )
  }

  if (!user || !profile) {
    return null
  }

  const displayName = profile.fullname || profile.email?.split('@')[0] || 'Utilisateur'

  return (
    <LayoutPage>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Mon Profil</CardTitle>
            <CardDescription>Gérez vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{displayName}</h3>
                <p className="text-sm text-muted-foreground">{profile.provider === 'google' ? 'Connecté avec Google' : 'Compte email'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <Label>Email</Label>
                  <p className="text-sm mt-1">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <Label>Membre depuis</Label>
                  <p className="text-sm mt-1">
                    {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullname">Nom complet</Label>
                {editing ? (
                  <div className="flex gap-2">
                    <Input
                      id="fullname"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      placeholder="Votre nom complet"
                    />
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setEditing(false)
                      setFullname(profile.fullname || '')
                    }}>
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{profile.fullname || 'Non renseigné'}</p>
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                      Modifier
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t">
              <Button variant="destructive" onClick={handleSignOut} className="w-full sm:w-auto">
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutPage>
  )
}



