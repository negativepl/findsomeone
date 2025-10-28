'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [menuHeight, setMenuHeight] = useState<number | 'auto'>('auto')

  // Check if mounted (for portal)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle opening with animation
  const handleOpen = () => {
    // Cancel any pending close
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    setIsClosing(false)
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
    }, 150) // Match animation duration
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

  // Update menu height when hovered category changes
  useEffect(() => {
    if (!isOpen) return

    // Calculate minimum height needed for all categories in the grid
    const totalCategories = categories.length
    // Use 3 columns for calculation (worst case - md/lg breakpoints)
    // On xl+ it's 5 columns so there will be fewer rows and extra space
    const columnsCount = 3
    const rowsNeeded = Math.ceil(totalCategories / columnsCount)
    const categoryRowHeight = 140 // approximate height per row including gap
    const headerHeight = 180 // search bar and title
    const paddingAndMargins = 100 // p-8 padding and extra space
    const minHeightForCategories = headerHeight + (rowsNeeded * categoryRowHeight) + paddingAndMargins

    if (!hoveredCategory) {
      // Reset to auto when no category is hovered
      setMenuHeight('auto')
      return
    }

    const category = categories.find(c => c.id === hoveredCategory)
    if (category) {
      const subcategoryCount = category.subcategories?.length || 0
      // Base height + height per subcategory (approximately 45px per item including spacing)
      // Adding some padding for the header and "Zobacz wszystkie" link
      const calculatedHeight = 200 + (subcategoryCount * 45)
      // Ensure minimum height to accommodate all category rows
      setMenuHeight(Math.max(minHeightForCategories, calculatedHeight))
    }
  }, [hoveredCategory, categories, isOpen])

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
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current)
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
      }, 200) // Delay to prevent rapid switching
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
    // Set a delay before closing to allow returning to button
    closeTimeoutRef.current = setTimeout(() => {
      handleClose()
    }, 50) // Delay to allow returning to button/menu
  }

  const handleMenuMouseEnter = () => {
    // Cancel closing if mouse re-enters the menu
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsClosing(false)
  }

  // Handle button hover to open menu
  const handleButtonMouseEnter = () => {
    // Clear any pending close timeout when hovering over button
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    // Open menu on hover with slight delay
    if (!isOpen) {
      openTimeoutRef.current = setTimeout(() => {
        handleOpen()
      }, 150) // Small delay to prevent accidental opens
    }
  }

  // Handle button mouse leave
  const handleButtonMouseLeave = () => {
    // Cancel opening if hovering stopped before timeout completed
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }

    // Only start close timer if menu is open and not hovering over menu
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }

    if (isOpen) {
      closeTimeoutRef.current = setTimeout(() => {
        handleClose()
      }, 50) // Delay to allow moving to menu
    }
  }

  return (
    <>
      {/* Compact Categories Button */}
      <button
        ref={buttonRef}
        onClick={() => {
          if (isOpen) {
            handleClose()
          } else {
            handleOpen()
          }
        }}
        onMouseEnter={handleButtonMouseEnter}
        onMouseLeave={handleButtonMouseLeave}
        className="w-10 h-10 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] transition-all duration-200 flex items-center justify-center border-0 hover:shadow-sm"
      >
        <div className="w-6 h-6 flex items-center justify-center">
          <div className="w-5 h-4 flex flex-col justify-between">
            {/* Top line */}
            <motion.div
              className="w-full h-0.5 bg-white rounded-full"
              animate={{
                rotate: isOpen ? 45 : 0,
                y: isOpen ? 6 : 0,
              }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformOrigin: 'center' }}
            />
            {/* Middle line */}
            <motion.div
              className="w-full h-0.5 bg-white rounded-full"
              animate={{
                opacity: isOpen ? 0 : 1,
                scaleX: isOpen ? 0 : 1,
              }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformOrigin: 'center' }}
            />
            {/* Bottom line */}
            <motion.div
              className="w-full h-0.5 bg-white rounded-full"
              animate={{
                rotate: isOpen ? -45 : 0,
                y: isOpen ? -6 : 0,
              }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformOrigin: 'center' }}
            />
          </div>
        </div>
      </button>

      {/* Backdrop overlay via portal - dims page content */}
      {mounted && typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                style={{ zIndex: 9998 }}
                onClick={handleClose}
              />
              {/* Invisible bridge between button and menu */}
              <div
                className="hidden md:flex fixed pointer-events-auto justify-center"
                style={{
                  top: '0',
                  left: 0,
                  right: 0,
                  height: '96px',
                  zIndex: 10000
                }}
                onMouseEnter={handleMenuMouseEnter}
                onMouseLeave={handleMenuMouseLeave}
              >
                <div style={{ width: 'min(1200px, calc(100vw - 32px))' }} />
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Mega Menu Panel via portal - positioned below navbar */}
      {mounted && typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.2,
              ease: [0.25, 0.1, 0.25, 1] // Smoother, more natural easing
            }}
            className="hidden md:flex fixed justify-center"
            style={{
              top: '108px',
              left: 0,
              right: 0,
              zIndex: 10001
            }}
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
            onClick={(e) => {
              // Close if clicking on the outer container
              if (e.target === e.currentTarget) {
                handleClose()
              }
            }}
          >
            <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  height: menuHeight
                }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{
                  duration: 0.2,
                  ease: [0.25, 0.1, 0.25, 1],
                  height: {
                    duration: 0.3,
                    ease: [0.25, 0.1, 0.25, 1]
                  }
                }}
                className="bg-white rounded-3xl shadow-2xl border border-black/5 p-8"
                style={{ maxHeight: '80vh', width: 'min(1200px, calc(100vw - 32px))', overflowY: 'auto' }}
                onClick={(e) => {
                  // Stop propagation to prevent closing when clicking inside
                  e.stopPropagation()
                }}
                onMouseEnter={handleMenuMouseEnter}
                onMouseLeave={handleMenuMouseLeave}
              >
                <div className="flex gap-8">
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
                  <style>{`
                    .categories-grid {
                      grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                    @media (min-width: 1024px) {
                      .categories-grid {
                        grid-template-columns: repeat(5, minmax(0, 1fr));
                      }
                    }
                  `}</style>
                  <div className="categories-grid grid gap-3 relative">
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

                      return filteredCategories.map((cat, index) => {
                        return (
                          <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.02,
                              ease: [0.16, 1, 0.3, 1]
                            }}
                          >
                            <Link
                              href={`/posts?category=${encodeURIComponent(cat.name.toLowerCase())}`}
                              onMouseEnter={() => handleCategoryHover(cat.id)}
                              onMouseLeave={handleCategoryLeave}
                              onClick={() => handleClose()}
                              className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-[#FAF8F3] transition-all duration-200 text-center group relative"
                            >
                              <div className="relative w-12 h-12">
                                {hoveredCategory === cat.id ? (
                                  <motion.div
                                    layoutId="categoryHighlight"
                                    className="absolute inset-0 bg-[#C44E35] rounded-xl ring-4 ring-[#C44E35]/20 shadow-lg"
                                    transition={{
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 40
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center relative transition-all duration-200 ease-out ${
                                    hoveredCategory === cat.id
                                      ? 'text-white scale-110'
                                      : 'bg-[#C44E35]/10 text-[#C44E35] group-hover:bg-[#C44E35]/20 shadow-sm'
                                  }`}
                                >
                                  <CategoryIcon iconName={cat.icon} className={`w-6 h-6 transition-transform duration-200 ${
                                    hoveredCategory === cat.id ? 'scale-110' : 'group-hover:scale-110'
                                  }`} />
                                </div>
                              </div>
                              <span className={`text-xs font-medium transition-colors duration-200 ${
                                hoveredCategory === cat.id ? 'text-[#C44E35] font-semibold' : 'text-black'
                              }`}>{cat.name}</span>
                            </Link>
                          </motion.div>
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
                  <AnimatePresence mode="wait">
                    {hoveredCategory && (() => {
                      const hoveredCat = categories.find(c => c.id === hoveredCategory)

                      return hoveredCat ? (
                        <motion.div
                          key={hoveredCat.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{
                            duration: 0.1,
                            ease: "easeOut"
                          }}
                          onMouseEnter={handleSubcategoriesEnter}
                          onMouseLeave={handleSubcategoriesLeave}
                        >
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.1, delay: 0 }}
                            className="flex items-center gap-3 mb-6"
                          >
                            <div className="w-10 h-10 rounded-xl bg-[#C44E35] text-white flex items-center justify-center">
                              <CategoryIcon iconName={hoveredCat.icon} className="w-5 h-5" />
                            </div>
                            <h4 className="text-lg font-bold text-black">{hoveredCat.name}</h4>
                          </motion.div>

                          {/* Subcategories */}
                          {hoveredCat.subcategories && hoveredCat.subcategories.length > 0 ? (
                            <div className="space-y-1">
                              {hoveredCat.subcategories.map((sub, index) => (
                                <motion.div
                                  key={sub.id}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    duration: 0.1,
                                    delay: index * 0.01,
                                    ease: "easeOut"
                                  }}
                                >
                                  <Link
                                    href={`/posts?category=${encodeURIComponent(sub.name.toLowerCase())}`}
                                    className="inline-block px-4 py-2.5 rounded-xl hover:bg-[#FAF8F3] transition-all text-sm font-medium text-black/80 hover:text-black"
                                    onClick={() => handleClose()}
                                  >
                                    {sub.name}
                                  </Link>
                                </motion.div>
                              ))}
                              <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.1,
                                  delay: hoveredCat.subcategories.length * 0.01,
                                  ease: "easeOut"
                                }}
                              >
                                <Link
                                  href={`/posts?category=${encodeURIComponent(hoveredCat.name.toLowerCase())}`}
                                  className="inline-block px-4 py-2.5 rounded-xl text-sm font-bold text-[#C44E35] hover:bg-[#C44E35]/5 transition-all mt-3"
                                  onClick={() => handleClose()}
                                >
                                  Zobacz wszystkie →
                                </Link>
                              </motion.div>
                            </div>
                          ) : (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.1, delay: 0 }}
                              className="text-sm text-black/60"
                            >
                              Brak podkategorii
                            </motion.p>
                          )}
                        </motion.div>
                      ) : null
                    })()}
                  </AnimatePresence>
                </div>
                </div>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  )
}
