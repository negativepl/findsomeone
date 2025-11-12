'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface SearchResult {
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
  suggestions: Array<{
    text: string
    type: 'category' | 'combo' | 'pattern' | 'popular' | 'trending' | 'post' | 'smart'
  }>
  trending: Array<{
    text: string
    type: 'trending'
  }>
  popular: Array<{
    text: string
    type: 'popular'
  }>
  smart?: Array<{
    text: string
    type: 'smart'
    score?: number
  }>
  queryCorrection?: {
    original: string
    corrected: string
    confidence: number
  } | null
}

interface LiveSearchBarProps {
  initialSearch?: string
  initialCity?: string
}

export function LiveSearchBar({ initialSearch = '', initialCity = '' }: LiveSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [cityQuery, setCityQuery] = useState(initialCity)
  const [results, setResults] = useState<SearchResult>({ categories: [], suggestions: [], trending: [], popular: [], smart: [] })
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [citySuggestions, setCitySuggestions] = useState<Array<{ name: string; voivodeship: string }>>([])
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const [isCityLoading, setIsCityLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{ city: string | null; loading: boolean }>({ city: null, loading: false })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const cityDropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const cityDebounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Save search to recent searches
  const saveRecentSearch = useCallback((query: string) => {
    if (!query || query.length < 2) return

    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 3)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }, [recentSearches])

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Search failed')
      }
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
      setResults({ categories: [], suggestions: [], trending: [], popular: [] })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get user location
  const getUserLocation = useCallback(async () => {
    setUserLocation({ city: null, loading: true })

    if (!navigator.geolocation) {
      setUserLocation({ city: null, loading: false })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use Nominatim reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          )
          const data = await response.json()

          // Try to get city from different fields
          const city = data.address?.city ||
                      data.address?.town ||
                      data.address?.village ||
                      data.address?.municipality ||
                      null

          setUserLocation({ city, loading: false })

          if (city) {
            setCityQuery(city)
            setIsCityDropdownOpen(false)
          }
        } catch (error) {
          // Silently handle geocoding errors
          setUserLocation({ city: null, loading: false })
        }
      },
      (error) => {
        // Silently handle geolocation errors (user denied, unavailable, etc.)
        setUserLocation({ city: null, loading: false })
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // Cache position for 5 minutes
      }
    )
  }, [])

  // Search cities
  const searchCities = useCallback(async (query: string) => {
    if (query.length < 2) {
      // Show popular cities
      try {
        const response = await fetch('/api/cities')
        const data = await response.json()
        setCitySuggestions(data.cities || [])
      } catch (error) {
        console.error('Cities error:', error)
      }
      setIsCityLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/cities?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setCitySuggestions(data.cities || [])
    } catch (error) {
      console.error('Cities error:', error)
    } finally {
      setIsCityLoading(false)
    }
  }, [])

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setSelectedIndex(-1)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // If empty, close dropdown and show default content
    if (!value || value.trim().length === 0) {
      setIsOpen(false)
      setIsLoading(false)
      setResults({ categories: [], suggestions: [], trending: [], popular: [] })
      return
    }

    // Show results for any input
    setIsOpen(true)
    setIsLoading(true)
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value)
    }, 150) // Faster response - 150ms instead of 300ms
  }

  // Load initial popular/trending when focusing empty input
  const handleSearchFocus = () => {
    setIsOpen(true)
    if (!searchQuery && results.popular.length === 0 && results.trending.length === 0) {
      setIsLoading(true)
      performSearch('')
    }
  }

  // Handle city input change
  const handleCityChange = (value: string) => {
    setCityQuery(value)
    setIsCityDropdownOpen(true)

    if (cityDebounceTimerRef.current) {
      clearTimeout(cityDebounceTimerRef.current)
    }

    setIsCityLoading(true)
    cityDebounceTimerRef.current = setTimeout(() => {
      searchCities(value)
    }, 300)
  }

  // Track search query for analytics
  const trackSearch = useCallback(async (query: string, clickedResult?: string) => {
    if (!query || query.length < 2) return

    try {
      await fetch('/api/search/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, clickedResult }),
      })
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.error('Failed to track search:', error)
    }
  }, [])

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery) {
      saveRecentSearch(searchQuery)
      trackSearch(searchQuery) // Track the search
    }
    setIsOpen(false)

    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (cityQuery) params.set('city', cityQuery)

    router.push(`/posts${params.toString() ? `?${params}` : ''}`)
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    const totalItems =
      recentSearches.length +
      results.suggestions.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      // Handle selection based on index
      // This will be implemented when rendering items
    }
  }

  // Highlight matching text in suggestions
  const highlightText = (text: string, query: string) => {
    if (!query || query.length < 2) return text

    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={index} className="font-semibold text-black">
          {part}
        </strong>
      ) : (
        <span key={index}>{part}</span>
      )
    )
  }

  // Format category path (e.g., "Zwierzęta > Psy" → with breadcrumb style)
  const formatCategoryPath = (text: string) => {
    if (!text.includes(' > ')) {
      return <span className="text-sm text-black font-medium">{text}</span>
    }

    const parts = text.split(' > ')
    return (
      <span className="text-sm text-black font-medium flex items-center gap-1">
        <span className="text-black/50">{parts[0]}</span>
        <svg className="w-3 h-3 text-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>{parts[1]}</span>
      </span>
    )
  }

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'category':
        return (
          <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        )
      case 'trending':
        return (
          <svg className="w-4 h-4 text-black/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      case 'popular':
        return (
          <svg className="w-4 h-4 text-black/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        )
      case 'post':
        return (
          <svg className="w-4 h-4 text-black/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-black/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )
    }
  }

  const totalResults = results.suggestions.length
  const hasResults = totalResults > 0 || recentSearches.length > 0 || results.trending.length > 0 || results.popular.length > 0 || (results.smart && results.smart.length > 0)

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col md:flex-row gap-3 bg-white rounded-3xl md:rounded-full p-4 md:p-2 border border-black/10 hover:border-black/20 transition-all">
          <div ref={dropdownRef} className="relative flex-1 flex items-center gap-3 px-2 md:px-4">
            <svg className="w-5 h-5 text-black/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              name="search"
              placeholder="Czego szukasz?"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              onKeyDown={handleKeyDown}
              className="flex-1 outline-none text-black placeholder:text-black/40 bg-transparent"
              autoComplete="off"
            />
            {isLoading && (
              <div className="w-4 h-4 border border-black/20 border-t-black/60 rounded-full animate-spin" />
            )}

            {/* Enhanced Dropdown with sections */}
            {isOpen && !isLoading && hasResults && (
              <Card className="absolute top-full left-0 right-0 mt-[1.125rem] border border-black/10 rounded-3xl bg-white shadow-lg max-h-[500px] z-50 flex flex-col overflow-hidden">
                {/* Scrollable content */}
                <div className="overflow-y-auto p-4 flex-1">
                  {/* Query correction - "Czy chodziło ci o..." */}
                  {results.queryCorrection && searchQuery && (
                  <div className="mb-4 p-4 bg-black/5 rounded-xl border border-black/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-black/60 mb-2">Czy chodziło ci o:</p>
                        <button
                          onClick={() => {
                            setSearchQuery(results.queryCorrection!.corrected)
                            handleSearchChange(results.queryCorrection!.corrected)
                          }}
                          className="text-base font-semibold text-black hover:text-brand transition-colors"
                        >
                          {results.queryCorrection.corrected}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Smart AI suggestions - show first for logged-in users */}
                {results.smart && results.smart.length > 0 && !searchQuery && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand to-brand/90 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-black uppercase tracking-wide">Dopasowane dla Ciebie</p>
                        <p className="text-xs text-black/50">Na podstawie Twojej aktywności</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {results.smart.map((item, index) => (
                        <button
                          key={`smart-${index}`}
                          onClick={() => {
                            setSearchQuery(item.text)
                            saveRecentSearch(item.text)
                            trackSearch(item.text, 'smart')
                            setIsOpen(false)
                            const params = new URLSearchParams()
                            params.set('search', item.text)
                            if (cityQuery) params.set('city', cityQuery)
                            router.push(`/posts?${params}`)
                          }}
                          data-navigate="true"
                          className="w-full text-left px-3 py-3 hover:bg-gradient-to-r hover:from-brand/5 hover:to-brand/90/5 rounded-xl transition-all flex items-center gap-3 group border border-transparent hover:border-brand/10"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand/10 to-brand/90/10 flex items-center justify-center flex-shrink-0 group-hover:from-brand/20 group-hover:to-brand/90/20 transition-all">
                            <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-black font-semibold block">{item.text}</span>
                            {item.score && (
                              <span className="text-xs text-black/40">Dopasowanie: {item.score}%</span>
                            )}
                          </div>
                          {item.score && item.score > 75 && (
                            <Badge className="rounded-full bg-gradient-to-r from-brand to-brand/90 text-white text-xs px-2.5 py-0.5 border-0 shadow-sm">
                              Top
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Separator after smart suggestions */}
                {results.smart && results.smart.length > 0 && !searchQuery && recentSearches.length > 0 && (
                  <div className="border-t border-black/5 my-4"></div>
                )}

                {/* Recent searches - show when no query */}
                {recentSearches.length > 0 && !searchQuery && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-black uppercase tracking-wide">Ostatnie wyszukiwania</p>
                        <p className="text-xs text-black/50">Twoja historia</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={`recent-${index}`}
                          onClick={() => {
                            setSearchQuery(search)
                            handleSearchChange(search)
                          }}
                          className="w-full text-left px-3 py-3 hover:bg-black/5 rounded-xl transition-all flex items-center gap-3 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center flex-shrink-0 group-hover:bg-black/10 transition-colors">
                            <svg className="w-4 h-4 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-sm text-black font-medium flex-1">{search}</span>
                          <svg className="w-4 h-4 text-black/30 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Separator before trending */}
                {results.trending.length > 0 && !searchQuery && (recentSearches.length > 0 || (results.smart && results.smart.length > 0)) && (
                  <div className="border-t border-black/5 my-4"></div>
                )}

                {/* Trending - show when no query */}
                {results.trending.length > 0 && !searchQuery && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-black uppercase tracking-wide">Trendy w tym tygodniu</p>
                        <p className="text-xs text-black/50">Najczęściej wyszukiwane</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {results.trending.map((item, index) => (
                        <button
                          key={`trending-${index}`}
                          onClick={() => {
                            setSearchQuery(item.text)
                            saveRecentSearch(item.text)
                            trackSearch(item.text, 'trending')
                            setIsOpen(false)
                            const params = new URLSearchParams()
                            params.set('search', item.text)
                            if (cityQuery) params.set('city', cityQuery)
                            router.push(`/posts?${params}`)
                          }}
                          data-navigate="true"
                          className="w-full text-left px-3 py-3 hover:bg-brand/5 rounded-xl transition-all flex items-center gap-3 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand/20 transition-colors">
                            <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-black font-semibold">{item.text}</span>
                          </div>
                          <div className="flex items-center gap-1 text-brand text-xs font-medium px-2 py-1 rounded-full bg-brand/10">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.5 2C6.71 2 2 6.71 2 12.5S6.71 23 12.5 23 23 18.29 23 12.5 18.29 2 12.5 2zm0 2c4.69 0 8.5 3.81 8.5 8.5s-3.81 8.5-8.5 8.5S4 17.19 4 12.5 7.81 4 12.5 4zM11 7v6.414l4.293 4.293 1.414-1.414L13 12.586V7h-2z"/>
                            </svg>
                            #{index + 1}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Separator before popular */}
                {results.popular.length > 0 && !searchQuery && results.trending.length > 0 && (
                  <div className="border-t border-black/5 my-4"></div>
                )}

                {/* Popular searches - show when no query */}
                {results.popular.length > 0 && !searchQuery && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-black uppercase tracking-wide">Popularne wyszukiwania</p>
                        <p className="text-xs text-black/50">W ciągu ostatniego tygodnia</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {results.popular.map((item, index) => (
                        <button
                          key={`popular-${index}`}
                          onClick={() => {
                            setSearchQuery(item.text)
                            saveRecentSearch(item.text)
                            trackSearch(item.text, 'popular')
                            setIsOpen(false)
                            const params = new URLSearchParams()
                            params.set('search', item.text)
                            if (cityQuery) params.set('city', cityQuery)
                            router.push(`/posts?${params}`)
                          }}
                          data-navigate="true"
                          className="w-full text-left px-3 py-3 hover:bg-black/5 rounded-xl transition-all flex items-center gap-3 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center flex-shrink-0 group-hover:bg-black/10 transition-colors">
                            <svg className="w-4 h-4 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                          <span className="text-sm text-black font-medium flex-1">{item.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading state - show when searching */}
                {isLoading && searchQuery && (
                  <div className="mb-4 px-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center animate-pulse">
                        <svg className="w-3.5 h-3.5 text-black/40 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <p className="text-xs text-black/50">Wyszukiwanie...</p>
                    </div>
                    {/* Loading skeleton */}
                    <div className="space-y-2 animate-pulse">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3">
                          <div className="w-8 h-8 rounded-lg bg-black/5"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-black/5 rounded w-3/4"></div>
                            <div className="h-2 bg-black/5 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No results state - show when searched but no results */}
                {!isLoading && searchQuery && results.suggestions.length === 0 && results.categories.length === 0 && (
                  <div className="mb-4 px-4 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-black/5 flex items-center justify-center">
                      <svg className="w-8 h-8 text-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-black/80 mb-2">Brak wyników</h3>
                    <p className="text-sm text-black/50 mb-4">
                      Nie znaleziono wyników dla "{searchQuery}"
                    </p>
                    <div className="text-xs text-black/40 space-y-1">
                      <p>Spróbuj:</p>
                      <ul className="list-disc list-inside">
                        <li>Użyć innych słów kluczowych</li>
                        <li>Sprawdzić pisownię</li>
                        <li>Użyć bardziej ogólnych fraz</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Search suggestions - show when typing */}
                {!isLoading && results.suggestions.length > 0 && searchQuery && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-black uppercase tracking-wide">Sugestie</p>
                        <p className="text-xs text-black/50">Dla: "{searchQuery}"</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {results.suggestions.map((suggestion, index) => (
                        <button
                          key={`suggestion-${index}`}
                          onClick={() => {
                            setSearchQuery(suggestion.text)
                            saveRecentSearch(suggestion.text)
                            trackSearch(suggestion.text, 'suggestion')
                            setIsOpen(false)
                            const params = new URLSearchParams()
                            params.set('search', suggestion.text)
                            if (cityQuery) params.set('city', cityQuery)
                            router.push(`/posts?${params}`)
                          }}
                          data-navigate="true"
                          className={`w-full text-left px-3 py-3 rounded-xl transition-all flex items-center gap-3 group ${
                            suggestion.type === 'category'
                              ? 'hover:bg-brand/5 border border-brand/10'
                              : 'hover:bg-black/5'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            suggestion.type === 'category'
                              ? 'bg-brand/10 group-hover:bg-brand/20'
                              : 'bg-black/5 group-hover:bg-black/10'
                          }`}>
                            {getSuggestionIcon(suggestion.type)}
                          </div>
                          <span className="flex-1">
                            {suggestion.type === 'category'
                              ? formatCategoryPath(suggestion.text)
                              : <span className="text-sm text-black font-medium">{highlightText(suggestion.text, searchQuery)}</span>
                            }
                          </span>
                          {suggestion.type === 'trending' && (
                            <Badge className="rounded-full bg-brand text-white text-xs px-2.5 py-0.5 border-0">
                              Trend
                            </Badge>
                          )}
                          {suggestion.type === 'category' && (
                            <Badge className="rounded-full bg-brand/10 text-brand text-xs px-2.5 py-0.5 border-0">
                              Kategoria
                            </Badge>
                          )}
                          <svg className="w-4 h-4 text-black/30 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                </div>

                {/* Sticky button at bottom - "See all results" */}
                {searchQuery && searchQuery.length >= 2 && (
                  <div className="p-4 bg-white">
                    <Link
                      href={`/posts?search=${encodeURIComponent(searchQuery)}${cityQuery ? `&city=${encodeURIComponent(cityQuery)}` : ''}`}
                      onClick={() => {
                        saveRecentSearch(searchQuery)
                        setIsOpen(false)
                      }}
                      className="flex items-center justify-center gap-2 w-full text-center py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-brand to-brand/90 hover:from-brand/90 hover:to-brand/80 rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Zobacz wszystkie wyniki dla "{searchQuery}"</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                )}
              </Card>
            )}
          </div>
          <div ref={cityDropdownRef} className="relative flex items-center gap-3 px-2 md:px-4 md:border-l border-black/10">
            <svg className="w-5 h-5 text-black/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              ref={cityInputRef}
              type="text"
              name="city"
              placeholder="Miasto"
              value={cityQuery}
              onChange={(e) => handleCityChange(e.target.value)}
              onFocus={() => {
                setIsCityDropdownOpen(true)
                if (citySuggestions.length === 0) {
                  searchCities(cityQuery)
                }
              }}
              className="flex-1 md:w-64 outline-none text-black placeholder:text-black/40 bg-transparent"
              autoComplete="off"
            />
            {isCityLoading && (
              <div className="w-4 h-4 border border-black/20 border-t-black/60 rounded-full animate-spin absolute right-2" />
            )}

            {/* City Autocomplete Dropdown */}
            {isCityDropdownOpen && (
              <div className="absolute top-full left-0 mt-[1.125rem] p-4 bg-white border border-black/10 rounded-3xl shadow-lg max-h-96 overflow-y-auto z-[60] min-w-[300px] md:min-w-[350px]">
                {/* Geolocation option */}
                <button
                  type="button"
                  onClick={getUserLocation}
                  disabled={userLocation.loading}
                  className="w-full text-left px-3 py-2 hover:bg-black/5 rounded-xl transition-colors flex items-center gap-3 mb-2"
                >
                  {userLocation.loading ? (
                    <div className="w-4 h-4 border border-black/20 border-t-black/60 rounded-full animate-spin flex-shrink-0" />
                  ) : (
                    <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-brand">
                      {userLocation.loading ? 'Pobieranie lokalizacji...' : 'Użyj mojej lokalizacji'}
                    </span>
                    {userLocation.city && !userLocation.loading && (
                      <p className="text-xs text-black/60 mt-0.5">Wykryto: {userLocation.city}</p>
                    )}
                  </div>
                </button>

                {/* City suggestions */}
                {citySuggestions.length > 0 && (
                  <>
                    <div className="border-t border-black/5 my-2"></div>
                    {citySuggestions.map((city, index) => (
                      <button
                        key={`city-${index}`}
                        type="button"
                        onClick={() => {
                          setCityQuery(city.name)
                          setIsCityDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-black/5 rounded-xl transition-colors flex items-center justify-between gap-4"
                      >
                        <span className="text-sm font-medium text-black flex-shrink-0">{city.name}</span>
                        <span className="text-xs text-black/40 truncate">{city.voivodeship}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          <button type="submit" className="w-full md:w-auto rounded-full bg-brand hover:bg-brand/90 text-white border-0 px-8 py-3 md:py-2 font-medium transition-colors">
            Szukaj
          </button>
        </div>
      </form>
    </div>
  )
}
