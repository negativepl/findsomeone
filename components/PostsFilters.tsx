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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl px-6 py-4 border border-black/10">
      {/* Left side - Range display */}
      <div className="text-sm text-black/60">
        Wyświetlanie {startItem} - {endItem} z {totalCount} element{totalCount === 1 ? '' : totalCount < 5 ? 'y' : 'ów'}
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Items per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-black/60">Na stronie:</span>
          <Select value={String(itemsPerPage)} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-[70px] rounded-xl border-black/10 h-10 bg-white focus:ring-0 focus:ring-offset-0 focus:border-black/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">8</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-black/60">Sortuj:</span>
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] rounded-xl border-black/10 h-10 bg-white focus:ring-0 focus:ring-offset-0 focus:border-black/20">
              <SelectValue />
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
    </div>
  )
}
