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

  // Get combined sort text
  const getSortText = () => {
    if (sortBy === 'created_at') {
      return order === 'desc' ? 'Najnowsze najpierw' : 'Najstarsze najpierw'
    } else if (sortBy === 'price_min') {
      return order === 'asc' ? 'Cena rosnąco' : 'Cena malejąco'
    } else if (sortBy === 'price_max') {
      return order === 'desc' ? 'Cena malejąco' : 'Cena rosnąco'
    } else if (sortBy === 'title') {
      return order === 'asc' ? 'Tytuł A-Z' : 'Tytuł Z-A'
    }
    return 'Najnowsze najpierw'
  }

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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Left side - Range display */}
      <div className="text-sm text-black/60">
        Wyświetlanie <span className="font-semibold text-black">{startItem} - {endItem}</span> z{' '}
        <span className="font-semibold text-black">{totalCount}</span> element(y)
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Items per page */}
        <Select value={limit} onValueChange={(value) => updateFilter('limit', value)}>
          <SelectTrigger className="w-[70px] rounded-full border-black/10 h-9 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8">8</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="24">24</SelectItem>
            <SelectItem value="48">48</SelectItem>
          </SelectContent>
        </Select>

        {/* Combined Sort */}
        <Select value={combinedSortValue} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[200px] rounded-full border-black/10 h-9 bg-white">
            <SelectValue placeholder={getSortText()} />
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
