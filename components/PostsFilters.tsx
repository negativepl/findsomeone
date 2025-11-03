'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ViewToggle } from '@/components/ViewToggle'

interface PostsFiltersProps {
  currentSort: string
  currentView?: 'grid' | 'list'
  onViewChange?: (view: 'grid' | 'list') => void
}

export function PostsFilters({
  currentSort,
  currentView = 'grid',
  onViewChange
}: PostsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-row items-center justify-between gap-2">
      {/* Left side - View toggle */}
      {onViewChange && (
        <ViewToggle view={currentView} onViewChange={onViewChange} />
      )}

      {/* Right side - Sort */}
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-auto rounded-xl border-border h-9 bg-card focus:ring-0 focus:ring-offset-0 focus:border-border px-2.5 gap-1 justify-start" aria-label="Sortuj według">
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
  )
}
