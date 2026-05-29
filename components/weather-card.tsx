import { Card } from "@/components/ui/card"
import { Cloud, Droplets, Wind } from "lucide-react"
import type { WeatherData } from "@/lib/api-client"

interface WeatherCardProps {
  weather: WeatherData
}

export function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-950 dark:to-blue-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{weather.location} 天氣</h3>
        <Cloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">{weather.temperature}°C</span>
          <span className="text-lg text-muted-foreground">{weather.weatherDescription}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2">
          <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-xs text-muted-foreground">濕度</p>
            <p className="font-semibold text-foreground">{weather.humidity}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2">
          <Wind className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-xs text-muted-foreground">風速</p>
            <p className="font-semibold text-foreground">{weather.windSpeed} km/h</p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        更新時間：{weather.timestamp.toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </Card>
  )
}
