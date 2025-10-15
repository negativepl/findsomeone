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

interface CategoriesNavButtonProps {
  categories: Category[]
}

export function CategoriesNavButton({ categories }: CategoriesNavButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isOverSubcategories, setIsOverSubcategories] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check if mounted (for portal)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle opening with animation
  const handleOpen = () => {
    setIsOpen(true)
    setIsOpening(true)
    // Remove opening state after animation completes
    setTimeout(() => {
      setIsOpening(false)
    }, 50) // Short delay to trigger animation
  }

  // Handle closing with animation
  const handleClose = () => {
    setIsClosing(true)
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
      setHoveredCategory(null)
    }, 300) // Match animation duration
  }

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
        handleClose()
        return
      }

      // Don't interfere with search input
      if (document.activeElement === searchInputRef.current) {
        return
      }

      // Arrow navigation for categories
      const filteredCategories = categories.filter(cat => {
        const searchLower = searchQuery.toLowerCase()
        const categoryMatch = cat.name.toLowerCase().includes(searchLower)
        const subcategoryMatch = cat.subcategories?.some(sub =>
          sub.name.toLowerCase().includes(searchLower)
        )
        return categoryMatch || subcategoryMatch
      })

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
          window.location.href = `/posts?category=${encodeURIComponent(category.name.toLowerCase())}`
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
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
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
      }, 300) // 300ms delay
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

  const handleMenuMouseLeave = () => {
    // Clear any existing close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    // Set a short delay before closing to prevent accidental closes
    closeTimeoutRef.current = setTimeout(() => {
      handleClose()
    }, 200)
  }

  const handleMenuMouseEnter = () => {
    // Cancel closing if mouse re-enters the menu
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    setIsClosing(false)
  }

  const backdropContent = isOpen && mounted ? createPortal(
    <div
      className={`fixed inset-0 bg-gray-50/95 z-40 transition-opacity duration-300 ${
        isClosing || isOpening ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={() => handleClose()}
    />,
    document.body
  ) : null

  return (
    <>
      {/* Backdrop via Portal - renders directly in body */}
      {backdropContent}

      {/* Compact Categories Button */}
      <button
        onClick={() => {
          if (isOpen) {
            handleClose()
          } else {
            handleOpen()
          }
        }}
        className="h-10 rounded-full bg-[#FAF8F3] hover:bg-[#F5F1E8] transition-colors px-4 gap-2 flex items-center border-0"
      >
        <svg className="w-5 h-5 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="text-sm font-medium hidden lg:inline text-black">Kategorie</span>
      </button>

      {/* Mega Menu Panel - positioned below navbar */}
      {isOpen && (
        <div
          className={`hidden md:block fixed left-0 right-0 transition-all duration-300 ease-out ${
            isClosing
              ? 'opacity-0 -translate-y-4'
              : isOpening
              ? 'opacity-0 -translate-y-4'
              : 'opacity-100 translate-y-0'
          }`}
          style={{ top: '100px', zIndex: 45 }}
          onClick={(e) => {
            // Close if clicking on the outer container
            if (e.target === e.currentTarget) {
              handleClose()
            }
          }}
        >
          <div
            className="container mx-auto px-6"
            style={{ maxWidth: '1400px' }}
            onClick={(e) => {
              // Close if clicking on the container padding area
              if (e.target === e.currentTarget) {
                handleClose()
              }
            }}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl border border-black/5 p-8"
              style={{ minHeight: '500px', maxHeight: '80vh', overflowY: 'auto' }}
              onClick={(e) => {
                // Stop propagation to prevent closing when clicking inside
                e.stopPropagation()
              }}
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
            >
              <div className="flex gap-8" style={{ minHeight: '450px' }}>
                {/* Left side - All categories grid */}
                <div className="pr-6" style={{ flex: '0 0 65%' }}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-black">Wszystkie kategorie</h3>
                    <div className="relative w-64">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Szukaj kategorii..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-9 rounded-full border border-black/10 focus:border-[#C44E35] focus:outline-none text-sm transition-all"
                      />
                      <svg
                        className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60 transition-colors"
                          aria-label="Wyczyść wyszukiwanie"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
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
                        // Find suggestions based on partial matches
                        const suggestions = categories
                          .filter(cat => {
                            const searchLower = searchQuery.toLowerCase()
                            const words = searchLower.split(' ')
                            return words.some(word =>
                              word.length > 2 && cat.name.toLowerCase().includes(word)
                            )
                          })
                          .slice(0, 3)

                        return (
                          <div className="col-span-5 text-center py-12">
                            <p className="text-black/60 mb-4">
                              Nie znaleziono kategorii dla "{searchQuery}"
                            </p>
                            {suggestions.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm text-black/50 mb-3">Czy chodziło Ci o:</p>
                                <div className="flex gap-2 justify-center flex-wrap">
                                  {suggestions.map(cat => (
                                    <Link
                                      key={cat.id}
                                      href={`/posts?category=${encodeURIComponent(cat.name.toLowerCase())}`}
                                      onClick={() => handleClose()}
                                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF8F3] hover:bg-[#C44E35]/10 text-sm font-medium text-black/80 hover:text-[#C44E35] transition-all"
                                    >
                                      <CategoryIcon iconName={cat.icon} className="w-4 h-4" />
                                      {cat.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      }

                      return filteredCategories.map((cat) => {
                        return (
                          <Link
                            key={cat.id}
                            href={`/posts?category=${encodeURIComponent(cat.name.toLowerCase())}`}
                            onMouseEnter={() => handleCategoryHover(cat.id)}
                            onMouseLeave={handleCategoryLeave}
                            onClick={() => handleClose()}
                            className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-[#FAF8F3] transition-all duration-300 text-center group"
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              hoveredCategory === cat.id
                                ? 'bg-[#C44E35] text-white ring-2 ring-[#C44E35]/30 scale-110'
                                : 'bg-[#C44E35]/10 text-[#C44E35] group-hover:bg-[#C44E35]/20 group-hover:scale-105'
                            }`}>
                              <CategoryIcon iconName={cat.icon} className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                            </div>
                            <span className={`text-xs font-medium transition-colors duration-300 ${
                              hoveredCategory === cat.id ? 'text-[#C44E35]' : 'text-black'
                            }`}>{cat.name}</span>
                          </Link>
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
                <div
                  className="border-l border-black/5 pl-8"
                  style={{ flex: '0 0 35%' }}
                >
                  {hoveredCategory && (
                  <div
                    className="animate-in fade-in slide-in-from-right-4 duration-200"
                    onMouseEnter={handleSubcategoriesEnter}
                    onMouseLeave={handleSubcategoriesLeave}
                  >
                    {(() => {
                      const hoveredCat = categories.find(c => c.id === hoveredCategory)

                      return hoveredCat ? (
                        <>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#C44E35] text-white flex items-center justify-center">
                              <CategoryIcon iconName={hoveredCat.icon} className="w-5 h-5" />
                            </div>
                            <h4 className="text-lg font-bold text-black">{hoveredCat.name}</h4>
                          </div>

                          {/* Subcategories */}
                          {hoveredCat.subcategories && hoveredCat.subcategories.length > 0 ? (
                            <div className="space-y-1">
                              {hoveredCat.subcategories.map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={`/posts?category=${encodeURIComponent(sub.name.toLowerCase())}`}
                                  className="block px-4 py-2.5 rounded-xl hover:bg-[#FAF8F3] transition-all text-sm font-medium text-black/80 hover:text-black"
                                  onClick={() => handleClose()}
                                >
                                  {sub.name}
                                </Link>
                              ))}
                              <Link
                                href={`/posts?category=${encodeURIComponent(hoveredCat.name.toLowerCase())}`}
                                className="block px-4 py-2.5 rounded-xl text-sm font-bold text-[#C44E35] hover:bg-[#C44E35]/5 transition-all mt-3"
                                onClick={() => handleClose()}
                              >
                                Zobacz wszystkie →
                              </Link>
                            </div>
                          ) : (
                            <p className="text-sm text-black/60">Brak podkategorii</p>
                          )}
                        </>
                      ) : null
                    })()}
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
