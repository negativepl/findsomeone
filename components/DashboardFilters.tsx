'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DashboardFiltersProps {
  currentPage: number
  itemsPerPage: number
  totalCount: number
}

export function DashboardFilters({ currentPage, itemsPerPage, totalCount }: DashboardFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sortBy = searchParams.get('sortBy') || 'created_at'
  const order = searchParams.get('order') || 'desc'
  const limit = searchParams.get('limit') || '12'

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    // Reset to page 1 when filters change
    params.set('page', '1')
    router.push(`/dashboard?${params.toString()}`)
  }

  // Calculate range
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalCount)

  // Combined sort value
  const combinedSortValue = `${sortBy}-${order}`

  const handleSortChange = (value: string) => {
    const [newSortBy, newOrder] = value.split('-')
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', newSortBy)
    params.set('order', newOrder)
    params.set('page', '1')
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="flex flex-row items-center justify-between gap-2">
      {/* Left side - Range display */}
      <div className="text-xs sm:text-sm text-black/60 whitespace-nowrap">
        {startItem} - {endItem} z {totalCount}
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-2">
        {/* Items per page - just number */}
        <Select value={limit} onValueChange={(value) => updateFilter('limit', value)}>
          <SelectTrigger className="w-auto rounded-xl border-black/10 h-9 bg-white focus:ring-0 focus:ring-offset-0 focus:border-black/20 px-2.5 gap-1 justify-start">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8">8</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="24">24</SelectItem>
            <SelectItem value="48">48</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort - always shows "Sortuj według" */}
        <Select value={combinedSortValue} onValueChange={handleSortChange}>
          <SelectTrigger className="w-auto rounded-xl border-black/10 h-9 bg-white focus:ring-0 focus:ring-offset-0 focus:border-black/20 px-2.5 gap-1 justify-start">
            <span className="text-sm">Sortuj według</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">Najnowsze najpierw</SelectItem>
            <SelectItem value="created_at-asc">Najstarsze najpierw</SelectItem>
            <SelectItem value="price_min-asc">Cena rosnąco</SelectItem>
            <SelectItem value="price_max-desc">Cena malejąco</SelectItem>
            <SelectItem value="title-asc">Tytuł A-Z</SelectItem>
            <SelectItem value="title-desc">Tytuł Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
