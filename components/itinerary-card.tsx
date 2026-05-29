"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Itinerary } from "@/types/itinerary"
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Utensils,
  Hotel,
  Train,
  Lightbulb,
} from "lucide-react"
import { useState } from "react"

interface ItineraryCardProps {
  itinerary: Itinerary
}

export function ItineraryCard({ itinerary }: ItineraryCardProps) {
  const [expandedDays, setExpandedDays] = useState<number[]>([1])

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  return (
    <Card className="w-full p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{itinerary.title}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{itinerary.destination}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{itinerary.duration} 天</span>
          </div>
          {itinerary.totalEstimatedCost && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>約 HK${itinerary.totalEstimatedCost.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Overview */}
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold text-foreground">行程概覽</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{itinerary.overview}</p>
      </div>

      <Separator className="my-6" />

      {/* Days */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">每日行程</h3>
        {itinerary.days.map((day) => (
          <Collapsible key={day.day} open={expandedDays.includes(day.day)} onOpenChange={() => toggleDay(day.day)}>
            <Card className="overflow-hidden">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-4 hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-sm">
                      第 {day.day} 天
                    </Badge>
                    <span className="font-semibold text-foreground">{day.title}</span>
                  </div>
                  {expandedDays.includes(day.day) ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="space-y-4 p-4 pt-0">
                  {/* Activities */}
                  <div className="space-y-3">
                    {day.activities.map((activity, idx) => (
                      <Card key={idx} className="bg-accent/50 p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground">{activity.time}</span>
                            <Badge variant="outline" className="text-xs">
                              {activity.duration}
                            </Badge>
                          </div>
                          {activity.cost && <span className="text-sm text-muted-foreground">HK${activity.cost}</span>}
                        </div>
                        <h4 className="mb-1 font-semibold text-foreground">{activity.name}</h4>
                        <p className="mb-2 text-sm text-muted-foreground">{activity.description}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{activity.location}</span>
                        </div>
                        {activity.tips && activity.tips.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {activity.tips.map((tip, tipIdx) => (
                              <div key={tipIdx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>

                  {/* Meals, Transportation, Accommodation */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {day.meals && (
                      <Card className="bg-accent/30 p-3">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Utensils className="h-4 w-4" />
                          <span>餐飲</span>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {day.meals.breakfast && <div>早餐：{day.meals.breakfast}</div>}
                          {day.meals.lunch && <div>午餐：{day.meals.lunch}</div>}
                          {day.meals.dinner && <div>晚餐：{day.meals.dinner}</div>}
                        </div>
                      </Card>
                    )}

                    {day.transportation && (
                      <Card className="bg-accent/30 p-3">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Train className="h-4 w-4" />
                          <span>交通</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{day.transportation}</p>
                      </Card>
                    )}

                    {day.accommodation && (
                      <Card className="bg-accent/30 p-3">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Hotel className="h-4 w-4" />
                          <span>住宿</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{day.accommodation}</p>
                      </Card>
                    )}

                    {day.estimatedCost && (
                      <Card className="bg-accent/30 p-3">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>當天預算</span>
                        </div>
                        <p className="text-sm text-muted-foreground">約 HK${day.estimatedCost.toLocaleString()}</p>
                      </Card>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Tips */}
      {itinerary.tips.length > 0 && (
        <>
          <Separator className="my-6" />
          <div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">旅行貼士</h3>
            <div className="space-y-2">
              {itinerary.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
