'use client'

import { TrendingUp, TrendingDown, Minus, Eye, MessageCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface ResponseRateCardProps {
  currentRate: number // percentage 0-100
  previousRate: number // percentage 0-100
  totalViews: number
  totalMessages: number
}

export function ResponseRateCard({
  currentRate,
  previousRate,
  totalViews,
  totalMessages,
}: ResponseRateCardProps) {
  const trend = currentRate - previousRate
  const trendPercentage = previousRate > 0 ? Math.round((trend / previousRate) * 100) : 0

  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />
    if (trend < 0) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getTrendColor = () => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-muted-foreground'
  }

  // Data for pie chart
  const chartData = [
    { name: 'Odpowiedzi', value: currentRate },
    { name: 'Reszta', value: 100 - currentRate }
  ]

  const COLORS = ['#f27361', '#e5e7eb']

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-2 hidden md:block">Wskaźnik zainteresowania</p>
        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-3xl font-bold text-foreground">
            {currentRate.toFixed(1)}%
          </p>
          {trend !== 0 && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-semibold">
                {trend > 0 ? '+' : ''}{Math.abs(trendPercentage)}%
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          osób wysyła wiadomość po zobaczeniu ogłoszenia
        </p>
      </div>

      {/* Info cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Trend info */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Trend</p>
          <p className="text-sm font-medium text-foreground">
            {trend > 0 ? (
              <span className="text-green-600">Wzrostowy</span>
            ) : trend < 0 ? (
              <span className="text-red-600">Spadkowy</span>
            ) : (
              <span>Stabilny</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {currentRate >= 10 ? (
              <span>Świetnie! Twoje ogłoszenia przyciągają uwagę</span>
            ) : currentRate >= 5 ? (
              <span>Dobry wynik. Średnia to 5-10%</span>
            ) : currentRate > 0 ? (
              <span>Jest przestrzeń na poprawę</span>
            ) : (
              <span>Brak jeszcze danych</span>
            )}
          </p>
        </div>

        {/* Tips card */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border/30 opacity-60">
          <p className="text-xs text-muted-foreground mb-1">Dodatkowa metryka</p>
          <p className="text-sm font-medium text-muted-foreground mb-1">-</p>
          <p className="text-xs text-muted-foreground">
            Wkrótce dostępne
          </p>
        </div>

        {/* Stats cards - 2 columns */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border/30 opacity-60">
          <p className="text-xs text-muted-foreground mb-1">Dodatkowa metryka</p>
          <p className="text-2xl font-bold text-muted-foreground">-</p>
          <p className="text-xs text-muted-foreground mt-1">
            Wkrótce dostępne
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/50 border border-border/30 opacity-60">
          <p className="text-xs text-muted-foreground mb-1">Dodatkowa metryka</p>
          <p className="text-2xl font-bold text-muted-foreground">-</p>
          <p className="text-xs text-muted-foreground mt-1">
            Wkrótce dostępne
          </p>
        </div>
      </div>
    </div>
  )
}
