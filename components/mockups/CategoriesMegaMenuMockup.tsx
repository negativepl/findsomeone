'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogoWithText } from '@/components/Logo'
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

interface CategoriesMegaMenuMockupProps {
  categories: Category[]
}

export function CategoriesMegaMenuMockup({ categories }: CategoriesMegaMenuMockupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <>
      {/* Navbar Mockup */}
      <header className="border-b border-black/5 bg-white rounded-b-3xl sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 flex justify-between items-center gap-4">
          {/* Logo */}
          <Link href="/">
            <LogoWithText />
          </Link>

          {/* Desktop: Categories Button + Search */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-2xl">
            {/* Categories Button */}
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="outline"
              className="h-10 rounded-full border border-black/10 hover:border-black/30 hover:bg-black/5 transition-all px-4 gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Kategorie
              <svg
                className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>

            {/* Search Bar Mockup */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Czego szukasz?"
                  className="w-full h-10 pl-10 pr-4 rounded-full border border-black/10 focus:border-black/30 focus:outline-none transition-all"
                  disabled
                />
                <svg
                  className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Mobile: Categories Button */}
          <div className="md:hidden">
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border border-black/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>

          {/* Right side buttons mockup */}
          <div className="hidden md:flex gap-2">
            <Button variant="ghost" className="h-10 rounded-full hover:bg-black/5 text-sm px-6">
              Zaloguj się
            </Button>
            <Button className="h-10 rounded-full bg-brand hover:bg-brand/90 text-white border-0 text-sm px-6">
              Zarejestruj się
            </Button>
          </div>
        </div>

        {/* Desktop Mega Menu Dropdown */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="hidden md:block fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Mega Menu Panel */}
            <div className="hidden md:block absolute left-0 right-0 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="container mx-auto px-6">
                <div className="bg-white rounded-3xl shadow-2xl border border-black/5 p-8">
                  <div className="flex gap-8">
                    {/* Left side - All categories grid */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-black mb-4">Wszystkie kategorie</h3>
                      <div className="grid grid-cols-4 gap-3">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onMouseEnter={() => setHoveredCategory(cat.id)}
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-[#FAF8F3] transition-all text-center group"
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                              hoveredCategory === cat.id
                                ? 'bg-brand text-white'
                                : 'bg-brand/10 text-brand group-hover:bg-brand/20'
                            }`}>
                              <CategoryIcon iconName={cat.icon} className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-black">{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right side - Subcategories */}
                    {hoveredCategory && (
                      <div className="w-80 border-l border-black/5 pl-8 animate-in fade-in slide-in-from-right-4 duration-200">
                        {(() => {
                          const hoveredCat = categories.find(c => c.id === hoveredCategory)
                          return hoveredCat ? (
                            <>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center">
                                  <CategoryIcon iconName={hoveredCat.icon} className="w-5 h-5" />
                                </div>
                                <h4 className="text-lg font-bold text-black">{hoveredCat.name}</h4>
                              </div>

                              {hoveredCat.subcategories && hoveredCat.subcategories.length > 0 ? (
                                <div className="space-y-1">
                                  {hoveredCat.subcategories.map((sub) => (
                                    <Link
                                      key={sub.id}
                                      href={`/posts?category=${encodeURIComponent(sub.name.toLowerCase())}`}
                                      className="block px-4 py-2.5 rounded-xl hover:bg-[#FAF8F3] transition-all text-sm font-medium text-black/80 hover:text-black"
                                      onClick={() => setIsOpen(false)}
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                  <Link
                                    href={`/posts?category=${encodeURIComponent(hoveredCat.name.toLowerCase())}`}
                                    className="block px-4 py-2.5 rounded-xl text-sm font-bold text-brand hover:bg-brand/5 transition-all mt-3"
                                    onClick={() => setIsOpen(false)}
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
          </>
        )}
      </header>

      {/* Mobile Bottom Sheet */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-black/5">
              <h3 className="text-xl font-bold text-black">Kategorie</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Categories List */}
            <div className="overflow-y-auto p-6 space-y-2" style={{ maxHeight: 'calc(85vh - 80px)' }}>
              {categories.map((cat) => {
                const isExpanded = hoveredCategory === cat.id
                return (
                  <div key={cat.id} className="border border-black/5 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setHoveredCategory(isExpanded ? null : cat.id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-[#FAF8F3] transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                        <CategoryIcon iconName={cat.icon} className="w-6 h-6" />
                      </div>
                      <span className="font-semibold text-black flex-1 text-left">{cat.name}</span>
                      <svg
                        className={`w-5 h-5 text-black/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Subcategories */}
                    {isExpanded && cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="border-t border-black/5 bg-[#FAF8F3] p-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {cat.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/posts?category=${encodeURIComponent(sub.name.toLowerCase())}`}
                            className="block px-4 py-2.5 rounded-xl hover:bg-white transition-all text-sm font-medium text-black/80"
                            onClick={() => setIsOpen(false)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                        <Link
                          href={`/posts?category=${encodeURIComponent(cat.name.toLowerCase())}`}
                          className="block px-4 py-2.5 rounded-xl text-sm font-bold text-brand hover:bg-white transition-all"
                          onClick={() => setIsOpen(false)}
                        >
                          Zobacz wszystkie →
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
