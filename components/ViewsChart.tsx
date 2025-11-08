'use client'

import { useState } from 'react'
import { SimpleLineChart } from './SimpleLineChart'
import { Button } from './ui/button'

interface ViewsChartProps {
  weeklyData: { date: string; value: number }[]
  monthlyData: { date: string; value: number }[]
  totalWeeklyViews: number
  totalMonthlyViews: number
}

export function ViewsChart({ weeklyData, monthlyData, totalWeeklyViews, totalMonthlyViews }: ViewsChartProps) {
  const [view, setView] = useState<'week' | 'month'>('week')

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="leading-none font-semibold text-2xl md:text-3xl text-foreground hidden md:block">Wyświetlenia ofert</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setView(view === 'week' ? 'month' : 'week')}
          className="rounded-full border border-border hover:bg-muted bg-card text-foreground ml-auto"
        >
          {view === 'week' ? 'Widok miesięczny' : 'Widok tygodniowy'}
        </Button>
      </div>
      <div className="flex-1">
        <SimpleLineChart
          data={view === 'week' ? weeklyData : monthlyData}
          label={view === 'week' ? 'Ostatnie 7 dni' : 'Ostatnie 30 dni'}
          totalValue={view === 'week' ? totalWeeklyViews : totalMonthlyViews}
        />
      </div>
    </div>
  )
}
