'use client'

import dynamic from 'next/dynamic'

const ViewsChart = dynamic(() => import('@/components/ViewsChart').then(mod => ({ default: mod.ViewsChart })), {
  loading: () => <div className="h-[450px] bg-muted/30 rounded-xl animate-pulse" />,
  ssr: false,
})

interface ViewsChartWrapperProps {
  weeklyData?: { date: string; value: number; dateRange?: string }[]
  monthlyData?: { date: string; value: number; dateRange?: string }[]
  totalWeeklyViews?: number
  totalMonthlyViews?: number
}

export function ViewsChartWrapper({ weeklyData = [], monthlyData = [], totalWeeklyViews = 0, totalMonthlyViews = 0 }: ViewsChartWrapperProps) {
  return <ViewsChart weeklyData={weeklyData} monthlyData={monthlyData} totalWeeklyViews={totalWeeklyViews} totalMonthlyViews={totalMonthlyViews} />
}
