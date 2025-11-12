'use client'

import { useState } from 'react'
import { SimpleLineChart } from '../SimpleLineChart'
import { Button } from '../ui/button'

interface AdminAnalyticsChartProps {
  weeklyData?: { date: string; value: number; dateRange?: string }[]
  monthlyData?: { date: string; value: number; dateRange?: string }[]
  totalWeeklyValue?: number
  totalMonthlyValue?: number
  title: string
  color?: string
  tooltipSuffix?: string
}

export function AdminAnalyticsChart({
  weeklyData = [],
  monthlyData = [],
  totalWeeklyValue = 0,
  totalMonthlyValue = 0,
  title,
  color = '#f27361',
  tooltipSuffix = 'wyświetleń'
}: AdminAnalyticsChartProps) {
  const [view, setView] = useState<'week' | 'month'>('week')
  const [isAnimating, setIsAnimating] = useState(false)

  const handleViewChange = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setView(view === 'week' ? 'month' : 'week')
      setTimeout(() => setIsAnimating(false), 100)
    }, 150)
  }

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="leading-none font-semibold text-lg text-foreground">{title}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewChange}
          className={`rounded-full border border-border hover:bg-accent bg-muted text-foreground text-xs transition-all duration-300 ${
            isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100 hover:scale-105'
          }`}
        >
          <span className={`inline-block transition-all duration-300 ${isAnimating ? 'blur-sm scale-95' : 'blur-0 scale-100'}`}>
            {view === 'week' ? '30 dni' : '7 dni'}
          </span>
        </Button>
      </div>
      <div className={`flex-1 min-h-0 transition-all duration-300 ${isAnimating ? 'blur-sm opacity-50 scale-95' : 'blur-0 opacity-100 scale-100'}`}>
        <SimpleLineChart
          data={view === 'week' ? weeklyData : monthlyData}
          label={view === 'week' ? 'Ostatnie 7 dni' : 'Ostatnie 30 dni'}
          totalValue={view === 'week' ? totalWeeklyValue : totalMonthlyValue}
          color={color}
          tooltipSuffix={tooltipSuffix}
        />
      </div>
    </div>
  )
}
