'use client'

import { AnimatedTabs } from './AnimatedTabs'

interface MyListingsTabsProps {
  activeTab: 'all' | 'active' | 'rejected' | 'completed'
  allCount: number
  activeCount: number
  rejectedCount: number
  completedCount: number
  onTabChange: (tab: 'all' | 'active' | 'rejected' | 'completed') => void
}

export function MyListingsTabs({
  activeTab,
  allCount,
  activeCount,
  rejectedCount,
  completedCount,
  onTabChange,
}: MyListingsTabsProps) {
  const tabs = [
    { id: 'all', label: 'Wszystkie', count: allCount },
    { id: 'active', label: 'Aktywne', count: activeCount },
    { id: 'rejected', label: 'Odrzucone', count: rejectedCount },
    { id: 'completed', label: 'Zakończone', count: completedCount },
  ]

  return (
    <AnimatedTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      className="overflow-x-auto scrollbar-hide"
    />
  )
}
