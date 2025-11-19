"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n"

interface LanguageSelectorProps {
  isDarkPage?: boolean
  className?: string
}

export function LanguageSelector({ isDarkPage = false, className = "" }: LanguageSelectorProps) {
  const { language, setLanguage } = useI18n()

  const handleLanguageChange = (lang: "fr" | "en" | "jp") => {
    setLanguage(lang)
  }

  return (
    <div className={`flex gap-4 text-xs tracking-widest ${className} ${
      isDarkPage ? 'text-white/80' : 'text-secondary/80'
    }`}>
      <button
        onClick={() => handleLanguageChange("fr")}
        className={`hover:text-white transition-colors ${
          language === "fr" ? isDarkPage ? 'text-white font-medium' : 'text-secondary font-medium' : ''
        }`}
        aria-label="Version française"
      >
        FR
      </button>
      <span className={isDarkPage ? 'text-white/40' : 'text-secondary/40'}>|</span>
      <button
        onClick={() => handleLanguageChange("en")}
        className={`hover:text-white transition-colors ${
          language === "en" ? isDarkPage ? 'text-white font-medium' : 'text-secondary font-medium' : ''
        }`}
        aria-label="English version"
      >
        EN
      </button>
      <span className={isDarkPage ? 'text-white/40' : 'text-secondary/40'}>|</span>
      <button
        onClick={() => handleLanguageChange("jp")}
        className={`hover:text-white transition-colors ${
          language === "jp" ? isDarkPage ? 'text-white font-medium' : 'text-secondary font-medium' : ''
        }`}
        aria-label="日本語版"
      >
        JP
      </button>
    </div>
  )
}

