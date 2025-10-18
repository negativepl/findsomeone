'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { CategoryIcon } from '@/lib/category-icons'
import { useState, useEffect } from 'react'
import { ChevronDown, X, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string | null
  parent_id?: string | null
}

interface SearchFiltersProps {
  categories: Category[] | null
}

export function SearchFilters({ categories }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mobileViewingCategory, setMobileViewingCategory] = useState<string | null>(null)

  const currentCategory = searchParams.get('category') || ''
  const currentType = searchParams.get('type') || ''
  const currentSearch = searchParams.get('search') || ''
  const currentCity = searchParams.get('city') || ''

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setMobileViewingCategory(null)
  }, [searchParams])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Organize categories into parent-child structure
  const mainCategories = categories?.filter(cat => !cat.parent_id) || []
  const getSubcategories = (parentId: string) => {
    return categories?.filter(cat => cat.parent_id === parentId) || []
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

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

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams()
    // Preserve type filter when clearing other filters
    if (currentType) {
      params.set('type', currentType)
    }
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const hasActiveFilters = currentCategory || currentSearch || currentCity

  const MobileMenuContent = () => {
    // If viewing a specific category's subcategories
    if (mobileViewingCategory) {
      const category = mainCategories.find(cat => cat.id === mobileViewingCategory)
      if (!category) return null

      const subcategories = getSubcategories(category.id)

      return (
        <div className="space-y-3">
          {/* Back button */}
          <button
            onClick={() => setMobileViewingCategory(null)}
            className="flex items-center gap-2 text-black hover:text-[#C44E35] transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Powrót</span>
          </button>

          {/* Category header */}
          <div className="mb-4">
            <button
              onClick={() => updateFilter('category', category.name.toLowerCase())}
              data-navigate="true"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-black/10 hover:bg-[#F5F1E8] transition-colors"
            >
              <CategoryIcon iconName={category.icon} className="w-6 h-6 text-black/60" />
              <span className="font-bold text-lg">{category.name}</span>
            </button>
          </div>

          {/* Subcategories */}
          <div className="space-y-2">
            {subcategories.map((subcategory) => {
              const isSelected = currentCategory.toLowerCase() === subcategory.name.toLowerCase()
              return (
                <button
                  key={subcategory.id}
                  onClick={() => updateFilter('category', subcategory.name.toLowerCase())}
                  data-navigate="true"
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors ${
                    isSelected
                      ? 'bg-[#C44E35] text-white'
                      : 'bg-white text-black border border-black/10 hover:bg-[#F5F1E8]'
                  }`}
                >
                  <span className="font-medium">{subcategory.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    // Main categories view
    return (
      <div className="space-y-3">
        {/* All categories button */}
        <button
          onClick={() => updateFilter('category', '')}
          data-navigate="true"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors ${
            !currentCategory
              ? 'bg-[#C44E35] text-white'
              : 'bg-white text-black border border-black/10 hover:bg-[#F5F1E8]'
          }`}
        >
          <span className="font-medium">Wszystkie kategorie</span>
        </button>

        {/* Main categories */}
        <div className="space-y-2">
          {mainCategories.map((mainCategory) => {
            const subcategories = getSubcategories(mainCategory.id)
            const hasSubcategories = subcategories.length > 0
            const isMainSelected = currentCategory.toLowerCase() === mainCategory.name.toLowerCase()

            return (
              <button
                key={mainCategory.id}
                onClick={() => {
                  if (hasSubcategories) {
                    setMobileViewingCategory(mainCategory.id)
                  } else {
                    updateFilter('category', mainCategory.name.toLowerCase())
                  }
                }}
                {...(!hasSubcategories && { 'data-navigate': 'true' })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors ${
                  isMainSelected
                    ? 'bg-[#C44E35] text-white'
                    : 'bg-white text-black border border-black/10 hover:bg-[#F5F1E8]'
                }`}
              >
                <CategoryIcon
                  iconName={mainCategory.icon}
                  className={`w-5 h-5 ${isMainSelected ? 'text-white' : 'text-black/60'}`}
                />
                <span className="font-medium flex-1">{mainCategory.name}</span>
                {hasSubcategories && (
                  <svg className="w-5 h-5 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const DesktopMenuContent = () => (
    <div className="space-y-3">

        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <div>
            {/* All categories badge */}
            <button
              onClick={() => updateFilter('category', '')}
              data-navigate="true"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all mb-2 ${
                !currentCategory
                  ? 'bg-[#C44E35] text-white'
                  : 'bg-white text-black border border-black/10 hover:bg-[#F5F1E8]'
              }`}
            >
              <span className="font-medium">Wszystkie kategorie</span>
            </button>

            {/* Main categories with subcategories */}
            <div className="space-y-2">
              {mainCategories.map((mainCategory) => {
                const subcategories = getSubcategories(mainCategory.id)
                const hasSubcategories = subcategories.length > 0
                const isExpanded = expandedCategories.has(mainCategory.id)
                const isMainSelected = currentCategory.toLowerCase() === mainCategory.name.toLowerCase()
                const hasSelectedSubcategory = subcategories.some(
                  sub => currentCategory.toLowerCase() === sub.name.toLowerCase()
                )

                return (
                  <div
                    key={mainCategory.id}
                    className="relative"
                    onMouseLeave={() => setExpandedCategories(new Set())}
                  >
                    {/* Main category button */}
                    <div className="border border-black/10 rounded-2xl overflow-visible bg-white">
                      <button
                        onClick={() => updateFilter('category', mainCategory.name.toLowerCase())}
                        onMouseEnter={() => hasSubcategories && setExpandedCategories(new Set([mainCategory.id]))}
                        data-navigate="true"
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative ${
                          isMainSelected
                            ? 'bg-[#C44E35] text-white rounded-2xl'
                            : hasSelectedSubcategory || isExpanded
                            ? 'bg-[#F5F1E8] text-black rounded-2xl'
                            : 'bg-white text-black hover:bg-[#F5F1E8] rounded-2xl'
                        }`}
                      >
                        <CategoryIcon
                          iconName={mainCategory.icon}
                          className={`w-5 h-5 flex-shrink-0 ${isMainSelected ? 'text-white' : 'text-black/60'}`}
                        />
                        <span className="font-medium flex-1">{mainCategory.name}</span>

                        {/* Dropdown indicator for categories with subcategories */}
                        {hasSubcategories && (
                          <svg className={`w-5 h-5 ${isMainSelected ? 'text-white' : 'text-black/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Dropdown menu for subcategories - appears on the right */}
                    {hasSubcategories && isExpanded && (
                      <div
                        className="absolute left-full top-0 z-50 min-w-[250px]"
                      >
                        {/* Invisible bridge between category and dropdown */}
                        <div className="absolute right-full top-0 bottom-0 w-2" />

                        <div className="ml-2 bg-white border border-black/10 rounded-2xl shadow-xl p-2 space-y-1">
                          {subcategories.map((subcategory) => {
                            const isSubSelected = currentCategory.toLowerCase() === subcategory.name.toLowerCase()

                            return (
                              <button
                                key={subcategory.id}
                                onClick={() => updateFilter('category', subcategory.name.toLowerCase())}
                                data-navigate="true"
                                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left transition-colors ${
                                  isSubSelected
                                    ? 'bg-[#C44E35] text-white'
                                    : 'hover:bg-[#F5F1E8] text-black'
                                }`}
                              >
                                <span className="text-sm">{subcategory.name}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
  )

  return (
    <>
      {/* Mobile: Floating filter button */}
      <div className="lg:hidden fixed bottom-24 left-4 z-40">
        <Button
          onClick={() => setIsMobileMenuOpen(true)}
          className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white shadow-lg w-14 h-14 p-0"
          aria-label="Otwórz filtry"
        >
          <Filter className="w-6 h-6" />
        </Button>
      </div>

      {/* Mobile: Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile: Slide-out menu */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[#FAF8F3] z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-black">Kategorie</h3>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
              aria-label="Zamknij menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              data-navigate="true"
              className="text-sm text-[#C44E35] hover:text-[#B33D2A] font-medium"
            >
              Wyczyść wszystkie filtry
            </button>
          )}

          <MobileMenuContent />
        </div>
      </div>

      {/* Desktop: Regular sidebar */}
      <div className="hidden lg:block space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">Kategorie</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              data-navigate="true"
              className="text-sm text-[#C44E35] hover:text-[#B33D2A] font-medium"
            >
              Wyczyść
            </button>
          )}
        </div>

        <DesktopMenuContent />
      </div>
    </>
  )
}
