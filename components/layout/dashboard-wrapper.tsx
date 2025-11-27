'use client'

import { usePathname } from 'next/navigation'
import { Header } from './header'
import { LanguageBanner } from './language-banner'
import { Footer } from './footer'

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/music/dashboard')

  if (isDashboard) {
    // Pas de Header, LanguageBanner ni Footer pour le dashboard
    return <>{children}</>
  }

  return (
    <>
      <LanguageBanner />
      <Header />
      {children}
      <Footer />
    </>
  )
}

