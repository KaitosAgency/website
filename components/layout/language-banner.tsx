"use client"

import { useI18n } from "@/lib/i18n"

export function LanguageBanner() {
  const { t } = useI18n()
  
  return (
    <div className="fixed top-0 left-0 right-0 h-5 bg-primary z-50 flex items-center justify-center">
      <span className="text-white text-xs font-normal">{t("common.siteUnderConstruction")}</span>
    </div>
  )
}

