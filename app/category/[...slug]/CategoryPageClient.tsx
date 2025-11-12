'use client'

import { useState, useEffect } from 'react'
import { SearchFilters } from '@/components/SearchFilters'
import { FiltersPlaceholder } from '@/components/FiltersPlaceholder'
import { MobileFiltersMenu } from '@/components/MobileFiltersMenu'
import { MobileCategoriesMenu } from '@/components/MobileCategoriesMenu'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string | null
  parent_id?: string | null
  post_count?: number
}

interface CategoryPageClientProps {
  categories: Category[]
  children: React.ReactNode
}

export function CategoryPageClient({ categories, children }: CategoryPageClientProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)

  // Close filters when mobile dock categories or menu open
  useEffect(() => {
    const handleClose = () => {
      setIsFiltersOpen(false)
    }

    window.addEventListener('mobileDockCategoriesOpen', handleClose)
    window.addEventListener('mobileDockMenuOpen', handleClose)
    return () => {
      window.removeEventListener('mobileDockCategoriesOpen', handleClose)
      window.removeEventListener('mobileDockMenuOpen', handleClose)
    }
  }, [])

  // Close categories when mobile dock menus open
  useEffect(() => {
    const handleClose = () => {
      setIsCategoriesOpen(false)
    }

    window.addEventListener('mobileDockCategoriesOpen', handleClose)
    window.addEventListener('mobileDockMenuOpen', handleClose)
    return () => {
      window.removeEventListener('mobileDockCategoriesOpen', handleClose)
      window.removeEventListener('mobileDockMenuOpen', handleClose)
    }
  }, [])

  return (
    <>
      {/* Mobile Filters Menu - Single floating button */}
      <MobileFiltersMenu
        onFiltersClick={() => setIsFiltersOpen(true)}
      />

      {/* Tablet Categories Menu - Floating button for md screens */}
      <MobileCategoriesMenu
        onCategoriesClick={() => setIsCategoriesOpen(true)}
      />

      {/* Filters Drawer - controlled by MobileFiltersMenu */}
      <FiltersPlaceholder
        fullWidth
        isFiltersOpen={isFiltersOpen}
        setIsFiltersOpen={setIsFiltersOpen}
      />

      {/* Tablet Categories Drawer - controlled by MobileCategoriesMenu */}
      <div className="hidden md:block lg:hidden">
        <SearchFilters
          categories={categories}
          isMobileMenuOpen={isCategoriesOpen}
          setIsMobileMenuOpen={setIsCategoriesOpen}
        />
      </div>

      {/* Full Width Filters Placeholder - Desktop */}
      <div className="hidden lg:block w-full mb-6 p-4 bg-card rounded-2xl border border-border">
        <div className="space-y-4 opacity-30 pointer-events-none relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Filtry</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Cena', 'Ocena', 'Odległość', 'Dostępność', 'Doświadczenie', 'Warunki', 'Gwarancja'].map((filter) => (
              <div key={filter} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">{filter}</label>
                <button
                  disabled
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-muted-foreground cursor-not-allowed text-sm"
                >
                  <span>Wybierz...</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-background/95 px-6 py-3 rounded-lg border border-border shadow-sm">
              <p className="text-sm font-medium text-muted-foreground text-center">
                Funkcjonalność filtrów jest w trakcie budowania
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Sidebar + Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left Sidebar - Categories (Desktop only, mobile/tablet uses drawer) */}
        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start z-40">
          <SearchFilters categories={categories} />
        </aside>

        {/* Right Content - Posts */}
        {children}
      </div>
    </>
  )
}
