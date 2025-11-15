'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CategoryIcon } from '@/lib/category-icons'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  subcategories?: Subcategory[]
}

interface Subcategory {
  id: string
  name: string
  slug: string
}

interface CategoriesFloatingButtonProps {
  categories: Category[]
}

export function CategoriesFloatingButton({ categories }: CategoriesFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isOverSubcategories, setIsOverSubcategories] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Check if mounted (for portal)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch category counts when menu opens
  useEffect(() => {
    if (!isOpen || Object.keys(categoryCounts).length > 0) return

    const fetchCounts = async () => {
      const supabase = createClient()
      const counts: Record<string, number> = {}

      for (const category of categories) {
        const { count } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .eq('category_id', category.id)

        counts[category.id] = count || 0
      }

      setCategoryCounts(counts)
    }

    fetchCounts()
  }, [isOpen, categories, categoryCounts])

  // Focus search input when menu opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      setSearchQuery('')
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC closes menu
      if (e.key === 'Escape') {
        setIsOpen(false)
        return
      }

      // Don't interfere with search input
      if (document.activeElement === searchInputRef.current) {
        return
      }

      // Arrow navigation for categories
      const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )

      if (!hoveredCategory && filteredCategories.length > 0) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          setHoveredCategory(filteredCategories[0].id)
        }
        return
      }

      const currentIndex = filteredCategories.findIndex(c => c.id === hoveredCategory)

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const nextIndex = (currentIndex + 1) % filteredCategories.length
        setHoveredCategory(filteredCategories[nextIndex].id)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const prevIndex = currentIndex === 0 ? filteredCategories.length - 1 : currentIndex - 1
        setHoveredCategory(filteredCategories[prevIndex].id)
      } else if (e.key === 'Enter' && hoveredCategory) {
        e.preventDefault()
        const category = filteredCategories.find(c => c.id === hoveredCategory)
        if (category) {
          window.location.href = `/results?category=${encodeURIComponent(category.name.toLowerCase())}`
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, hoveredCategory, categories, searchQuery])

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])


  const handleCategoryHover = (categoryId: string) => {
    // Clear existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    // Don't change if mouse is over subcategories
    if (!isOverSubcategories) {
      // Add delay before changing category
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredCategory(categoryId)
      }, 300) // 300ms delay (increased from 150ms)
    }
  }

  const handleCategoryLeave = () => {
    // Clear timeout if leaving before delay completes
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
  }

  const handleSubcategoriesEnter = () => {
    setIsOverSubcategories(true)
    // Clear any pending category change
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
  }

  const handleSubcategoriesLeave = () => {
    setIsOverSubcategories(false)
  }

  const backdropContent = isOpen && mounted ? createPortal(
    <div
      className="fixed inset-0 bg-black/30"
      onClick={() => setIsOpen(false)}
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9998,
      }}
    />,
    document.body
  ) : null

  return (
    <>
      {/* Backdrop via Portal - renders directly in body */}
      {backdropContent}

      {/* Floating Button - Desktop Only */}
      <div className="hidden md:block fixed bottom-8 left-8" style={{ zIndex: 9999 }}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-14 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 shadow-2xl px-6 gap-3 transition-all hover:scale-105"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="font-semibold">Kategorie</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </div>

      {/* Mega Menu Panel */}
      {isOpen && (
        <div className="hidden md:block fixed bottom-24 left-8 animate-in fade-in slide-in-from-bottom-4 duration-200" style={{ zIndex: 9999 }}>
          <div className="bg-card rounded-3xl shadow-2xl border border-border p-8" style={{ width: '950px', maxHeight: '75vh', overflowY: 'auto' }}>
            <div className="flex gap-12">
              {/* Left side - All categories grid */}
              <div className="flex-1 pr-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-foreground">Wszystkie kategorie</h3>
                  <div className="relative w-64">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Szukaj kategorii..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-9 pr-4 rounded-full border border-black/10 dark:border-border focus:border-brand focus:outline-none text-sm transition-all"
                    />
                    <svg
                      className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {(() => {
                    // Filter by category name OR subcategory names
                    const filteredCategories = categories.filter(cat => {
                      const searchLower = searchQuery.toLowerCase()
                      const categoryMatch = cat.name.toLowerCase().includes(searchLower)
                      const subcategoryMatch = cat.subcategories?.some(sub =>
                        sub.name.toLowerCase().includes(searchLower)
                      )
                      return categoryMatch || subcategoryMatch
                    })

                    if (filteredCategories.length === 0) {
                      return (
                        <div className="col-span-4 text-center py-12 text-muted-foreground">
                          Nie znaleziono kategorii
                        </div>
                      )
                    }

                    return filteredCategories.map((cat) => {
                      const count = categoryCounts[cat.id] || 0

                      return (
                        <button
                          key={cat.id}
                          onMouseEnter={() => handleCategoryHover(cat.id)}
                          onMouseLeave={handleCategoryLeave}
                          className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-muted transition-all duration-300 text-center group relative overflow-hidden"
                        >
                          {/* Shine effect on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />

                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            hoveredCategory === cat.id
                              ? 'bg-brand text-brand-foreground ring-2 ring-brand/30 scale-110'
                              : 'bg-brand/10 text-brand group-hover:bg-brand/20 group-hover:scale-105'
                          }`}>
                            <CategoryIcon iconName={cat.icon} className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`text-xs font-medium transition-colors duration-300 ${
                              hoveredCategory === cat.id ? 'text-brand' : 'text-foreground'
                            }`}>{cat.name}</span>
                            {count > 0 && (
                              <span className="text-[10px] text-muted-foreground mt-0.5">
                                ({count})
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })
                  })()}
                </div>
              </div>

              {/* Safe zone - invisible area to help mouse travel */}
              {hoveredCategory && (
                <div
                  className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none"
                  style={{ zIndex: -1 }}
                />
              )}

              {/* Right side - Subcategories */}
              {hoveredCategory && (
                <div
                  className="w-80 border-l border-black/5 pl-8 animate-in fade-in slide-in-from-right-4 duration-200"
                  onMouseEnter={handleSubcategoriesEnter}
                  onMouseLeave={handleSubcategoriesLeave}
                  style={{ minHeight: '400px' }}
                >
                  {(() => {
                    const hoveredCat = categories.find(c => c.id === hoveredCategory)

                    return hoveredCat ? (
                      <>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl bg-brand text-brand-foreground flex items-center justify-center">
                            <CategoryIcon iconName={hoveredCat.icon} className="w-5 h-5" />
                          </div>
                          <h4 className="text-lg font-bold text-foreground">{hoveredCat.name}</h4>
                        </div>

                        {/* Subcategories */}
                        {hoveredCat.subcategories && hoveredCat.subcategories.length > 0 ? (
                          <div className="space-y-1">
                            {hoveredCat.subcategories.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/results?category=${encodeURIComponent(sub.name.toLowerCase())}`}
                                className="block px-4 py-2.5 rounded-xl hover:bg-muted transition-all text-sm font-medium text-muted-foreground hover:text-foreground"
                                onClick={() => setIsOpen(false)}
                              >
                                {sub.name}
                              </Link>
                            ))}
                            <Link
                              href={`/results?category=${encodeURIComponent(hoveredCat.name.toLowerCase())}`}
                              className="block px-4 py-2.5 rounded-xl text-sm font-bold text-brand hover:bg-brand/5 transition-all mt-3"
                              onClick={() => setIsOpen(false)}
                            >
                              Zobacz wszystkie →
                            </Link>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Brak podkategorii</p>
                        )}
                      </>
                    ) : null
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
