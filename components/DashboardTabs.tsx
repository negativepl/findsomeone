'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DashboardTabsProps {
  seekingCount: number
  offeringCount: number
  totalCount: number
}

export function DashboardTabs({ seekingCount, offeringCount, totalCount }: DashboardTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentType = searchParams.get('type') || 'all'
  const search = searchParams.get('search') || ''
  const city = searchParams.get('city') || ''
  const category = searchParams.get('category') || ''

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams()

    // Preserve existing search params
    if (search) params.set('search', search)
    if (city) params.set('city', city)
    if (category) params.set('category', category)

    // Set type if not 'all'
    if (value !== 'all') {
      params.set('type', value)
    }

    const queryString = params.toString()
    router.push(`/dashboard${queryString ? `?${queryString}` : ''}`)
  }

  return (
    <Tabs value={currentType} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-12 bg-white border border-black/10 rounded-full p-1">
        <TabsTrigger
          value="all"
          className="rounded-full data-[state=active]:bg-black data-[state=active]:text-white transition-all"
        >
          Wszystkie
          <span className="ml-2 text-xs opacity-60">({totalCount})</span>
        </TabsTrigger>
        <TabsTrigger
          value="seeking"
          className="rounded-full data-[state=active]:bg-[#C44E35] data-[state=active]:text-white transition-all"
        >
          Szukam
          <span className="ml-2 text-xs opacity-60">({seekingCount})</span>
        </TabsTrigger>
        <TabsTrigger
          value="offering"
          className="rounded-full data-[state=active]:bg-black data-[state=active]:text-white transition-all"
        >
          Oferuję
          <span className="ml-2 text-xs opacity-60">({offeringCount})</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
