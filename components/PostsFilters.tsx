'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PostsFiltersProps {
  currentSort: string
  itemsPerPage: number
  startItem: number
  endItem: number
  totalCount: number
}

export function PostsFilters({ currentSort, itemsPerPage, startItem, endItem, totalCount }: PostsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    params.set('page', '1') // Reset to first page on sort change
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleLimitChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('limit', value)
    params.set('page', '1') // Reset to first page on limit change
    router.push(`${pathname}?${params.toString()}`)
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
        <Select value={String(itemsPerPage)} onValueChange={handleLimitChange}>
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
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-auto rounded-xl border-black/10 h-9 bg-white focus:ring-0 focus:ring-offset-0 focus:border-black/20 px-2.5 gap-1 justify-start">
            <span className="text-sm">Sortuj według</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Najnowsze najpierw</SelectItem>
            <SelectItem value="oldest">Najstarsze najpierw</SelectItem>
            <SelectItem value="price_asc">Cena: rosnąco</SelectItem>
            <SelectItem value="price_desc">Cena: malejąco</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
