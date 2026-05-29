"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Languages, Copy, Loader2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { getTranslation, type Language } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import { toast } from "sonner"

export default function TranslationPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>("en")
  const t = (key: string) => getTranslation(language, key)

  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)

  // Simulated translation function (in real app, this would call an API)
  const handleTranslate = async () => {
    if (!inputText.trim()) return

    setIsTranslating(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock translation - in real app, this would use Google Translate API or similar
    const mockTranslations: Record<string, string> = {
      你好: "こんにちは",
      謝謝: "ありがとうございます",
      不好意思: "すみません",
      "多少錢？": "いくらですか？",
      "洗手間在哪裡？": "トイレはどこですか？",
      請幫幫我: "助けてください",
      很好吃: "美味しいです",
      請結帳: "お会計お願いします",
    }

    setOutputText(mockTranslations[inputText] || "翻譯結果 (Translation result)")
    setIsTranslating(false)
  }

  const handleClear = () => {
    setInputText("")
    setOutputText("")
  }

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText)
      toast.success(t("translationPage.copied"))
    }
  }

  const handlePhraseClick = (phrase: string) => {
    setInputText(phrase)
    setOutputText("")
  }

  const commonPhrases = [
    { key: "hello", text: t("translationPage.phrases.hello"), translation: t("translationPage.translations.hello") },
    {
      key: "thankYou",
      text: t("translationPage.phrases.thankYou"),
      translation: t("translationPage.translations.thankYou"),
    },
    {
      key: "excuse",
      text: t("translationPage.phrases.excuse"),
      translation: t("translationPage.translations.excuse"),
    },
    {
      key: "howMuch",
      text: t("translationPage.phrases.howMuch"),
      translation: t("translationPage.translations.howMuch"),
    },
    {
      key: "whereIs",
      text: t("translationPage.phrases.whereIs"),
      translation: t("translationPage.translations.whereIs"),
    },
    { key: "help", text: t("translationPage.phrases.help"), translation: t("translationPage.translations.help") },
    {
      key: "delicious",
      text: t("translationPage.phrases.delicious"),
      translation: t("translationPage.translations.delicious"),
    },
    { key: "bill", text: t("translationPage.phrases.bill"), translation: t("translationPage.translations.bill") },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-14 items-center justify-between px-3 sm:h-16 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="h-8 w-8 sm:h-9 sm:w-9">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary sm:h-10 sm:w-10">
              <Languages className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground sm:text-lg">{t("translationPage.title")}</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">{t("translationPage.subtitle")}</p>
            </div>
          </div>
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-3 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
          {/* Translation Card */}
          <Card className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Language Labels */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {t("translationPage.sourceLanguage")}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {t("translationPage.targetLanguage")}
                  </Badge>
                </div>
              </div>

              {/* Input and Output Areas */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Input */}
                <div className="relative">
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t("translationPage.inputPlaceholder")}
                    className="min-h-[200px] resize-none text-base"
                  />
                  {inputText && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClear}
                      className="absolute right-2 top-2 h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Output */}
                <div className="relative">
                  <Textarea
                    value={outputText}
                    readOnly
                    placeholder={t("translationPage.outputPlaceholder")}
                    className="min-h-[200px] resize-none bg-muted text-base"
                  />
                  {outputText && (
                    <Button variant="ghost" size="icon" onClick={handleCopy} className="absolute right-2 top-2 h-6 w-6">
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleTranslate} disabled={!inputText.trim() || isTranslating} className="flex-1">
                  {isTranslating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("translationPage.translating")}
                    </>
                  ) : (
                    <>
                      <Languages className="mr-2 h-4 w-4" />
                      {t("translationPage.translate")}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleClear} disabled={!inputText && !outputText}>
                  {t("translationPage.clear")}
                </Button>
              </div>
            </div>
          </Card>

          {/* Common Phrases */}
          <Card className="p-4 sm:p-6">
            <h2 className="mb-4 text-base font-semibold sm:text-lg">{t("translationPage.commonPhrases")}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {commonPhrases.map((phrase) => (
                <button
                  key={phrase.key}
                  onClick={() => handlePhraseClick(phrase.text)}
                  className="group rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
                >
                  <div className="text-sm font-medium text-foreground">{phrase.text}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{phrase.translation}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
