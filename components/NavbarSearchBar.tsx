'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SearchResult {
  suggestions: Array<{
    text: string
    type: 'category' | 'combo' | 'pattern' | 'popular' | 'trending' | 'post' | 'smart'
  }>
  trending: Array<{
    text: string
    type: 'trending'
  }>
}

export function NavbarSearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResult>({ suggestions: [], trending: [] })
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
      setResults({ suggestions: [], trending: [] })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setIsOpen(true)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    setIsLoading(true)
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value)
    }, 300)
  }

  // Load initial trending when focusing empty input
  const handleSearchFocus = () => {
    setIsOpen(true)
    if (!searchQuery && results.trending.length === 0) {
      setIsLoading(true)
      performSearch('')
    }
  }

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpen(false)

    if (searchQuery) {
      router.push(`/posts?search=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push('/posts')
    }
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    if (type === 'trending') {
      return (
        <svg className="w-4 h-4 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  }

  const hasResults = results.suggestions.length > 0 || results.trending.length > 0

  return (
    <div ref={dropdownRef} className="relative hidden md:block flex-1 max-w-xl">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center bg-[#FAF8F3] rounded-full px-5 h-10 hover:bg-[#F5F2EA] transition-colors">
          <Search className="w-5 h-5 text-black/40 mr-3 flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Szukaj ogłoszeń..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={handleSearchFocus}
            className="flex-1 outline-none text-sm text-black placeholder:text-black/40 bg-transparent"
            autoComplete="off"
          />
          {isLoading && (
            <div className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin ml-2" />
          )}
        </div>

        {/* Dropdown */}
        {isOpen && !isLoading && hasResults && (
          <Card className="absolute top-full left-0 right-0 mt-2 border border-black/10 rounded-2xl bg-white shadow-lg max-h-[450px] z-50 flex flex-col overflow-hidden">
            <div className="overflow-y-auto p-3">
              {/* Trending - show when no query */}
              {results.trending.length > 0 && !searchQuery && (
                <div className="mb-2">
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-black/60 uppercase tracking-wide">Trendy</p>
                  </div>
                  <div className="space-y-1">
                    {results.trending.slice(0, 5).map((item, index) => (
                      <button
                        key={`trending-${index}`}
                        type="button"
                        onClick={() => {
                          setSearchQuery(item.text)
                          setIsOpen(false)
                          router.push(`/posts?search=${encodeURIComponent(item.text)}`)
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-[#C44E35]/5 rounded-lg transition-all flex items-center gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C44E35]/20 transition-colors">
                          {getSuggestionIcon('trending')}
                        </div>
                        <span className="text-sm text-black font-medium flex-1 truncate">{item.text}</span>
                        <Badge className="rounded-full bg-[#C44E35] text-white text-xs px-2.5 py-0.5 border-0">
                          #{index + 1}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search suggestions - show when typing */}
              {results.suggestions.length > 0 && searchQuery && (
                <div>
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-black/60 uppercase tracking-wide">Sugestie</p>
                  </div>
                  <div className="space-y-1">
                    {results.suggestions.slice(0, 6).map((suggestion, index) => (
                      <button
                        key={`suggestion-${index}`}
                        type="button"
                        onClick={() => {
                          setSearchQuery(suggestion.text)
                          setIsOpen(false)
                          router.push(`/posts?search=${encodeURIComponent(suggestion.text)}`)
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-black/5 rounded-lg transition-all flex items-center gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center flex-shrink-0 group-hover:bg-black/10 transition-colors">
                          {getSuggestionIcon(suggestion.type)}
                        </div>
                        <span className="text-sm text-black font-medium flex-1 truncate">{suggestion.text}</span>
                        {suggestion.type === 'trending' && (
                          <Badge className="rounded-full bg-[#C44E35] text-white text-xs px-2.5 py-0.5 border-0">
                            Trend
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* See all results button */}
            {searchQuery && searchQuery.length >= 2 && (
              <div className="p-3 bg-white border-t border-black/5">
                <button
                  type="submit"
                  className="w-full text-center py-2.5 text-sm font-semibold text-[#C44E35] hover:bg-[#C44E35]/5 rounded-lg transition-all"
                >
                  Zobacz wszystkie wyniki
                </button>
              </div>
            )}
          </Card>
        )}
      </form>
    </div>
  )
}
