'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface SortSelectProps {
  currentSort: string
}

export function SortSelect({ currentSort }: SortSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    params.set('page', '1') // Reset to first page on sort change
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-black/60">Sortuj:</span>
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="rounded-xl border border-black/10 px-4 py-2 text-sm bg-white text-black hover:bg-[#F5F1E8] transition-colors cursor-pointer focus:outline-none focus:border-black/20"
      >
        <option value="newest">Najnowsze najpierw</option>
        <option value="oldest">Najstarsze najpierw</option>
        <option value="price_asc">Cena: rosnąco</option>
        <option value="price_desc">Cena: malejąco</option>
      </select>
    </div>
  )
}
