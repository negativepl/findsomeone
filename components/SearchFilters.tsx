'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

interface SearchFiltersProps {
  categories: { id: string; name: string; slug: string }[] | null
}

export function SearchFilters({ categories }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || ''
  const currentType = searchParams.get('type') || ''
  const currentSearch = searchParams.get('search') || ''
  const currentCity = searchParams.get('city') || ''

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Preserve type filter
    if (currentType && key !== 'type') {
      params.set('type', currentType)
    }

    router.push(`/dashboard?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams()
    // Preserve type filter when clearing other filters
    if (currentType) {
      params.set('type', currentType)
    }
    router.push(`/dashboard${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const hasActiveFilters = currentCategory || currentSearch || currentCity

  return (
    <div className="mb-8">
      <div className="bg-white rounded-3xl p-6 border border-black/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-black">Filtry</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-[#C44E35] hover:text-[#B33D2A] font-medium"
            >
              Wyczyść wszystkie
            </button>
          )}
        </div>

        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-black mb-3">Kategoria</label>
            <div className="flex flex-wrap gap-2">
              <Badge
                onClick={() => updateFilter('category', '')}
                className={`cursor-pointer rounded-full px-4 py-2 transition-all ${
                  !currentCategory
                    ? 'bg-[#C44E35] text-white border-0 hover:bg-[#B33D2A]'
                    : 'bg-white text-black border border-black/20 hover:border-[#C44E35]'
                }`}
              >
                Wszystkie
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  onClick={() => updateFilter('category', category.name.toLowerCase())}
                  className={`cursor-pointer rounded-full px-4 py-2 transition-all ${
                    currentCategory.toLowerCase() === category.name.toLowerCase()
                      ? 'bg-[#C44E35] text-white border-0 hover:bg-[#B33D2A]'
                      : 'bg-white text-black border border-black/20 hover:border-[#C44E35]'
                  }`}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
