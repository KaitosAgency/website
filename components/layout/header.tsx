"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { ArrowIcon } from "@/components/ui/arrow-icon"
import { usePathname } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { AuthButton } from "@/components/auth/auth-button"
import { LanguageSelector } from "@/components/layout/language-selector"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === "/"
  const isDarkPage = pathname === "/" || pathname === "/music"
  const { language, setLanguage, t } = useI18n()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLanguageChange = (lang: "fr" | "en" | "jp") => {
    setLanguage(lang)
  }

  // Ne pas afficher sur les pages d'authentification (après tous les hooks)
  if (pathname?.startsWith('/auth')) {
    return null
  }

  const navigationItems = [
    { name: t("navigation.music"), href: "/music", description: "Musique" },
  ]

  return (
    <>
      {/* Header Desktop */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-30 pointer-events-none">
        {/* Sélecteur de langues - En haut à gauche */}
        <div className="absolute top-8 left-12 z-20 pointer-events-auto flex items-center h-[44px]">
          <LanguageSelector isDarkPage={isDarkPage} />
        </div>

        {/* Navigation principale - Centrée */}
        <nav
          className={`absolute left-1/2 top-8 transform -translate-x-1/2 rounded-md px-12 py-2 flex items-center justify-between z-30 transition-all duration-100 min-w-[1152px] pointer-events-auto ${isDarkPage
            ? `!min-w-4 gap-12 bg-secondary ${isScrolled ? '' : 'border-none'}`
            : `bg-white ${isScrolled ? 'border border-secondary/10' : 'border border-white'}`
            }`}
          role="navigation"
          aria-label="Navigation principale"
        >
          <Link href="/" className="flex-shrink-0">
            <Image
              src={isDarkPage ? "/images/Logo/logo_kaitos_full.svg" : "/images/Logo/logo_kaitos_full_dark.svg"}
              alt="Kaitos - Agence IA Française"
              width={120}
              height={32}
              priority
            />
          </Link>
          <div className="flex items-center gap-12">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${isDarkPage ? 'text-white/80 hover:text-white' : 'text-secondary hover:text-primary'} transition-colors font-normal text-md`}
                title={item.description}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <Button
            variant="link"
            className={`${isDarkPage ? 'text-primary hover:text-offwhite' : 'text-secondary hover:text-primary'} font-medium flex items-center gap-1 p-0 text-md`}
          >
            {t("common.reserveCall")}
            <ArrowIcon size={14} />
          </Button>
        </nav>

        {/* Bouton de connexion - En haut à droite */}
        <div className="absolute top-8 right-12 z-20 pointer-events-auto flex items-center h-[44px]">
          <AuthButton isDarkPage={isDarkPage} />
        </div>
      </header>

      {/* Header Mobile avec barre de construction intégrée */}
      <div className={`md:hidden fixed top-0 left-0 w-full z-40 transition-opacity ${isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Barre "Site en construction" */}
        <div className="h-5 bg-primary flex items-center justify-center">
          <span className="text-white text-xs font-normal">{t("common.siteUnderConstruction")}</span>
        </div>

        {/* Header navigation */}
        <header className="w-full flex items-center justify-between px-4 py-1 bg-secondary">
          {/* Bouton menu - taille fixe */}
          <div className="w-12">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="text-primary hover:bg-offwhite/10 p-2 min-w-0 flex items-center justify-center rounded-md transition-colors">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Ouvrir le menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" isHome={isDarkPage} className={`w-[300px] backdrop-blur-md border-r ${isDarkPage
                ? 'bg-secondary/70 border-offwhite/10'
                : 'bg-offwhite/90 border-secondary/10'
                }`}>
                <SheetTitle className="sr-only">Menu de navigation Kaitos</SheetTitle>
                <div className="flex flex-col h-full">
                  {/* Logo dans le menu mobile */}
                  <div className={`flex justify-center items-center py-6 border-b ${isDarkPage ? 'border-white/10' : 'border-secondary/10'
                    }`}>
                    <Image
                      src={isDarkPage ? "/images/Logo/logo_kaitos_full_light.svg" : "/images/Logo/logo_kaitos_full_dark.svg"}
                      alt="Kaitos"
                      width={100}
                      height={26}
                    />
                  </div>

                  {/* Sélection de langue mobile */}
                  <div className={`flex justify-center items-center gap-4 py-4 border-b ${isDarkPage ? 'border-offwhite/10' : 'border-secondary/10'
                    }`}>
                    <div className={`flex gap-4 text-xs tracking-widest ${isDarkPage ? 'text-offwhite/80' : 'text-secondary/80'
                      }`}>
                      <button
                        onClick={() => handleLanguageChange("fr")}
                        className={`font-medium transition-colors ${language === "fr"
                          ? isDarkPage ? 'text-white' : 'text-secondary'
                          : isDarkPage ? 'text-white/60 hover:text-white' : 'text-secondary/60 hover:text-secondary'
                          }`}
                        aria-label="Version française"
                      >
                        FR
                      </button>
                      <span className={isDarkPage ? 'text-white/40' : 'text-secondary/40'}>|</span>
                      <button
                        onClick={() => handleLanguageChange("en")}
                        className={`font-medium transition-colors ${language === "en"
                          ? isDarkPage ? 'text-white' : 'text-secondary'
                          : isDarkPage ? 'text-white/60 hover:text-white' : 'text-secondary/60 hover:text-secondary'
                          }`}
                        aria-label="English version"
                      >
                        EN
                      </button>
                      <span className={isDarkPage ? 'text-white/40' : 'text-secondary/40'}>|</span>
                      <button
                        onClick={() => handleLanguageChange("jp")}
                        className={`font-medium transition-colors ${language === "jp"
                          ? isDarkPage ? 'text-white' : 'text-secondary'
                          : isDarkPage ? 'text-white/60 hover:text-white' : 'text-secondary/60 hover:text-secondary'
                          }`}
                        aria-label="日本語版"
                      >
                        JP
                      </button>
                    </div>
                  </div>

                  {/* Navigation mobile */}
                  <nav className="flex-1 py-8" role="navigation" aria-label="Menu mobile">
                    <ul className="space-y-6">
                      {navigationItems.map((item) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={`block text-lg font-light transition-colors ${isDarkPage ? 'text-white/90 hover:text-white' : 'text-secondary/90 hover:text-secondary'
                              }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            title={item.description}
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  {/* Authentification mobile */}
                  <div className={`border-t pt-6 pb-4 space-y-4 ${isDarkPage ? 'border-white/10' : 'border-secondary/10'
                    }`}>
                    <div className="flex justify-center">
                      <AuthButton isDarkPage={isDarkPage} />
                    </div>
                    <Button
                      variant="default"
                      className="w-full bg-primary text-offwhite hover:bg-offwhite hover:text-secondary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("common.reserveCall")}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo mobile centré */}
          <div className="flex-1 flex justify-center">
            <Link href="/">
              <Image
                src={isDarkPage ? "/images/Logo/logo_kaitos_full.svg" : "/images/Logo/logo_kaitos_full_dark.svg"}
                alt="Kaitos"
                width={100}
                height={26}
                priority
              />
            </Link>
          </div>

          {/* Espace vide pour équilibrer le layout - même largeur que le bouton menu */}
          <div className="w-12" />
        </header>
      </div>
    </>
  )
}

