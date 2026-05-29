"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle, ArrowLeft, AlertCircle, MapPin, Newspaper } from "lucide-react"
import { useRouter } from "next/navigation"
import { LanguageSwitcher } from "@/components/language-switcher"
import { getTranslation, type Language } from "@/lib/i18n"

export default function JapanNewsPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>("en")
  const t = (key: string) => getTranslation(language, key)

  const bearSightings = [
    {
      id: 1,
      title: t("japanNewsPage.bearIncident1"),
      description: t("japanNewsPage.bearIncident1Desc"),
      level: "high",
      date: "2024-11-02",
      location: "Hokkaido",
    },
    {
      id: 2,
      title: t("japanNewsPage.bearIncident2"),
      description: t("japanNewsPage.bearIncident2Desc"),
      level: "high",
      date: "2024-10-28",
      location: "Yamanashi Prefecture",
    },
  ]

  const dangerousAreas = [
    {
      id: 1,
      title: t("japanNewsPage.dangerousArea1"),
      description: t("japanNewsPage.dangerousArea1Desc"),
      level: "high",
      icon: "wildlife",
    },
    {
      id: 2,
      title: t("japanNewsPage.dangerousArea2"),
      description: t("japanNewsPage.dangerousArea2Desc"),
      level: "high",
      icon: "mountain",
    },
    {
      id: 3,
      title: t("japanNewsPage.dangerousArea3"),
      description: t("japanNewsPage.dangerousArea3Desc"),
      level: "medium",
      icon: "typhoon",
    },
  ]

  const recommendations = [
    t("japanNewsPage.rec1"),
    t("japanNewsPage.rec2"),
    t("japanNewsPage.rec3"),
    t("japanNewsPage.rec4"),
    t("japanNewsPage.rec5"),
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 border-red-300 text-red-900"
      case "medium":
        return "bg-yellow-100 border-yellow-300 text-yellow-900"
      case "low":
        return "bg-green-100 border-green-300 text-green-900"
      default:
        return "bg-gray-100 border-gray-300 text-gray-900"
    }
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="flex h-14 items-center justify-between px-3 sm:h-16 sm:px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              <h1 className="text-base font-semibold sm:text-lg">{t("japanNewsPage.title")}</h1>
            </div>
          </div>
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6">
        <p className="mb-6 text-sm text-muted-foreground sm:text-base">{t("japanNewsPage.subtitle")}</p>

        {/* Safety Alert Banner */}
        <Card className="mb-6 border-2 border-orange-200 bg-orange-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-900">{t("japanNewsPage.safetyAlert")}</h3>
              <p className="mt-1 text-sm text-orange-800">
                {language === "en"
                  ? "Always check official warnings before traveling to remote or mountainous areas in Japan."
                  : "在前往日本偏遠或山區地帶前，請務必檢查官方警告。"}
              </p>
            </div>
          </div>
        </Card>

        {/* Bear Sightings Section */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {t("japanNewsPage.bearSightings")}
          </h2>
          <div className="space-y-3">
            {bearSightings.map((item) => (
              <Card key={item.id} className={`border-2 p-4 ${getLevelColor(item.level)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span
                        className={`whitespace-nowrap rounded px-2 py-1 text-xs font-semibold ${getLevelBadgeColor(item.level)}`}
                      >
                        {t(`japanNewsPage.advisoryLevel`)}: {t(`japanNewsPage.${item.level}`)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{item.description}</p>
                    <div className="mt-2 flex gap-4 text-xs font-medium opacity-75">
                      <span>{item.date}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Dangerous Areas Section */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
            <MapPin className="h-5 w-5 text-red-500" />
            {t("japanNewsPage.dangerousAreas")}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {dangerousAreas.map((area) => (
              <Card key={area.id} className={`border-2 p-4 ${getLevelColor(area.level)}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {area.icon === "wildlife" && <AlertTriangle className="h-5 w-5" />}
                    {area.icon === "mountain" && <MapPin className="h-5 w-5" />}
                    {area.icon === "typhoon" && <AlertTriangle className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{area.title}</h3>
                    <p className="mt-2 text-sm">{area.description}</p>
                    <span
                      className={`mt-3 inline-block rounded px-2 py-1 text-xs font-semibold text-white ${getLevelBadgeColor(area.level)}`}
                    >
                      {t(`japanNewsPage.${area.level}`)} {t("japanNewsPage.advisoryLevel")}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Travel Recommendations */}
        <section>
          <h2 className="mb-4 text-lg font-bold sm:text-xl">{t("japanNewsPage.travelRecommendation")}</h2>
          <Card className="bg-blue-50 p-4">
            <ul className="space-y-3">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <div className="mt-8 border-t border-border pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            {t("japanNewsPage.title")} • {t("disasterWarningPage.lastUpdated")} {new Date().toLocaleDateString()}
          </p>
        </div>
      </main>
    </div>
  )
}
