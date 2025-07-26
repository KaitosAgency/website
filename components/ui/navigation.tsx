"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import { ArrowIcon } from "@/components/ui/arrow-icon"

const navigationItems = [
  { name: "Solutions", href: "#solutions", description: "Découvrez nos solutions IA" },
  { name: "Secteurs", href: "#secteurs", description: "Secteurs d'activité" },
  { name: "Tech", href: "#tech", description: "Technologies et expertise" },
]

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="absolute top-0 left-0 w-full flex items-center justify-between px-6 md:px-12 pt-8 z-20">
      {/* Langues à gauche */}
      <div className="hidden md:flex gap-4 text-xs text-white/80 tracking-widest">
        <Link href="#" className="hover:text-white transition-colors" aria-label="Version française">
          FR
        </Link>
        <span>|</span>
        <Link href="#" className="hover:text-white transition-colors" aria-label="English version">
          EN
        </Link>
        <span>|</span>
        <Link href="#" className="hover:text-white transition-colors" aria-label="日本語版">
          JP
        </Link>
      </div>

      {/* Navigation principale - Desktop - Centrée absolument */}
      <nav className="hidden md:flex absolute left-1/2 top-8 transform -translate-x-1/2 items-center gap-6" role="navigation" aria-label="Navigation principale">
        <Link href="/" className="flex-shrink-0">
          <Image 
            src="/images/Logo/logo_kaitos_full.svg" 
            alt="Kaitos - Agence IA Française" 
            width={120} 
            height={32}
            priority
          />
        </Link>
        
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-white/80 hover:text-white transition-colors font-normal text-sm"
            title={item.description}
          >
            {item.name}
          </Link>
        ))}
        
        <Button variant="link" className="text-primary font-medium hover:text-offwhite flex items-center gap-1 p-0">
          Réserver un appel
          <ArrowIcon size={14} />
        </Button>
      </nav>

      {/* Menu mobile */}
      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-black/95 border-l border-white/20">
            <div className="flex flex-col h-full">
              {/* Logo dans le menu mobile */}
              <div className="flex justify-center py-6 border-b border-white/20">
                <Image 
                  src="/images/Logo/logo_kaitos_full_light.svg" 
                  alt="Kaitos" 
                  width={100} 
                  height={26}
                />
              </div>
              
              {/* Navigation mobile */}
              <nav className="flex-1 py-8" role="navigation" aria-label="Menu mobile">
                <ul className="space-y-6">
                  {navigationItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="block text-white/90 hover:text-white text-lg font-medium transition-colors"
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
              <div className="border-t border-white/20 pt-6">
                <Button 
                  variant="default" 
                  className="w-full bg-orange-400 text-white hover:bg-orange-500"
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
            src="/images/Logo/logo_kaitos_full.svg" 
            alt="Kaitos" 
            width={100} 
            height={26}
            priority
          />
        </Link>
      </div>
    </header>
  )
} 