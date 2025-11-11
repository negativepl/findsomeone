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
  post_count?: number
}

interface SearchFiltersProps {
  categories: Category[] | null
  isMobileMenuOpen?: boolean
  setIsMobileMenuOpen?: (open: boolean) => void
}

// Recursive category tree renderer
function CategoryTree({
  category,
  categories,
  currentCategory,
  expandedCategories,
  toggleExpandedCategory,
  updateFilter,
  level = 0
}: {
  category: Category
  categories: Category[]
  currentCategory: string
  expandedCategories: Set<string>
  toggleExpandedCategory: (id: string) => void
  updateFilter: (key: string, value: string) => void
  level?: number
}) {
  const subcategories = categories.filter(cat => cat.parent_id === category.id)
  const hasSubcategories = subcategories.length > 0
  const isSelected = currentCategory.toLowerCase() === category.name.toLowerCase()
  const isExpanded = expandedCategories.has(category.id)

  // Calculate total post count (category + all subcategories)
  const getTotalPostCount = (cat: Category): number => {
    const directCount = cat.post_count || 0
    const childCategories = categories.filter(c => c.parent_id === cat.id)
    const childCount = childCategories.reduce((sum, child) => sum + getTotalPostCount(child), 0)
    return directCount + childCount
  }

  const totalCount = getTotalPostCount(category)

  // Padding increases with level depth
  const paddingLeft = level * 16
  const fontSize = level === 0 ? 'text-base' : level === 1 ? 'text-sm' : level === 2 ? 'text-sm' : 'text-xs'

  return (
    <div>
      <button
        onClick={() => {
          if (hasSubcategories) {
            toggleExpandedCategory(category.id)
          } else {
            updateFilter('category', category.name.toLowerCase())
          }
        }}
        style={{ paddingLeft: `${paddingLeft}px` }}
        className={`w-full flex items-center gap-2 px-3 py-2 mb-1 rounded-lg text-left transition-colors ${
          isSelected
            ? 'bg-brand/10 text-brand font-medium'
            : 'text-foreground hover:bg-muted/50'
        } ${fontSize}`}
      >
        {level === 0 && category.icon && (
          <CategoryIcon iconName={category.icon} className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
        )}
        <span className="flex-1">{category.name}</span>
        {totalCount > 0 && (
          <span className="text-xs text-muted-foreground">({totalCount})</span>
        )}
        {hasSubcategories && (
          <ChevronDown className={`w-3 h-3 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Recursive subcategories */}
      {hasSubcategories && isExpanded && (
        <div className="mt-0.5 space-y-0">
          {subcategories.map((subcategory) => (
            <CategoryTree
              key={subcategory.id}
              category={subcategory}
              categories={categories}
              currentCategory={currentCategory}
              expandedCategories={expandedCategories}
              toggleExpandedCategory={toggleExpandedCategory}
              updateFilter={updateFilter}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function SearchFilters({ categories, isMobileMenuOpen: externalIsMobileMenuOpen, setIsMobileMenuOpen: externalSetIsMobileMenuOpen }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null)
  const [internalIsMobileMenuOpen, setInternalIsMobileMenuOpen] = useState(false)
  const [mobileViewingCategory, setMobileViewingCategory] = useState<string | null>(null)

  // Use external state if provided, otherwise use internal state
  const isMobileMenuOpen = externalIsMobileMenuOpen ?? internalIsMobileMenuOpen
  const setIsMobileMenuOpen = externalSetIsMobileMenuOpen ?? setInternalIsMobileMenuOpen
  const [mobileViewingSubcategory, setMobileViewingSubcategory] = useState<string | null>(null)
  const [mobileCategoryStack, setMobileCategoryStack] = useState<string[]>([])
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
    setMobileCategoryStack([])
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
    }
  }

  const handleCategoryLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredSubcategory(null)
    }, 100)
  }

  const handleSubcategoryHover = () => {
    if (subCloseTimeoutRef.current) {
      clearTimeout(subCloseTimeoutRef.current)
    }
  }

  const handleSubcategoryLeave = () => {
    subCloseTimeoutRef.current = setTimeout(() => {
      setHoveredSubcategory(null)
    }, 100)
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
    // Get current viewing category from stack
    const currentViewingId = mobileCategoryStack.length > 0
      ? mobileCategoryStack[mobileCategoryStack.length - 1]
      : null

    // If we're viewing a subcategory
    if (currentViewingId) {
      const viewingCategory = categories?.find(cat => cat.id === currentViewingId)
      if (!viewingCategory) return null

      const subcategories = getSubcategories(viewingCategory.id)

      return (
        <div className="space-y-3">
          {/* Back button */}
          <button
            onClick={() => {
              setMobileCategoryStack(prev => prev.slice(0, -1))
            }}
            className="flex items-center gap-2 text-foreground hover:text-brand transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Powrót</span>
          </button>

          {/* Current category header - clickable to select */}
          <div className="mb-4">
            <button
              onClick={() => updateFilter('category', viewingCategory.name.toLowerCase())}
              data-navigate="true"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border hover:bg-muted transition-colors"
            >
              {viewingCategory.icon && (
                <CategoryIcon iconName={viewingCategory.icon} className="w-6 h-6 text-muted-foreground" />
              )}
              <span className="font-bold text-lg">{viewingCategory.name}</span>
            </button>
          </div>

          {/* Subcategories */}
          <div className="space-y-2">
            {subcategories.length > 0 ? (
              subcategories.map((subcategory) => {
                const isSelected = currentCategory.toLowerCase() === subcategory.name.toLowerCase()
                const hasChildren = getSubcategories(subcategory.id).length > 0

                return (
                  <button
                    key={subcategory.id}
                    onClick={() => {
                      if (hasChildren) {
                        setMobileCategoryStack(prev => [...prev, subcategory.id])
                      } else {
                        updateFilter('category', subcategory.name.toLowerCase())
                      }
                    }}
                    {...(!hasChildren && { 'data-navigate': 'true' })}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors ${
                      isSelected
                        ? 'bg-brand text-white'
                        : 'bg-card text-foreground border border-border hover:bg-muted'
                    }`}
                  >
                    <span className="font-medium flex-1">{subcategory.name}</span>
                    {hasChildren && (
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Brak podkategorii</p>
            )}
          </div>
        </div>
      )
    }

    // Main categories view
    return (
      <div className="space-y-3">
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
                    setMobileCategoryStack([mainCategory.id])
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
                <CategoryIcon iconName={mainCategory.icon} className="w-6 h-6 text-muted-foreground" />
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

  return (
    <>
      {/* Mobile/Tablet: Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/95 z-50 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile/Tablet: Slide-out menu */}
      <div
        className={`lg:hidden fixed top-0 h-full w-80 max-w-[85vw] bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto pb-20 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          left: 'env(safe-area-inset-left)',
          paddingTop: 'calc(64px + env(safe-area-inset-top))',
          paddingBottom: 'calc(96px + env(safe-area-inset-bottom))',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        <div className="px-6 py-4 space-y-4">
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

      {/* Desktop: Sticky sidebar with recursive categories */}
      <div className="hidden lg:flex flex-col max-h-[calc(100vh-120px)] overflow-y-auto space-y-2 px-3 py-4 bg-card rounded-xl border border-border sticky top-24">
        {/* Header with clear button */}
        <div className="flex items-center justify-between px-3 py-2">
          <h3 className="text-sm font-semibold text-foreground">Kategorie</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              data-navigate="true"
              className="text-xs text-brand hover:text-brand/90 font-medium px-2 py-1 rounded-md hover:bg-brand/5 transition-colors"
            >
              Wyczyść
            </button>
          )}
        </div>

        {/* Main categories with recursive rendering */}
        <div className="space-y-0.5">
          {mainCategories.map((mainCategory) => (
            <CategoryTree
              key={mainCategory.id}
              category={mainCategory}
              categories={categories || []}
              currentCategory={currentCategory}
              expandedCategories={expandedCategories}
              toggleExpandedCategory={toggleExpandedCategory}
              updateFilter={updateFilter}
              level={0}
            />
          ))}
        </div>
      </div>
    </>
  )
}
