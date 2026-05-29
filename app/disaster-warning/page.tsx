"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, AlertTriangle, Phone, Lightbulb } from "lucide-react"
import { useRouter } from "next/navigation"
import { LanguageSwitcher } from "@/components/language-switcher"
import { getTranslation, type Language } from "@/lib/i18n"

const disasterAlerts = [
  {
    id: 1,
    type: "earthquake",
    severity: "medium",
  },
  {
    id: 2,
    type: "heatWarning",
    severity: "low",
  },
]

export default function DisasterWarningPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>("en")
  const t = (key: string) => getTranslation(language, key)

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-border bg-card">
        <div className="flex h-14 items-center justify-between px-3 sm:h-16 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div>
              <h1 className="text-sm font-semibold text-foreground sm:text-lg">{t("disasterWarningPage.title")}</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">{t("disasterWarningPage.subtitle")}</p>
            </div>
          </div>
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      <ScrollArea className="flex-1 px-3 sm:px-4">
        <div className="mx-auto max-w-2xl py-4 sm:py-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Current Alerts Section */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground sm:text-xl">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                {t("disasterWarningPage.currentAlerts")}
              </h2>

              {disasterAlerts.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {disasterAlerts.map((alert) => (
                    <Card
                      key={alert.id}
                      className={`border-l-4 p-3 sm:p-4 ${
                        alert.severity === "high"
                          ? "border-l-red-500 bg-red-50 dark:bg-red-950"
                          : alert.severity === "medium"
                            ? "border-l-orange-500 bg-orange-50 dark:bg-orange-950"
                            : "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                      }`}
                    >
                      <h3 className="font-semibold text-foreground sm:text-base">
                        {t(`disasterWarningPage.${alert.type}Warning`)}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t(`disasterWarningPage.${alert.type}WarningDesc`)}
                      </p>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-l-4 border-l-green-500 bg-green-50 p-3 dark:bg-green-950 sm:p-4">
                  <p className="text-sm text-muted-foreground">{t("disasterWarningPage.noAlerts")}</p>
                </Card>
              )}
            </div>

            {/* Safety Tips Section */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground sm:text-xl">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                {t("disasterWarningPage.safetyTips")}
              </h2>

              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3, 4, 5].map((tip) => (
                  <Card key={tip} className="border-l-4 border-l-blue-500 bg-blue-50 p-3 dark:bg-blue-950 sm:p-4">
                    <p className="text-sm text-muted-foreground">{t(`disasterWarningPage.tip${tip}`)}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Emergency Contacts Section */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground sm:text-xl">
                <Phone className="h-5 w-5 text-red-500" />
                {t("disasterWarningPage.emergencyContacts")}
              </h2>

              <div className="space-y-2 sm:space-y-3">
                <Card className="flex items-center justify-between border-l-4 border-l-red-500 bg-red-50 p-3 dark:bg-red-950 sm:p-4">
                  <div>
                    <p className="font-semibold text-foreground">{t("disasterWarningPage.police")}</p>
                    <p className="text-sm text-muted-foreground">{t("disasterWarningPage.policeNumber")}</p>
                  </div>
                </Card>

                <Card className="flex items-center justify-between border-l-4 border-l-red-500 bg-red-50 p-3 dark:bg-red-950 sm:p-4">
                  <div>
                    <p className="font-semibold text-foreground">{t("disasterWarningPage.ambulance")}</p>
                    <p className="text-sm text-muted-foreground">{t("disasterWarningPage.ambulanceNumber")}</p>
                  </div>
                </Card>

                <Card className="flex items-center justify-between border-l-4 border-l-red-500 bg-red-50 p-3 dark:bg-red-950 sm:p-4">
                  <div>
                    <p className="font-semibold text-foreground">{t("disasterWarningPage.fireService")}</p>
                    <p className="text-sm text-muted-foreground">{t("disasterWarningPage.fireServiceNumber")}</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
