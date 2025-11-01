'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { CategoryIcon } from '@/lib/category-icons'
import { useState, useEffect, useRef } from 'react'
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
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mobileViewingCategory, setMobileViewingCategory] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ [key: string]: { position: 'top' | 'bottom', maxHeight?: number } }>({})
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  // Organize categories into parent-child structure
  const mainCategories = categories?.filter(cat => !cat.parent_id) || []
  const getSubcategories = (parentId: string) => {
    return categories?.filter(cat => cat.parent_id === parentId) || []
  }

  const handleCategoryHover = (categoryId: string) => {
    // Cancel any pending close
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    // Immediately set as expanded
    setExpandedCategory(categoryId)

    // Calculate position synchronously
    const element = categoryRefs.current[categoryId]
    if (!element) return

    const rect = element.getBoundingClientRect()
    const subcategories = getSubcategories(categoryId)

    // Calculate available space
    const spaceBelow = window.innerHeight - rect.top - 20 // 20px margin from bottom
    const spaceAbove = rect.bottom - 20 // 20px margin from top

    // Estimate ideal dropdown height (each item ~44px + padding)
    const idealDropdownHeight = subcategories.length * 44 + 24 // 24px for padding

    // Determine best position and calculate max height
    let position: 'top' | 'bottom' = 'bottom'
    let maxHeight: number | undefined

    if (spaceBelow >= idealDropdownHeight) {
      // Enough space below, use bottom position
      position = 'bottom'
      maxHeight = undefined // No constraint needed
    } else if (spaceAbove >= idealDropdownHeight) {
      // Enough space above, use top position
      position = 'top'
      maxHeight = undefined // No constraint needed
    } else {
      // Not enough space in either direction, use the side with more space
      if (spaceBelow > spaceAbove) {
        position = 'bottom'
        maxHeight = spaceBelow - 20 // Leave some margin
      } else {
        position = 'top'
        maxHeight = spaceAbove - 20 // Leave some margin
      }
    }

    // Update position and max height
    setDropdownPosition(prev => ({ ...prev, [categoryId]: { position, maxHeight } }))
  }

  const handleCategoryLeave = () => {
    // Delay closing to allow moving to next category
    closeTimeoutRef.current = setTimeout(() => {
      setExpandedCategory(null)
    }, 100)
  }

  const getDropdownStyle = (categoryId: string) => {
    const element = categoryRefs.current[categoryId]
    if (!element) return {}

    const rect = element.getBoundingClientRect()
    const positionData = dropdownPosition[categoryId] || { position: 'bottom' }
    const { position, maxHeight } = positionData

    const style: React.CSSProperties = {
      position: 'fixed' as const,
      left: `${rect.right + 8}px`,
      [position === 'top' ? 'bottom' : 'top']: position === 'top'
        ? `${window.innerHeight - rect.bottom}px`
        : `${rect.top}px`,
      zIndex: 50
    }

    if (maxHeight) {
      style.maxHeight = `${maxHeight}px`
    }

    return style
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
    <>
        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <>
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

            {/* Main categories with subcategories - scrollable */}
            <div className="space-y-2">
              {mainCategories.map((mainCategory) => {
                const subcategories = getSubcategories(mainCategory.id)
                const hasSubcategories = subcategories.length > 0
                const isExpanded = expandedCategory === mainCategory.id
                const isMainSelected = currentCategory.toLowerCase() === mainCategory.name.toLowerCase()
                const hasSelectedSubcategory = subcategories.some(
                  sub => currentCategory.toLowerCase() === sub.name.toLowerCase()
                )

                return (
                  <div
                    key={mainCategory.id}
                    ref={(el) => { categoryRefs.current[mainCategory.id] = el }}
                    className="relative"
                    onMouseLeave={handleCategoryLeave}
                  >
                    {/* Main category button */}
                    <div className="border border-black/10 rounded-2xl overflow-visible bg-white">
                      <button
                        onClick={() => updateFilter('category', mainCategory.name.toLowerCase())}
                        onMouseEnter={() => {
                          if (hasSubcategories) {
                            handleCategoryHover(mainCategory.id)
                          }
                        }}
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

                    {/* Dropdown menu for subcategories - appears on the right using fixed positioning */}
                    {hasSubcategories && isExpanded && (
                      <div
                        style={getDropdownStyle(mainCategory.id)}
                        className="min-w-[250px]"
                        onMouseEnter={() => {
                          // Cancel close timeout when hovering dropdown
                          if (closeTimeoutRef.current) {
                            clearTimeout(closeTimeoutRef.current)
                            closeTimeoutRef.current = null
                          }
                        }}
                        onMouseLeave={handleCategoryLeave}
                      >
                        {/* Invisible bridge to connect category button with dropdown */}
                        <div
                          className="absolute right-full top-0 bottom-0"
                          style={{ width: '8px' }}
                        />

                        <div
                          className="bg-white border border-black/10 rounded-2xl shadow-xl p-2 space-y-1 overflow-y-auto max-h-full"
                          style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(0,0,0,0.1) transparent'
                          }}
                        >
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
          </>
        )}
      </>
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
              className="text-sm text-[#B33D2A] hover:text-[#A02C1F] font-medium"
            >
              Wyczyść wszystkie filtry
            </button>
          )}

          <MobileMenuContent />
        </div>
      </div>

      {/* Desktop: Sticky sidebar with scroll */}
      <div className="hidden lg:block sticky top-4 space-y-4 max-h-[calc(100vh-32px)]">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-bold text-black">Kategorie</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              data-navigate="true"
              className="text-sm text-[#B33D2A] hover:text-[#A02C1F] font-medium"
            >
              Wyczyść
            </button>
          )}
        </div>

        {/* Scrollable content area */}
        <div
          className="overflow-y-auto pr-2 flex-1"
          style={{
            maxHeight: 'calc(100vh - 120px)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.1) transparent',
            paddingBottom: '32px'
          }}
          onScroll={() => setExpandedCategory(null)}
        >
          <DesktopMenuContent />
        </div>
      </div>
    </>
  )
}
