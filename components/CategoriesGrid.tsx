'use client'

import { useState } from 'react'
import type { ReactElement } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { CategoryIcon } from '@/lib/category-icons'

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

interface CategoriesGridProps {
  categories: Category[]
}

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const COLUMNS = 5

  const handleCategoryClick = (categoryId: string, e: React.MouseEvent) => {
    e.preventDefault()
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  // Calculate which row each category is in and insert expanded panel after each row
  const renderDesktopGrid = () => {
    const rows: ReactElement[][] = []
    let currentRow: ReactElement[] = []

    categories.forEach((cat, index) => {
      currentRow.push(
        <button
          key={cat.id}
          onClick={(e) => handleCategoryClick(cat.id, e)}
          className="text-left"
        >
          <Card className={`border-0 rounded-3xl bg-[#FAF8F3] hover:bg-[#F5F1E8] transition-all cursor-pointer shadow-sm aspect-square ${
            expandedCategory === cat.id ? 'ring-2 ring-brand' : ''
          }`}>
            <CardContent className="text-center flex flex-col items-center justify-center h-full py-6 px-4">
              <div className="mx-auto rounded-2xl bg-brand/10 flex items-center justify-center text-brand" style={{ width: '64px', height: '64px' }}>
                <CategoryIcon iconName={cat.icon} className="w-7 h-7" />
              </div>
              <div className="h-4"></div>
              <p className="font-semibold text-black text-base leading-tight">{cat.name}</p>
            </CardContent>
          </Card>
        </button>
      )

      // End of row or last item
      if ((index + 1) % COLUMNS === 0 || index === categories.length - 1) {
        rows.push([...currentRow])
        currentRow = []
      }
    })

    return rows.map((row, rowIndex) => {
      const startIndex = rowIndex * COLUMNS
      const endIndex = Math.min(startIndex + COLUMNS, categories.length)
      const categoriesInRow = categories.slice(startIndex, endIndex)
      const expandedInThisRow = categoriesInRow.find(cat => cat.id === expandedCategory)

      return (
        <div key={rowIndex}>
          {/* Row of categories */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }} className="mb-3">
            {row}
          </div>

          {/* Expanded panel for this row */}
          {expandedInThisRow && (
            <div className="mb-3 p-6 bg-white rounded-2xl border border-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpandedCategory(null)}
                    className="text-brand hover:text-brand/90 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h4 className="text-lg font-semibold text-black">
                    {expandedInThisRow.name}
                  </h4>
                </div>
                <button
                  onClick={() => setExpandedCategory(null)}
                  className="text-black/60 hover:text-black transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {expandedInThisRow.subcategories && expandedInThisRow.subcategories.length > 0 ? (
                  expandedInThisRow.subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/results?category=${encodeURIComponent(sub.name.toLowerCase())}`}
                      className="px-4 py-3 bg-[#FAF8F3] hover:bg-[#F5F1E8] rounded-xl transition-colors text-sm font-medium text-black text-center"
                    >
                      {sub.name}
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-black/60 col-span-4">Brak podkategorii</p>
                )}
              </div>
              <Link
                href={`/results?category=${encodeURIComponent(expandedInThisRow.name.toLowerCase())}`}
                className="mt-4 inline-block text-sm font-medium text-brand hover:text-brand/90 transition-colors"
              >
                Zobacz wszystkie w kategorii →
              </Link>
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="relative">
      {/* Mobile - Horizontal Scroll */}
      <div className="md:hidden overflow-x-auto scrollbar-hide -mx-6 snap-x snap-mandatory">
        <div className="horizontal-scroll-padding-mobile flex gap-4 pb-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/results?category=${encodeURIComponent(cat.name.toLowerCase())}`}
              className="flex-shrink-0 snap-center"
              style={{ width: '200px' }}
            >
              <Card className="border-0 rounded-3xl bg-[#FAF8F3] hover:bg-[#F5F1E8] transition-all cursor-pointer h-full flex flex-col shadow-sm">
                <CardContent className="text-center flex flex-col items-center justify-center flex-1 py-8 px-5">
                  <div className="mx-auto rounded-2xl bg-brand/10 flex items-center justify-center text-brand" style={{ width: '80px', height: '80px' }}>
                    <CategoryIcon iconName={cat.icon} className="w-8 h-8" />
                  </div>
                  <div className="h-5"></div>
                  <p className="font-semibold text-black text-lg leading-tight">{cat.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop - Grid with row-based expansion */}
      <div className="max-md:hidden">
        {renderDesktopGrid()}
      </div>
    </div>
  )
}
