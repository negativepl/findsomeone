'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { AnimatedTabs } from './AnimatedTabs'

interface DashboardTabsProps {
  totalCount: number
}

export function DashboardTabs({ totalCount }: DashboardTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const search = searchParams.get('search') || ''
  const city = searchParams.get('city') || ''
  const category = searchParams.get('category') || ''

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams()

    // Preserve existing search params
    if (search) params.set('search', search)
    if (city) params.set('city', city)
    if (category) params.set('category', category)

    const queryString = params.toString()
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
  }

  const tabs = [
    { id: 'all', label: 'Wszystkie ogłoszenia', count: totalCount },
  ]

  return (
    <AnimatedTabs
      tabs={tabs}
      activeTab={'all'}
      onTabChange={handleTabChange}
      className="justify-center md:justify-start"
      showLoader={true}
    />
  )
}
