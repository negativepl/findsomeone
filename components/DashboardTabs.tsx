'use client'

import { useRouter, useSearchParams } from 'next/navigation'

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
    <div className="flex gap-1 md:gap-2 border-b-2 border-black/10 justify-center md:justify-start">
      <button
        onClick={() => handleTabChange('all')}
        className={`flex items-center gap-1.5 md:gap-3 px-3 md:px-6 py-3 md:py-4 font-semibold transition-all relative text-sm md:text-base ${
          currentType === 'all'
            ? 'text-[#C44E35]'
            : 'text-black/60 hover:text-black'
        }`}
      >
        <span>Wszystkie</span>
        <span className={`px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full text-xs font-bold ${
          currentType === 'all'
            ? 'bg-[#C44E35] text-white'
            : 'bg-black/10 text-black/60'
        }`}>
          {totalCount}
        </span>
        {currentType === 'all' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
        )}
      </button>

      <button
        onClick={() => handleTabChange('seeking')}
        className={`flex items-center gap-1.5 md:gap-3 px-3 md:px-6 py-3 md:py-4 font-semibold transition-all relative text-sm md:text-base ${
          currentType === 'seeking'
            ? 'text-[#C44E35]'
            : 'text-black/60 hover:text-black'
        }`}
      >
        <span>Szukam</span>
        <span className={`px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full text-xs font-bold ${
          currentType === 'seeking'
            ? 'bg-[#C44E35] text-white'
            : 'bg-black/10 text-black/60'
        }`}>
          {seekingCount}
        </span>
        {currentType === 'seeking' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
        )}
      </button>

      <button
        onClick={() => handleTabChange('offering')}
        className={`flex items-center gap-1.5 md:gap-3 px-3 md:px-6 py-3 md:py-4 font-semibold transition-all relative text-sm md:text-base ${
          currentType === 'offering'
            ? 'text-[#C44E35]'
            : 'text-black/60 hover:text-black'
        }`}
      >
        <span>Oferuję</span>
        <span className={`px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full text-xs font-bold ${
          currentType === 'offering'
            ? 'bg-[#C44E35] text-white'
            : 'bg-black/10 text-black/60'
        }`}>
          {offeringCount}
        </span>
        {currentType === 'offering' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
        )}
      </button>
    </div>
  )
}
