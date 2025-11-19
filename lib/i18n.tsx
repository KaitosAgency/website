"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Language = "fr" | "en" | "jp"

interface Translations {
  [key: string]: any
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const translations: Record<Language, Translations> = {
  fr: require("./translations/fr.json"),
  en: require("./translations/en.json"),
  jp: require("./translations/jp.json"),
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr")

  useEffect(() => {
    // Récupérer la langue depuis localStorage ou utiliser 'fr' par défaut
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang && (savedLang === "fr" || savedLang === "en" || savedLang === "jp")) {
      setLanguageState(savedLang)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
    // Mettre à jour l'attribut lang du HTML
    document.documentElement.lang = lang
  }

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Fallback vers le français si la clé n'existe pas
        value = translations.fr
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            return key // Retourner la clé si aucune traduction n'est trouvée
          }
        }
        break
      }
    }
    
    return typeof value === "string" ? value : key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

