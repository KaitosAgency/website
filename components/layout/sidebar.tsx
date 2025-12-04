'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/contexts/auth-context'
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  User,
  HelpCircle,
  Music,
  Shield,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const sidebarItems: SidebarItem[] = [
  { name: 'Tableau de bord', href: '/music/dashboard', icon: LayoutDashboard },
  { name: 'SoundCloud', href: '/music/dashboard/soundcloud', icon: Music },
]

const adminItems: SidebarItem[] = [
  { name: 'Admin SoundCloud', href: '/music/dashboard/admin/soundcloud-config', icon: Shield },
  { name: 'Erreurs', href: '/music/dashboard/admin/errors', icon: AlertCircle },
]

const bottomItems: SidebarItem[] = [
  { name: 'Support', href: '/support', icon: HelpCircle },
  { name: 'Paramètres', href: '/settings', icon: Settings },
  { name: 'Profil', href: '/profile', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, loading } = useAuth()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 border-b border-gray-200 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-secondary">Kaitos</span>
        </Link>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-secondary"
                  : "text-gray-700 hover:bg-gray-50 hover:text-secondary"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}

        {/* Menu Admin - affiché uniquement pour les administrateurs */}
        {!loading && isAdmin === true && (
          <>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Administration
              </p>
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-100 text-secondary"
                      : "text-gray-700 hover:bg-gray-50 hover:text-secondary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Navigation secondaire */}
      <div className="border-t border-gray-200 px-4 py-4 space-y-2">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-secondary"
                  : "text-gray-700 hover:bg-gray-50 hover:text-secondary"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
        
        {/* Bouton déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-secondary transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}

