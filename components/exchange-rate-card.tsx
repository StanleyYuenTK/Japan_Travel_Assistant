import { Card } from "@/components/ui/card"
import { ArrowRightLeft, TrendingUp } from "lucide-react"
import type { ExchangeRateData } from "@/lib/api-client"

interface ExchangeRateCardProps {
  exchangeRate: ExchangeRateData
}

export function ExchangeRateCard({ exchangeRate }: ExchangeRateCardProps) {
  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 dark:from-green-950 dark:to-emerald-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">匯率資訊</h3>
        <ArrowRightLeft className="h-6 w-6 text-green-600 dark:text-green-400" />
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">
            {exchangeRate.from} → {exchangeRate.to}
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{exchangeRate.rate}</span>
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <div className="rounded-lg bg-background/50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">HK$ {exchangeRate.amount.toLocaleString()}</span>
          <span className="text-sm font-semibold text-foreground">¥ {exchangeRate.converted.toLocaleString()}</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        更新時間：{exchangeRate.timestamp.toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </Card>
  )
}
