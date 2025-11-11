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

interface PostsPageClientProps {
  categories: Category[]
  children: React.ReactNode
}

export function PostsPageClient({ categories, children }: PostsPageClientProps) {
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
