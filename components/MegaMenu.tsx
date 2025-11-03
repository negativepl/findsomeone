'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Menu, LucideIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as LucideIcons from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  parent_id: string | null
  display_order: number
  children?: Category[]
}

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [hoveredPath, setHoveredPath] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })

      if (data && !error) {
        // Build tree structure
        const categoryMap = new Map<string, Category>()
        const rootCategories: Category[] = []

        // First pass: create map
        data.forEach(cat => {
          categoryMap.set(cat.id, { ...cat, children: [] })
        })

        // Second pass: build tree
        data.forEach(cat => {
          const category = categoryMap.get(cat.id)!
          if (cat.parent_id) {
            const parent = categoryMap.get(cat.parent_id)
            if (parent) {
              parent.children = parent.children || []
              parent.children.push(category)
            }
          } else {
            rootCategories.push(category)
          }
        })

        setCategories(rootCategories)
      }
    }

    fetchCategories()
  }, [])

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
      setHoveredPath([])
    }, 200)
  }

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const handleCategoryHover = (categoryId: string, level: number) => {
    setHoveredPath(prev => [...prev.slice(0, level), categoryId])
  }

  const getVisibleCategories = (level: number): Category[] => {
    if (level === 0) return categories

    let current = categories
    for (let i = 0; i < level; i++) {
      const parentId = hoveredPath[i]
      if (!parentId) return []

      const parent = current.find(cat => cat.id === parentId)
      if (!parent || !parent.children || parent.children.length === 0) return []
      current = parent.children
    }

    return current
  }

  const buildCategoryPath = (categoryId: string): string => {
    const findPath = (cats: Category[], targetId: string, currentPath: string[] = []): string[] | null => {
      for (const cat of cats) {
        const newPath = [...currentPath, cat.slug]
        if (cat.id === targetId) {
          return newPath
        }
        if (cat.children) {
          const found = findPath(cat.children, targetId, newPath)
          if (found) return found
        }
      }
      return null
    }

    const path = findPath(categories, categoryId)
    return path ? `/kategoria/${path.join('/')}` : '#'
  }

  const getIconComponent = (iconName: string | null): LucideIcon | null => {
    if (!iconName) return null

    // Convert kebab-case to PascalCase (e.g., 'heart-pulse' -> 'HeartPulse')
    const pascalCase = iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')

    return (LucideIcons as any)[pascalCase] || null
  }

  // Calculate max depth to show
  const maxVisibleLevels = 4
  const levels = Array.from({ length: maxVisibleLevels }, (_, i) => i)

  return (
    <div
      className="relative"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="flex items-center justify-center h-10 w-10 rounded-full bg-brand hover:bg-brand/90 transition-colors"
        aria-label="Menu kategorii"
        aria-expanded={isOpen}
      >
        <Menu className="h-5 w-5 text-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-2 bg-card border border-border rounded-2xl shadow-lg overflow-hidden"
            style={{ zIndex: 10000 }}
          >
            <div className="flex">
              {levels.map(level => {
                const visibleCats = getVisibleCategories(level)
                if (visibleCats.length === 0 && level > 0) return null

                return (
                  <div
                    key={level}
                    className="min-w-[240px] max-h-[80vh] overflow-y-auto border-r border-border last:border-r-0"
                  >
                    {visibleCats.map(category => {
                      const isHovered = hoveredPath[level] === category.id
                      const hasChildren = category.children && category.children.length > 0
                      const categoryUrl = buildCategoryPath(category.id)

                      const IconComponent = getIconComponent(category.icon)

                      return (
                        <div
                          key={category.id}
                          className={`group relative ${isHovered ? 'bg-accent' : ''}`}
                          onMouseEnter={() => handleCategoryHover(category.id, level)}
                        >
                          <Link
                            href={categoryUrl}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors ${
                              isHovered ? 'bg-accent' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {IconComponent && (
                                <IconComponent className="w-5 h-5 text-foreground shrink-0" />
                              )}
                              <span className="text-sm font-medium text-foreground truncate">
                                {category.name}
                              </span>
                            </div>
                            {hasChildren && (
                              <svg
                                className="w-4 h-4 text-muted-foreground shrink-0 ml-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            )}
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
