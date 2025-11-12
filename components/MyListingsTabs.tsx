'use client'

import { AnimatedTabs } from './AnimatedTabs'

interface MyListingsTabsProps {
  activeTab: 'all' | 'active' | 'rejected' | 'closed' | 'completed'
  allCount: number
  activeCount: number
  rejectedCount: number
  closedCount: number
  completedCount: number
  onTabChange: (tab: 'all' | 'active' | 'rejected' | 'closed' | 'completed') => void
}

export function MyListingsTabs({
  activeTab,
  allCount,
  activeCount,
  rejectedCount,
  closedCount,
  completedCount,
  onTabChange,
}: MyListingsTabsProps) {
  const tabs = [
    { id: 'all', label: 'Wszystkie', count: allCount },
    { id: 'active', label: 'Aktywne', count: activeCount },
    { id: 'rejected', label: 'Odrzucone', count: rejectedCount },
    { id: 'closed', label: 'Nieaktywne', count: closedCount },
    { id: 'completed', label: 'Zakończone', count: completedCount },
  ]

  return (
    <AnimatedTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => onTabChange(tabId as 'all' | 'active' | 'rejected' | 'closed' | 'completed')}
      className="overflow-x-auto scrollbar-hide"
    />
  )
}
