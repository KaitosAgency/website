'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { useAuth } from '@/lib/contexts/auth-context'
import { useI18n } from '@/lib/i18n'
import { Globe } from 'lucide-react'

interface DashboardProps {
  title: string
  children: ReactNode
  headerActions?: ReactNode
}

type Language = 'en' | 'fr' | 'jp'

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'jp', name: '日本語', flag: '🇯🇵' },
]

export function Dashboard({ title, children, headerActions }: DashboardProps) {
  const { user } = useAuth()
  const { language, setLanguage } = useI18n()
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Extraire le nom de l'utilisateur
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  const currentLang = languages.find(l => l.code === language) || languages[0]

  return (
    <div className="min-h-screen bg-gray-50" data-dashboard="music">
      <Sidebar />

      {/* Contenu principal */}
      <main className="ml-64 min-h-screen flex flex-col">
        {/* Header - Barre utilisateur */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-4 flex items-center justify-end gap-4">
            {/* Sélecteur de langue */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Change language"
              >
                <Globe className="h-4 w-4" />
                <span>{currentLang.flag}</span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code)
                        setIsLangMenuOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${language === lang.code
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nom utilisateur */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">{userName}</span>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <div className="flex-1 flex">
          <div className="flex-1 p-8">
            {/* Titre de la page */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-semibold text-secondary">{title}</h1>
              {headerActions && (
                <div className="flex items-center gap-4">
                  {headerActions}
                </div>
              )}
            </div>

            {/* Contenu de la page */}
            {children}
          </div>

          {/* Colonne droite hachurée */}
          <div
            className="hidden lg:block w-16 xl:w-64 shrink-0"
            style={{
              backgroundImage: 'linear-gradient(to bottom left, transparent, #f9fafb), repeating-linear-gradient(45deg, transparent, transparent 10px, #f3f4f6 10px, #f3f4f6 21px)'
            }}
          />
        </div>
      </main>
    </div>
  )
}







