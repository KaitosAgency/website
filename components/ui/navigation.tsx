"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import { ArrowIcon } from "@/components/ui/arrow-icon"
import { usePathname } from "next/navigation"

const navigationItems = [
  { name: "Solutions", href: "#solutions", description: "Découvrez nos solutions IA" },
  { name: "Secteurs", href: "#secteurs", description: "Secteurs d'activité" },
  { name: "Tech", href: "#tech", description: "Technologies et expertise" },
]

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Navigation principale - Desktop - Fixed et centrée */}
      <nav
        className={`hidden rounded-md px-12 py-2 md:flex fixed left-1/2 top-8 transform -translate-x-1/2 items-center justify-between z-30 transition-all duration-100 min-w-[1152px] ${
          isHome
            ? `min-w-4 gap-12 bg-secondary ${isScrolled ? '' : 'border-none'}`
            : `bg-white ${isScrolled ? 'border border-secondary/10' : 'border border-white'}`
        }`}
        role="navigation"
        aria-label="Navigation principale"
      >
        <Link href="/" className="flex-shrink-0">
          <Image
            src={isHome ? "/images/Logo/logo_kaitos_full.svg" : "/images/Logo/logo_kaitos_full_dark.svg"}
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
              className={`${isHome ? 'text-white/80 hover:text-white' : 'text-secondary hover:text-primary'} transition-colors font-normal text-md`}
              title={item.description}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <Button
          variant="link"
          className={`${isHome ? 'text-primary hover:text-offwhite' : 'text-secondary hover:text-primary'} font-medium flex items-center gap-1 p-0 text-md`}
        >
          Réserver un appel
          <ArrowIcon size={14} />
        </Button>
      </nav>

      {/* Menu mobile */}
      <header className="absolute top-0 left-0 w-full flex items-center justify-between px-6 md:px-12 pt-8 z-20 md:hidden">
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="text-primary hover:bg-offwhite/10 py-2 md:py-6 pr-6 pl-2 min-w-0 flex items-center justify-center rounded-md transition-colors">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Ouvrir le menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" isHome={isHome} className={`w-[300px] backdrop-blur-md border-r ${
              isHome 
                ? 'bg-secondary/70 border-offwhite/10' 
                : 'bg-offwhite/90 border-secondary/10'
            }`}>
              <SheetTitle className="sr-only">Menu de navigation Kaitos</SheetTitle>
              <div className="flex flex-col h-full">
                {/* Logo dans le menu mobile */}
                <div className={`flex justify-center items-center py-6 border-b ${
                  isHome ? 'border-white/10' : 'border-secondary/10'
                }`}>
                  <Image 
                    src={isHome ? "/images/Logo/logo_kaitos_full_light.svg" : "/images/Logo/logo_kaitos_full_dark.svg"}
                    alt="Kaitos" 
                    width={100} 
                    height={26}
                  />
                </div>
                
                {/* Sélection de langue mobile */}
                <div className={`flex justify-center items-center gap-4 py-4 border-b ${
                  isHome ? 'border-offwhite/10' : 'border-secondary/10'
                }`}>
                  <div className={`flex gap-4 text-xs tracking-widest ${
                    isHome ? 'text-offwhite/80' : 'text-secondary/80'
                  }`}>
                    <button className={`font-medium ${isHome ? 'text-white' : 'text-secondary'}`} aria-label="Version française">
                      FR
                    </button>
                    <span className={isHome ? 'text-white/40' : 'text-secondary/40'}>|</span>
                    <button className={`hover:transition-colors ${isHome ? 'hover:text-white' : 'hover:text-secondary'}`} aria-label="English version">
                      EN
                    </button>
                    <span className={isHome ? 'text-white/40' : 'text-secondary/40'}>|</span>
                    <button className={`hover:transition-colors ${isHome ? 'hover:text-white' : 'hover:text-secondary'}`} aria-label="日本語版">
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
                          className={`block text-lg font-light transition-colors ${
                            isHome ? 'text-white/90 hover:text-white' : 'text-secondary/90 hover:text-secondary'
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
                
                {/* Bouton CTA mobile */}
                <div className={`border-t pt-6 ${
                  isHome ? 'border-white/10' : 'border-secondary/10'
                }`}>
                  <Button 
                    variant="default" 
                    className="w-full bg-primary text-offwhite hover:bg-offwhite hover:text-secondary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Réserver un appel
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo mobile centré */}
        <div className="md:hidden flex-1 flex justify-center">
          <Link href="/">
            <Image 
              src={isHome ? "/images/Logo/logo_kaitos_full.svg" : "/images/Logo/logo_kaitos_full_dark.svg"}
              alt="Kaitos" 
              width={100} 
              height={26}
              priority
            />
          </Link>
        </div>
        
        {/* Élément invisible pour équilibrer le layout mobile */}
        <div className="md:hidden px-[32px]"></div>
      </header>
    </>
  )
} 