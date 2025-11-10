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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mobileViewingCategory, setMobileViewingCategory] = useState<string | null>(null)
  const [mobileViewingSubcategory, setMobileViewingSubcategory] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ [key: string]: { position: 'top' | 'bottom', maxHeight?: number } }>({})
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const subcategoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const currentCategory = searchParams.get('category') || ''
  const currentType = searchParams.get('type') || ''
  const currentSearch = searchParams.get('search') || ''
  const currentCity = searchParams.get('city') || ''

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setMobileViewingCategory(null)
    setMobileViewingSubcategory(null)
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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
      if (subCloseTimeoutRef.current) {
        clearTimeout(subCloseTimeoutRef.current)
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
      setHoveredSubcategory(null)
    }, 100)
  }

  const handleSubcategoryHover = (subcategoryId: string) => {
    // Cancel any pending close
    if (subCloseTimeoutRef.current) {
      clearTimeout(subCloseTimeoutRef.current)
      subCloseTimeoutRef.current = null
    }

    setHoveredSubcategory(subcategoryId)
  }

  const handleSubcategoryLeave = () => {
    // Delay closing to allow moving to next subcategory
    subCloseTimeoutRef.current = setTimeout(() => {
      setHoveredSubcategory(null)
    }, 100)
  }

  const getSubSubDropdownStyle = (subcategoryId: string) => {
    const element = subcategoryRefs.current[subcategoryId]
    if (!element) return {}

    const rect = element.getBoundingClientRect()
    const subSubcategories = getSubcategories(subcategoryId)

    // Calculate available space
    const spaceBelow = window.innerHeight - rect.top - 20
    const spaceAbove = rect.bottom - 20

    // Estimate dropdown height
    const idealDropdownHeight = subSubcategories.length * 36 + 16

    let position: 'top' | 'bottom' = 'bottom'
    let maxHeight: number | undefined

    if (spaceBelow >= idealDropdownHeight) {
      position = 'bottom'
      maxHeight = undefined
    } else if (spaceAbove >= idealDropdownHeight) {
      position = 'top'
      maxHeight = undefined
    } else {
      if (spaceBelow > spaceAbove) {
        position = 'bottom'
        maxHeight = spaceBelow - 20
      } else {
        position = 'top'
        maxHeight = spaceAbove - 20
      }
    }

    const style: React.CSSProperties = {
      position: 'fixed' as const,
      left: `${rect.right + 12}px`,
      [position === 'top' ? 'bottom' : 'top']: position === 'top'
        ? `${window.innerHeight - rect.bottom}px`
        : `${rect.top}px`,
      zIndex: 60
    }

    if (maxHeight) {
      style.maxHeight = `${maxHeight}px`
    }

    return style
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

  const toggleExpandedCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
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
    // If viewing a specific subcategory's sub-subcategories (third level)
    if (mobileViewingSubcategory) {
      const subcategory = categories?.find(cat => cat.id === mobileViewingSubcategory)
      if (!subcategory) return null

      const subSubcategories = getSubcategories(subcategory.id)

      return (
        <div className="space-y-3">
          {/* Back button */}
          <button
            onClick={() => setMobileViewingSubcategory(null)}
            className="flex items-center gap-2 text-foreground hover:text-brand transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Powrót</span>
          </button>

          {/* Subcategory header */}
          <div className="mb-4">
            <button
              onClick={() => updateFilter('category', subcategory.name.toLowerCase())}
              data-navigate="true"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border hover:bg-muted transition-colors"
            >
              <span className="font-bold text-lg">{subcategory.name}</span>
            </button>
          </div>

          {/* Sub-subcategories */}
          <div className="space-y-2">
            {subSubcategories.map((subSubcategory) => {
              const isSelected = currentCategory.toLowerCase() === subSubcategory.name.toLowerCase()
              return (
                <button
                  key={subSubcategory.id}
                  onClick={() => updateFilter('category', subSubcategory.name.toLowerCase())}
                  data-navigate="true"
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors ${
                    isSelected
                      ? 'bg-brand text-white'
                      : 'bg-card text-foreground border border-border hover:bg-muted'
                  }`}
                >
                  <span className="font-medium">{subSubcategory.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )
    }

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
            className="flex items-center gap-2 text-foreground hover:text-brand transition-colors mb-4"
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border hover:bg-muted transition-colors"
            >
              <CategoryIcon iconName={category.icon} className="w-6 h-6 text-muted-foreground" />
              <span className="font-bold text-lg">{category.name}</span>
            </button>
          </div>

          {/* Subcategories */}
          <div className="space-y-2">
            {subcategories.map((subcategory) => {
              const isSelected = currentCategory.toLowerCase() === subcategory.name.toLowerCase()
              const subSubcategories = getSubcategories(subcategory.id)
              const hasSubSubcategories = subSubcategories.length > 0

              return (
                <button
                  key={subcategory.id}
                  onClick={() => {
                    if (hasSubSubcategories) {
                      setMobileViewingSubcategory(subcategory.id)
                    } else {
                      updateFilter('category', subcategory.name.toLowerCase())
                    }
                  }}
                  {...(!hasSubSubcategories && { 'data-navigate': 'true' })}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors ${
                    isSelected
                      ? 'bg-brand text-white'
                      : 'bg-card text-foreground border border-border hover:bg-muted'
                  }`}
                >
                  <span className="font-medium flex-1">{subcategory.name}</span>
                  {hasSubSubcategories && (
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    // Main categories view
    return (
      <div className="space-y-3">
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
                    ? 'bg-brand text-white'
                    : 'bg-card text-foreground border border-border hover:bg-muted'
                }`}
              >
                <CategoryIcon
                  iconName={mainCategory.icon}
                  className={`w-5 h-5 ${isMainSelected ? 'text-white' : 'text-muted-foreground'}`}
                />
                <span className="font-medium flex-1">{mainCategory.name}</span>
                {hasSubcategories && (
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      {/* Desktop content will be added later */}
    </>
  )

  return (
    <>
      {/* Mobile: Floating filter button */}
      <div className="lg:hidden fixed bottom-24 left-4 z-40">
        <Button
          onClick={() => setIsMobileMenuOpen(true)}
          className="rounded-full bg-brand hover:bg-brand/90 text-white shadow-lg w-14 h-14 p-0"
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
        className={`lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-background z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Kategorie</h3>
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
              className="text-sm text-brand/90 hover:text-brand/80 font-medium"
            >
              Wyczyść wszystkie filtry
            </button>
          )}

          <MobileMenuContent />
        </div>
      </div>

      {/* Desktop: Sticky sidebar with categories */}
      <div className="hidden lg:block space-y-4">
        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            data-navigate="true"
            className="text-sm text-brand hover:text-brand/90 font-medium"
          >
            Wyczyść filtry
          </button>
        )}

        {/* Categories */}
        <div className="space-y-2">
          {mainCategories.map((mainCategory) => {
            const subcategories = getSubcategories(mainCategory.id)
            const hasSubcategories = subcategories.length > 0
            const isMainSelected = currentCategory.toLowerCase() === mainCategory.name.toLowerCase()

            return (
              <div key={mainCategory.id}>
                {/* Main category button */}
                <button
                  onClick={() => {
                    if (hasSubcategories) {
                      toggleExpandedCategory(mainCategory.id)
                    } else {
                      updateFilter('category', mainCategory.name.toLowerCase())
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors ${
                    isMainSelected
                      ? 'bg-brand text-white'
                      : 'bg-card text-foreground border border-border hover:bg-muted'
                  }`}
                >
                  <CategoryIcon iconName={mainCategory.icon} className={`w-5 h-5 flex-shrink-0 ${isMainSelected ? 'text-white' : 'text-muted-foreground'}`} />
                  <span className="font-medium flex-1">{mainCategory.name}</span>
                  {hasSubcategories && (
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedCategories.has(mainCategory.id) ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Subcategories - collapsible */}
                {hasSubcategories && expandedCategories.has(mainCategory.id) && (
                  <div className="mt-2 ml-4 space-y-1 border-l border-border pl-4">
                    {subcategories.map((subcategory) => {
                      const isSelected = currentCategory.toLowerCase() === subcategory.name.toLowerCase()
                      const subSubcategories = getSubcategories(subcategory.id)
                      const hasSubSubcategories = subSubcategories.length > 0

                      return (
                        <div key={subcategory.id}>
                          <button
                            onClick={() => {
                              if (hasSubSubcategories) {
                                toggleExpandedCategory(subcategory.id)
                              } else {
                                updateFilter('category', subcategory.name.toLowerCase())
                              }
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                              isSelected
                                ? 'bg-brand/10 text-brand font-medium'
                                : 'text-foreground hover:bg-muted/50'
                            }`}
                          >
                            <span className="flex-1">{subcategory.name}</span>
                            {hasSubSubcategories && (
                              <ChevronDown className={`w-3 h-3 transition-transform ${expandedCategories.has(subcategory.id) ? 'rotate-180' : ''}`} />
                            )}
                          </button>

                          {/* Sub-subcategories */}
                          {hasSubSubcategories && expandedCategories.has(subcategory.id) && (
                            <div className="mt-1 ml-4 space-y-1 border-l border-border/50 pl-3">
                              {subSubcategories.map((subSubcategory) => {
                                const isSubSubSelected = currentCategory.toLowerCase() === subSubcategory.name.toLowerCase()
                                return (
                                  <button
                                    key={subSubcategory.id}
                                    onClick={() => updateFilter('category', subSubcategory.name.toLowerCase())}
                                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs text-left transition-colors ${
                                      isSubSubSelected
                                        ? 'bg-brand/10 text-brand font-medium'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                  >
                                    {subSubcategory.name}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
