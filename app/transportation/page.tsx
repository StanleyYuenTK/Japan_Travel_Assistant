"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Train, AlertCircle } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { getTranslation, type Language } from "@/lib/i18n"
import { useRouter } from "next/navigation"

export default function TransportationPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>("en")
  const t = (key: string) => getTranslation(language, key)

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-14 items-center justify-between px-3 sm:h-16 sm:px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div>
              <h1 className="text-sm font-semibold text-foreground sm:text-lg">{t("transportationPage.title")}</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">{t("transportationPage.subtitle")}</p>
            </div>
          </div>
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-6 p-3 sm:p-6">
          {/* Map Section */}
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
              <svg viewBox="0 0 1000 800" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                {/* Background */}
                <rect width="1000" height="800" fill="#ffffff" />

                {/* Styles */}
                <defs>
                  <style>{`
                    .ginza-line { stroke: #A40930; stroke-width: 4; }
                    .marunouchi-line { stroke: #DC241F; stroke-width: 4; }
                    .chiyoda-line { stroke: #00AE51; stroke-width: 4; }
                    .hibiya-line { stroke: #9CA3AF; stroke-width: 4; }
                    .shinjuku-line { stroke: #F39C12; stroke-width: 4; }
                    .tozai-line { stroke: #0066CC; stroke-width: 4; }
                    .hanzomon-line { stroke: #8F47B3; stroke-width: 4; }
                    .fukutoshin-line { stroke: #C41E3A; stroke-width: 4; }
                    .metro-station { fill: white; stroke-width: 2; r: 6; }
                    .metro-station-major { fill: white; stroke-width: 3; r: 8; }
                    .metro-station-text { font-size: 12px; font-weight: 500; fill: #000; }
                    .metro-line-label { font-size: 11px; font-weight: 700; }
                  `}</style>
                </defs>

                {/* Title */}
                <text x="500" y="30" textAnchor="middle" className="metro-line-label" fontSize="16" fill="#333">
                  Tokyo Metro Network
                </text>

                {/* Ginza Line (Red) - Vertical */}
                <line x1="200" y1="80" x2="200" y2="700" className="ginza-line" />

                {/* Marunouchi Line (Red) - Diagonal */}
                <line x1="250" y1="150" x2="250" y2="650" className="marunouchi-line" />

                {/* Chiyoda Line (Green) - Curved */}
                <path
                  d="M 300 200 Q 350 300 320 450 Q 300 550 350 650"
                  className="chiyoda-line"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Hibiya Line (Silver) - Vertical */}
                <line x1="400" y1="100" x2="400" y2="700" className="hibiya-line" />

                {/* Shinjuku Line (Orange) - Zigzag */}
                <polyline
                  points="500,150 500,300 450,350 500,400 480,500 550,600 500,700"
                  className="shinjuku-line"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Tozai Line (Blue) - Horizontal */}
                <line x1="200" y1="550" x2="800" y2="550" className="tozai-line" />

                {/* Hanzomon Line (Purple) - Diagonal */}
                <line x1="300" y1="250" x2="600" y2="550" className="hanzomon-line" />

                {/* Fukutoshin Line (Maroon) - Vertical */}
                <line x1="550" y1="150" x2="550" y2="700" className="fukutoshin-line" />

                {/* Major Stations - Central Hubs */}
                <circle cx="200" cy="280" className="metro-station-major" stroke="#A40930" />
                <text
                  x="200"
                  y="320"
                  textAnchor="middle"
                  className="metro-station-text"
                  fontSize="13"
                  fontWeight="bold"
                >
                  Shinjuku
                </text>

                <circle cx="200" cy="420" className="metro-station-major" stroke="#DC241F" />
                <text
                  x="200"
                  y="460"
                  textAnchor="middle"
                  className="metro-station-text"
                  fontSize="13"
                  fontWeight="bold"
                >
                  Shibuya
                </text>

                <circle cx="400" cy="320" className="metro-station-major" stroke="#333" />
                <text
                  x="400"
                  y="360"
                  textAnchor="middle"
                  className="metro-station-text"
                  fontSize="13"
                  fontWeight="bold"
                >
                  Tokyo Station
                </text>

                {/* Ginza Line Stations */}
                <circle cx="200" cy="150" className="metro-station" stroke="#A40930" />
                <text x="170" y="155" className="metro-station-text">
                  Ueno
                </text>

                <circle cx="200" cy="200" className="metro-station" stroke="#A40930" />
                <text x="160" y="205" className="metro-station-text">
                  Asakusa
                </text>

                <circle cx="200" cy="500" className="metro-station" stroke="#A40930" />
                <text x="170" y="505" className="metro-station-text">
                  Ginza
                </text>

                <circle cx="200" cy="600" className="metro-station" stroke="#A40930" />
                <text x="160" y="605" className="metro-station-text">
                  Roppongi
                </text>

                {/* Marunouchi Line Stations */}
                <circle cx="250" cy="200" className="metro-station" stroke="#DC241F" />
                <text x="250" y="185" textAnchor="middle" className="metro-station-text">
                  Ikebukuro
                </text>

                <circle cx="250" cy="400" className="metro-station" stroke="#DC241F" />
                <text x="270" y="405" className="metro-station-text">
                  Ginza
                </text>

                <circle cx="250" cy="600" className="metro-station" stroke="#DC241F" />
                <text x="250" y="625" textAnchor="middle" className="metro-station-text">
                  Shinjuku
                </text>

                {/* Chiyoda Line Stations */}
                <circle cx="300" cy="250" className="metro-station" stroke="#00AE51" />
                <text x="300" y="235" textAnchor="middle" className="metro-station-text">
                  Otemachi
                </text>

                <circle cx="320" cy="450" className="metro-station" stroke="#00AE51" />
                <text x="320" y="475" textAnchor="middle" className="metro-station-text">
                  Roppongi
                </text>

                <circle cx="350" cy="650" className="metro-station" stroke="#00AE51" />
                <text x="350" y="675" textAnchor="middle" className="metro-station-text">
                  Ayoama
                </text>

                {/* Hibiya Line Stations */}
                <circle cx="400" cy="180" className="metro-station" stroke="#9CA3AF" />
                <text x="430" y="185" className="metro-station-text">
                  Nihombashi
                </text>

                <circle cx="400" cy="380" className="metro-station" stroke="#9CA3AF" />
                <text x="430" y="385" className="metro-station-text">
                  Hibiya
                </text>

                <circle cx="400" cy="580" className="metro-station" stroke="#9CA3AF" />
                <text x="430" y="585" className="metro-station-text">
                  Harajuku
                </text>

                {/* Shinjuku Line Stations */}
                <circle cx="500" cy="200" className="metro-station" stroke="#F39C12" />
                <text x="530" y="205" className="metro-station-text">
                  Koshu
                </text>

                <circle cx="500" cy="400" className="metro-station" stroke="#F39C12" />
                <text x="530" y="405" className="metro-station-text">
                  Yotsuya
                </text>

                <circle cx="500" cy="650" className="metro-station" stroke="#F39C12" />
                <text x="530" y="655" className="metro-station-text">
                  Shinjuku-3
                </text>

                {/* Tozai Line Stations */}
                <circle cx="300" cy="550" className="metro-station" stroke="#0066CC" />
                <text x="300" y="575" textAnchor="middle" className="metro-station-text">
                  Nakano
                </text>

                <circle cx="500" cy="550" className="metro-station" stroke="#0066CC" />
                <text x="500" y="575" textAnchor="middle" className="metro-station-text">
                  Tsukiji
                </text>

                <circle cx="700" cy="550" className="metro-station" stroke="#0066CC" />
                <text x="700" y="575" textAnchor="middle" className="metro-station-text">
                  Kaihin
                </text>

                {/* Hanzomon Line Stations */}
                <circle cx="400" cy="400" className="metro-station" stroke="#8F47B3" />
                <text x="400" y="425" textAnchor="middle" className="metro-station-text">
                  Hanzomon
                </text>

                <circle cx="550" cy="500" className="metro-station" stroke="#8F47B3" />
                <text x="580" y="505" className="metro-station-text">
                  Meguro
                </text>

                {/* Fukutoshin Line Stations */}
                <circle cx="550" cy="250" className="metro-station" stroke="#C41E3A" />
                <text x="580" y="255" className="metro-station-text">
                  Meiji
                </text>

                <circle cx="550" cy="450" className="metro-station" stroke="#C41E3A" />
                <text x="580" y="455" className="metro-station-text">
                  Sendagi
                </text>

                {/* Legend Box */}
                <rect x="750" y="80" width="220" height="200" fill="#f0f0f0" stroke="#999" strokeWidth="1" rx="5" />
                <text x="760" y="100" className="metro-line-label" fontSize="12">
                  Metro Lines
                </text>

                <line x1="760" y1="120" x2="800" y2="120" className="ginza-line" />
                <text x="810" y="125" className="metro-station-text" fontSize="11">
                  Ginza
                </text>

                <line x1="760" y1="145" x2="800" y2="145" className="marunouchi-line" />
                <text x="810" y="150" className="metro-station-text" fontSize="11">
                  Marunouchi
                </text>

                <line x1="760" y1="170" x2="800" y2="170" className="chiyoda-line" />
                <text x="810" y="175" className="metro-station-text" fontSize="11">
                  Chiyoda
                </text>

                <line x1="760" y1="195" x2="800" y2="195" className="hibiya-line" />
                <text x="810" y="200" className="metro-station-text" fontSize="11">
                  Hibiya
                </text>

                <line x1="760" y1="220" x2="800" y2="220" className="shinjuku-line" />
                <text x="810" y="225" className="metro-station-text" fontSize="11">
                  Shinjuku
                </text>

                <line x1="760" y1="245" x2="800" y2="245" className="tozai-line" />
                <text x="810" y="250" className="metro-station-text" fontSize="11">
                  Tozai
                </text>
              </svg>
            </div>
          </Card>

          {/* Overview Section */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">{t("transportationPage.overview")}</h2>
            <Card className="space-y-3 p-4 sm:space-y-4 sm:p-6">
              <div className="flex gap-3 sm:gap-4">
                <Train className="h-6 w-6 shrink-0 text-primary sm:h-8 sm:w-8" />
                <div>
                  <h3 className="font-semibold text-foreground">{t("transportationPage.tokyoMetro")}</h3>
                  <p className="text-sm text-muted-foreground">{t("transportationPage.tokyoMetroDesc")}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Major Stations */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">{t("transportationPage.stations")}</h2>
            <div className="grid gap-3 sm:gap-4">
              {[
                {
                  name: "transportationPage.shinjuku",
                  desc: "transportationPage.shinjukuDesc",
                  color: "bg-orange-100",
                  icon: "🚉",
                },
                {
                  name: "transportationPage.shibuya",
                  desc: "transportationPage.shibuyaDesc",
                  color: "bg-green-100",
                  icon: "🚇",
                },
                {
                  name: "transportationPage.tokyo",
                  desc: "transportationPage.tokyoDesc",
                  color: "bg-red-100",
                  icon: "🚄",
                },
              ].map((station, idx) => (
                <Card key={idx} className={`flex gap-3 border-l-4 p-4 sm:gap-4 sm:p-6 ${station.color}`}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-xl">
                    {station.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{t(station.name)}</h3>
                    <p className="text-sm text-muted-foreground">{t(station.desc)}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Popular Routes */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">{t("transportationPage.routes")}</h2>
            <div className="grid gap-3 sm:gap-4">
              {[
                "transportationPage.route1",
                "transportationPage.route2",
                "transportationPage.route3",
                "transportationPage.route4",
              ].map((route, idx) => (
                <Card key={idx} className="flex gap-3 border-l-4 border-blue-500 bg-blue-50 p-4 sm:gap-4 sm:p-6">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500 mt-1.5" />
                  <p className="text-sm text-foreground">{t(route)}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Transportation Tips */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">{t("transportationPage.tips")}</h2>
            <div className="grid gap-3 sm:gap-4">
              {[
                "transportationPage.tip1",
                "transportationPage.tip2",
                "transportationPage.tip3",
                "transportationPage.tip4",
                "transportationPage.tip5",
              ].map((tip, idx) => (
                <Card key={idx} className="flex gap-3 border-l-4 border-amber-500 bg-amber-50 p-4 sm:gap-4 sm:p-6">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                  <p className="text-sm text-foreground">{t(tip)}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="py-4 text-center text-xs text-muted-foreground">
            <p>
              {t("transportationPage.lastUpdated")}{" "}
              {new Date().toLocaleDateString(language === "zh" ? "zh-HK" : "en-US")}
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
