"use client"

import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"
import type { Language } from "@/lib/i18n"

interface LanguageSwitcherProps {
  currentLanguage: Language
  onLanguageChange: (lang: Language) => void
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onLanguageChange(currentLanguage === "en" ? "zh" : "en")}
      className="gap-2"
    >
      <Languages className="h-4 w-4" />
      <span className="text-sm">{currentLanguage === "en" ? "中文" : "EN"}</span>
    </Button>
  )
}
