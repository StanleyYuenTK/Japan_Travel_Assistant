"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, MapPin, Clock, DollarSign, Utensils, Camera, Train, Languages } from "lucide-react"
import Link from "next/link"
import { type Language, getTranslation } from "@/lib/i18n"

export default function TokyoItineraryPage() {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string) => getTranslation(language, key)

  const itinerary = {
    destination: "Tokyo",
    days: 5,
    budget: "Medium",
    travelers: 2,
    dailyPlans: [
      {
        day: 1,
        titleKey: "itineraryPage.day1Title",
        activities: [
          {
            time: "09:00",
            nameKey: "itineraryPage.arriveNarita",
            descKey: "itineraryPage.arriveNaritaDesc",
            type: "transport",
            cost: "¥3,190",
          },
          {
            time: "11:30",
            nameKey: "itineraryPage.checkInHotel",
            descKey: "itineraryPage.checkInHotelDesc",
            type: "accommodation",
            cost: "¥15,000",
          },
          {
            time: "13:00",
            nameKey: "itineraryPage.lunchIchiran",
            descKey: "itineraryPage.lunchIchiranDesc",
            type: "meal",
            cost: "¥1,200",
          },
          {
            time: "14:30",
            nameKey: "itineraryPage.shibuyaCrossing",
            descKey: "itineraryPage.shibuyaCrossingDesc",
            type: "attraction",
            cost: t("itineraryPage.free"),
          },
          {
            time: "16:00",
            nameKey: "itineraryPage.meijiShrine",
            descKey: "itineraryPage.meijiShrineDesc",
            type: "attraction",
            cost: t("itineraryPage.free"),
          },
          {
            time: "18:30",
            nameKey: "itineraryPage.dinnerHarajuku",
            descKey: "itineraryPage.dinnerHarajukuDesc",
            type: "meal",
            cost: "¥2,500",
          },
        ],
      },
      {
        day: 2,
        titleKey: "itineraryPage.day2Title",
        activities: [
          {
            time: "08:00",
            nameKey: "itineraryPage.breakfastHotel",
            descKey: "itineraryPage.breakfastHotelDesc",
            type: "meal",
            cost: t("itineraryPage.included"),
          },
          {
            time: "09:30",
            nameKey: "itineraryPage.sensojiTemple",
            descKey: "itineraryPage.sensojiTempleDesc",
            type: "attraction",
            cost: t("itineraryPage.free"),
          },
          {
            time: "11:00",
            nameKey: "itineraryPage.nakamise",
            descKey: "itineraryPage.nakamiseDesc",
            type: "attraction",
            cost: "¥3,000",
          },
          {
            time: "13:00",
            nameKey: "itineraryPage.lunchTempura",
            descKey: "itineraryPage.lunchTempuraDesc",
            type: "meal",
            cost: "¥2,800",
          },
          {
            time: "15:00",
            nameKey: "itineraryPage.tokyoSkytree",
            descKey: "itineraryPage.tokyoSkytreeDesc",
            type: "attraction",
            cost: "¥2,100",
          },
          {
            time: "18:00",
            nameKey: "itineraryPage.dinnerCruise",
            descKey: "itineraryPage.dinnerCruiseDesc",
            type: "meal",
            cost: "¥8,500",
          },
        ],
      },
      {
        day: 3,
        titleKey: "itineraryPage.day3Title",
        activities: [
          {
            time: "09:00",
            nameKey: "itineraryPage.tsukijiMarket",
            descKey: "itineraryPage.tsukijiMarketDesc",
            type: "meal",
            cost: "¥3,500",
          },
          {
            time: "11:00",
            nameKey: "itineraryPage.imperialPalace",
            descKey: "itineraryPage.imperialPalaceDesc",
            type: "attraction",
            cost: t("itineraryPage.free"),
          },
          {
            time: "13:00",
            nameKey: "itineraryPage.lunchGinza",
            descKey: "itineraryPage.lunchGinzaDesc",
            type: "meal",
            cost: "¥4,000",
          },
          {
            time: "15:00",
            nameKey: "itineraryPage.shoppingGinza",
            descKey: "itineraryPage.shoppingGinzaDesc",
            type: "attraction",
            cost: "¥10,000",
          },
          {
            time: "18:00",
            nameKey: "itineraryPage.tokyoTower",
            descKey: "itineraryPage.tokyoTowerDesc",
            type: "attraction",
            cost: "¥1,200",
          },
          {
            time: "20:00",
            nameKey: "itineraryPage.dinnerRoppongi",
            descKey: "itineraryPage.dinnerRoppongiDesc",
            type: "meal",
            cost: "¥5,000",
          },
        ],
      },
      {
        day: 4,
        titleKey: "itineraryPage.day4Title",
        activities: [
          {
            time: "07:00",
            nameKey: "itineraryPage.earlyBreakfast",
            descKey: "itineraryPage.earlyBreakfastDesc",
            type: "meal",
            cost: "¥800",
          },
          {
            time: "08:00",
            nameKey: "itineraryPage.busToFuji",
            descKey: "itineraryPage.busToFujiDesc",
            type: "transport",
            cost: "¥2,800",
          },
          {
            time: "11:00",
            nameKey: "itineraryPage.lakeKawaguchi",
            descKey: "itineraryPage.lakeKawaguchiDesc",
            type: "attraction",
            cost: t("itineraryPage.free"),
          },
          {
            time: "13:00",
            nameKey: "itineraryPage.lunchFujiView",
            descKey: "itineraryPage.lunchFujiViewDesc",
            type: "meal",
            cost: "¥3,200",
          },
          {
            time: "15:00",
            nameKey: "itineraryPage.chureitoPagoda",
            descKey: "itineraryPage.chureitoPagodaDesc",
            type: "attraction",
            cost: t("itineraryPage.free"),
          },
          {
            time: "18:00",
            nameKey: "itineraryPage.returnTokyo",
            descKey: "itineraryPage.returnTokyoDesc",
            type: "transport",
            cost: "¥2,800",
          },
          {
            time: "20:30",
            nameKey: "itineraryPage.lateDinner",
            descKey: "itineraryPage.lateDinnerDesc",
            type: "meal",
            cost: "¥3,500",
          },
        ],
      },
      {
        day: 5,
        titleKey: "itineraryPage.day5Title",
        activities: [
          {
            time: "08:00",
            nameKey: "itineraryPage.finalBreakfast",
            descKey: "itineraryPage.finalBreakfastDesc",
            type: "meal",
            cost: t("itineraryPage.included"),
          },
          {
            time: "09:30",
            nameKey: "itineraryPage.akihabara",
            descKey: "itineraryPage.akihabaraDesc",
            type: "attraction",
            cost: "¥5,000",
          },
          {
            time: "12:00",
            nameKey: "itineraryPage.lunchMaidCafe",
            descKey: "itineraryPage.lunchMaidCafeDesc",
            type: "meal",
            cost: "¥2,000",
          },
          {
            time: "14:00",
            nameKey: "itineraryPage.lastShopping",
            descKey: "itineraryPage.lastShoppingDesc",
            type: "attraction",
            cost: "¥4,000",
          },
          {
            time: "16:00",
            nameKey: "itineraryPage.checkoutTransfer",
            descKey: "itineraryPage.checkoutTransferDesc",
            type: "transport",
            cost: "¥3,190",
          },
          {
            time: "19:00",
            nameKey: "itineraryPage.departure",
            descKey: "itineraryPage.departureDesc",
            type: "transport",
            cost: t("itineraryPage.included"),
          },
        ],
      },
    ],
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "transport":
        return <Train className="h-4 w-4" />
      case "meal":
        return <Utensils className="h-4 w-4" />
      case "attraction":
        return <Camera className="h-4 w-4" />
      case "accommodation":
        return <MapPin className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "transport":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "meal":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "attraction":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "accommodation":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const totalCost = itinerary.dailyPlans.reduce((total, day) => {
    return (
      total +
      day.activities.reduce((dayTotal, activity) => {
        const cost = activity.cost.replace(/[¥,]/g, "")
        return dayTotal + (isNaN(Number(cost)) ? 0 : Number(cost))
      }, 0)
    )
  }, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-14 items-center justify-between px-3 sm:h-16 sm:px-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t("itineraryPage.backToChat")}</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "zh" : "en")}
              className="gap-2"
            >
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "en" ? "中文" : "EN"}</span>
            </Button>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {itinerary.days} {t("itineraryPage.days")}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <DollarSign className="h-3 w-3" />¥{totalCost.toLocaleString()}
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6">
          {/* Title Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
              {itinerary.days}
              {t("itineraryPage.dayItinerary").replace("{destination}", itinerary.destination)}
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t("itineraryPage.comprehensivePlan")
                .replace("{travelers}", String(itinerary.travelers))
                .replace("{budget}", t(`itineraryPage.${itinerary.budget.toLowerCase()}`))}
            </p>
          </div>

          {/* Daily Plans */}
          <div className="space-y-6 sm:space-y-8">
            {itinerary.dailyPlans.map((day) => (
              <Card key={day.day} className="overflow-hidden">
                <div className="bg-primary/5 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                        {t("itineraryPage.day").replace("{day}", String(day.day))}
                      </h2>
                      <p className="text-sm text-muted-foreground sm:text-base">{t(day.titleKey)}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {day.activities.length} {t("itineraryPage.activities")}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {day.activities.map((activity, idx) => (
                      <div key={idx} className="flex gap-3 sm:gap-4">
                        <div className="flex shrink-0 flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border ${getActivityColor(activity.type)}`}
                          >
                            {getActivityIcon(activity.type)}
                          </div>
                          {idx < day.activities.length - 1 && (
                            <div className="my-1 h-full w-px bg-border" style={{ minHeight: "40px" }} />
                          )}
                        </div>

                        <div className="flex-1 pb-4">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {activity.time}
                            </Badge>
                            <h3 className="text-sm font-semibold text-foreground sm:text-base">
                              {t(activity.nameKey)}
                            </h3>
                          </div>
                          <p className="mb-2 text-xs text-muted-foreground sm:text-sm">{t(activity.descKey)}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            <span className="font-medium">{activity.cost}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Summary Card */}
          <Card className="mt-6 bg-primary/5 sm:mt-8">
            <div className="p-4 sm:p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">{t("itineraryPage.tripSummary")}</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground sm:text-sm">{t("itineraryPage.totalDuration")}</p>
                  <p className="text-lg font-semibold text-foreground sm:text-xl">
                    {itinerary.days} {t("itineraryPage.days")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground sm:text-sm">{t("itineraryPage.estimatedCost")}</p>
                  <p className="text-lg font-semibold text-foreground sm:text-xl">¥{totalCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground sm:text-sm">{t("itineraryPage.travelers")}</p>
                  <p className="text-lg font-semibold text-foreground sm:text-xl">
                    {itinerary.travelers} {t("itineraryPage.people")}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
