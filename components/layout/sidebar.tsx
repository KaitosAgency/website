'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/contexts/auth-context'
import { useI18n } from '@/lib/i18n'
import {
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Music,
  Shield,
  AlertCircle,
  Disc3,
  Folder
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Icônes SVG pour les plateformes
const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
)

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
)

const BandcampIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 18.75l7.437-13.5h16.563l-7.437 13.5h-16.563z" />
  </svg>
)

interface SidebarItem {
  translationKey: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  disabled?: boolean
  comingSoon?: boolean
}

const sidebarItems: SidebarItem[] = [
  { translationKey: 'sidebar.dashboard', href: '/music/dashboard', icon: LayoutDashboard },
  { translationKey: 'sidebar.myTracks', href: '#', icon: Disc3, disabled: true },
  { translationKey: 'sidebar.soundcloud', href: '/music/dashboard/soundcloud', icon: Music },
  { translationKey: 'sidebar.spotify', href: '#', icon: SpotifyIcon, disabled: true, comingSoon: true },
  { translationKey: 'sidebar.bandcamp', href: '#', icon: BandcampIcon, disabled: true, comingSoon: true },
  { translationKey: 'sidebar.youtube', href: '#', icon: YoutubeIcon, disabled: true, comingSoon: true },
  { translationKey: 'sidebar.tiktok', href: '#', icon: TiktokIcon, disabled: true, comingSoon: true },
]

const adminItems: SidebarItem[] = [
  { translationKey: 'sidebar.adminSoundcloud', href: '/music/dashboard/admin/soundcloud-config', icon: Shield },
  { translationKey: 'sidebar.project', href: '/music/dashboard/admin/project', icon: Folder },
  { translationKey: 'sidebar.logs', href: '/music/dashboard/admin/logs', icon: AlertCircle },
]

const bottomItems: SidebarItem[] = [
  { translationKey: 'sidebar.support', href: '#', icon: HelpCircle, disabled: true },
  { translationKey: 'sidebar.settings', href: '#', icon: Settings, disabled: true },
  { translationKey: 'sidebar.profile', href: '#', icon: User, disabled: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, loading } = useAuth()
  const { t } = useI18n()

  const handleLogout = async () => {
    // Nettoyer tous les caches locaux
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('soundcloud_token_status');
        localStorage.removeItem('soundcloud_user_data');
        localStorage.removeItem('soundcloud_config_data');
        localStorage.removeItem('soundcloud_automation');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_is_admin');
        sessionStorage.removeItem('session_data_loaded');
      } catch {
        // Ignorer les erreurs de nettoyage
      }
    }
    const supabase = createClient()
    await supabase.auth.signOut()
    // Forcer un rechargement complet pour réinitialiser tous les états React
    window.location.href = '/'
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 border-b border-gray-200 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/Logo/logo_kaitos_full_gray.svg"
            alt="Kaitos"
            width={100}
            height={32}
            className="h-6 w-auto hover:opacity-75 transition-opacity"
          />
        </Link>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          if (item.disabled) {
            return (
              <div
                key={item.translationKey}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
              >
                <Icon className="h-5 w-5" />
                <span>{t(item.translationKey)}</span>
                {item.comingSoon && (
                  <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                    {t('sidebar.comingSoon')}
                  </span>
                )}
              </div>
            )
          }

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
              <span>{t(item.translationKey)}</span>
            </Link>
          )
        })}

        {/* Menu Admin - affiché uniquement pour les administrateurs */}
        {!loading && isAdmin === true && (
          <>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {t('sidebar.administration')}
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
                  <span>{t(item.translationKey)}</span>
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Navigation secondaire */}
      <div className="border-t border-gray-200 px-4 py-4 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon

          if (item.disabled) {
            return (
              <div
                key={item.translationKey}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
              >
                <Icon className="h-5 w-5" />
                <span>{t(item.translationKey)}</span>
              </div>
            )
          }

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
              <span>{t(item.translationKey)}</span>
            </Link>
          )
        })}

        {/* Bouton déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-secondary transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>{t('sidebar.logout')}</span>
        </button>
      </div>
    </aside>
  )
}

