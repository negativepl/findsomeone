'use client'

import { useState } from 'react'
import { SimpleLineChart } from './SimpleLineChart'
import { Button } from './ui/button'

interface ViewsChartProps {
  weeklyData?: { date: string; value: number }[]
  monthlyData?: { date: string; value: number }[]
  totalWeeklyViews?: number
  totalMonthlyViews?: number
}

export function ViewsChart({
  weeklyData = [],
  monthlyData = [],
  totalWeeklyViews = 0,
  totalMonthlyViews = 0
}: ViewsChartProps) {
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
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="leading-none font-semibold text-2xl md:text-3xl text-foreground hidden md:block">Wyświetlenia ofert</div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewChange}
          className={`rounded-full border border-border hover:bg-muted bg-card text-foreground ml-auto transition-all duration-300 ${
            isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100 hover:scale-105'
          }`}
        >
          <span className={`inline-block transition-all duration-300 ${isAnimating ? 'blur-sm scale-95' : 'blur-0 scale-100'}`}>
            {view === 'week' ? 'Widok miesięczny' : 'Widok tygodniowy'}
          </span>
        </Button>
      </div>
      <div className={`flex-1 transition-all duration-300 ${isAnimating ? 'blur-sm opacity-50 scale-95' : 'blur-0 opacity-100 scale-100'}`}>
        <SimpleLineChart
          data={view === 'week' ? weeklyData : monthlyData}
          label={view === 'week' ? 'Ostatnie 7 dni' : 'Ostatnie 30 dni'}
          totalValue={view === 'week' ? totalWeeklyViews : totalMonthlyViews}
        />
      </div>
    </div>
  )
}
