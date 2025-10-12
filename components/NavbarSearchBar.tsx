'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'
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
  queryCorrection?: {
    original: string
    corrected: string
    confidence: number
  } | null
}

interface City {
  name: string
  slug: string
  voivodeship?: string
  popular?: boolean
}

export function NavbarSearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResult>({ suggestions: [], trending: [] })
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const debounceTimerRef = useRef<NodeJS.Timeout>()
  const [cachedTrending, setCachedTrending] = useState<SearchResult['trending']>([])
  const hasFetchedTrendingRef = useRef(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Location state
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [cityQuery, setCityQuery] = useState('')
  const [cities, setCities] = useState<City[]>([])
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const cityDropdownRef = useRef<HTMLDivElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const cityDebounceTimerRef = useRef<NodeJS.Timeout>()

  // Sync with URL params (when on /posts page)
  useEffect(() => {
    const cityParam = searchParams.get('city')
    const searchParam = searchParams.get('search')

    // Sync city from URL - both directions (set and clear)
    if (cityParam && cityParam !== selectedCity) {
      setSelectedCity(cityParam)
    } else if (!cityParam && selectedCity && pathname === '/posts') {
      // Clear city if it's not in URL and we're on /posts page
      setSelectedCity('')
    }

    // Sync search query from URL if different
    if (searchParam && searchParam !== searchQuery) {
      setSearchQuery(searchParam)
    }
  }, [searchParams, pathname, selectedCity, searchQuery])

  // Load cached trending and recent searches from localStorage on mount
  useEffect(() => {
    // Load trending cache
    const cached = localStorage.getItem('trending_cache')
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached)
        // Cache valid for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setCachedTrending(data)
        }
      } catch (e) {
        // Invalid cache, ignore
      }
    }

    // Load recent searches
    const recent = localStorage.getItem('recent_searches')
    if (recent) {
      try {
        const searches = JSON.parse(recent)
        setRecentSearches(searches)
      } catch (e) {
        // Invalid data, ignore
      }
    }

    // Load saved location
    const savedCity = localStorage.getItem('selected_city')
    if (savedCity) {
      setSelectedCity(savedCity)
    }
  }, [])

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data)

      // Cache trending searches
      if (!query && data.trending?.length > 0) {
        setCachedTrending(data.trending)
        localStorage.setItem('trending_cache', JSON.stringify({
          data: data.trending,
          timestamp: Date.now()
        }))
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults({ suggestions: [], trending: [] })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch cities from API
  const fetchCities = useCallback(async (query: string) => {
    try {
      setIsLoadingCities(true)
      const response = await fetch(`/api/cities?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setCities(data.cities || [])
    } catch (error) {
      console.error('Cities fetch error:', error)
      setCities([])
    } finally {
      setIsLoadingCities(false)
    }
  }, [])

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setIsOpen(true)
    setSelectedIndex(-1) // Reset selection on new input

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    setIsLoading(true)
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value)
    }, 200) // Reduced from 300ms to 200ms
  }

  // Handle city input change
  const handleCityChange = (value: string) => {
    setCityQuery(value)

    if (cityDebounceTimerRef.current) {
      clearTimeout(cityDebounceTimerRef.current)
    }

    cityDebounceTimerRef.current = setTimeout(() => {
      fetchCities(value)
    }, 200)
  }

  // Handle city selection
  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName)
    setCityQuery('')
    setIsCityDropdownOpen(false)
    localStorage.setItem('selected_city', cityName)

    // If on /posts page, automatically update URL to refresh results
    if (pathname === '/posts') {
      const params = new URLSearchParams(searchParams.toString())
      params.set('city', cityName)
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  // Handle city focus - load popular cities
  const handleCityFocus = () => {
    setIsCityDropdownOpen(true)
    if (cities.length === 0) {
      fetchCities('')
    }
  }

  // Clear selected city
  const clearCity = () => {
    setSelectedCity('')
    setIsCityDropdownOpen(false)
    localStorage.removeItem('selected_city')

    // If on /posts page, automatically update URL to refresh results
    if (pathname === '/posts') {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('city')
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  // Save search to recent searches
  const saveRecentSearch = useCallback((query: string) => {
    if (!query || query.trim().length < 2) return

    const trimmedQuery = query.trim()

    // Remove duplicates and add to front, keep max 10
    const updated = [
      trimmedQuery,
      ...recentSearches.filter(s => s.toLowerCase() !== trimmedQuery.toLowerCase())
    ].slice(0, 10)

    setRecentSearches(updated)
    localStorage.setItem('recent_searches', JSON.stringify(updated))
  }, [recentSearches])

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    localStorage.removeItem('recent_searches')
  }, [])

  // Get all available suggestions for keyboard navigation
  const getAllSuggestions = () => {
    if (!searchQuery) {
      // Include recent searches + trending for keyboard nav
      return [...recentSearches, ...results.trending.map(item => item.text)]
    }
    return results.suggestions.map(item => item.text)
  }

  // Load initial trending when focusing empty input
  const handleSearchFocus = () => {
    setIsOpen(true)
    if (!searchQuery) {
      // Always show cached trending immediately if available
      if (cachedTrending.length > 0 && results.trending.length === 0) {
        setResults({ ...results, trending: cachedTrending })
      }

      // Fetch fresh data in background (only once per session)
      if (!hasFetchedTrendingRef.current) {
        hasFetchedTrendingRef.current = true
        // Don't set loading state for background fetch
        performSearch('')
      }
    }
  }

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpen(false)

    const params = new URLSearchParams()
    if (searchQuery) {
      params.set('search', searchQuery)
      saveRecentSearch(searchQuery)
    }
    if (selectedCity) {
      params.set('city', selectedCity)
    }

    router.push(`/posts${params.toString() ? `?${params.toString()}` : ''}`)
  }

  // Handle suggestion click (used in multiple places)
  const handleSuggestionClick = (text: string) => {
    setSearchQuery(text)
    setIsOpen(false)
    saveRecentSearch(text)

    const params = new URLSearchParams()
    params.set('search', text)
    if (selectedCity) {
      params.set('city', selectedCity)
    }

    router.push(`/posts?${params.toString()}`)
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false)
        setCityQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (cityDebounceTimerRef.current) {
        clearTimeout(cityDebounceTimerRef.current)
      }
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      const suggestions = getAllSuggestions()

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          )
          break

        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
          break

        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            e.preventDefault()
            const selectedText = suggestions[selectedIndex]
            handleSuggestionClick(selectedText)
          }
          break

        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          setSelectedIndex(-1)
          searchInputRef.current?.blur()
          break
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, selectedIndex, router, results])

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

  // Show dropdown when:
  // - Has suggestions/trending/recent searches
  // - User is typing (to show loading or "no results")
  // - Just focused input (to show empty state if nothing available)
  const hasResults =
    results.suggestions.length > 0 ||
    results.trending.length > 0 ||
    results.queryCorrection ||
    cachedTrending.length > 0 ||
    recentSearches.length > 0 ||
    (searchQuery && !isLoading) ||
    (!searchQuery && isOpen) // Always show on focus, even if empty

  return (
    <div className="relative hidden md:flex flex-1 max-w-2xl gap-2 items-center">
      <div ref={dropdownRef} className="relative flex-1">
        <form onSubmit={handleSubmit} suppressHydrationWarning>
          <div className="relative flex items-center bg-[#FAF8F3] rounded-full px-5 h-10 transition-colors">
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
              suppressHydrationWarning
            />
            {isLoading && (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin ml-2" />
            )}
          </div>

        {/* Dropdown */}
        {isOpen && (hasResults || isLoading) && (
          <Card className="absolute top-full left-0 right-0 mt-2 border border-black/10 rounded-2xl bg-white shadow-lg max-h-[450px] z-50 flex flex-col overflow-hidden">
            <div className="overflow-y-auto p-3">
              {/* Loading state */}
              {isLoading && searchQuery && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                    <p className="text-sm text-black/60">Szukam...</p>
                  </div>
                </div>
              )}

              {/* Results - show only when not loading */}
              {!isLoading && (
                <>
              {/* Recent searches - show when no query */}
              {recentSearches.length > 0 && !searchQuery && (
                <div className="mb-3">
                  <div className="px-3 py-2 flex items-center justify-between">
                    <p className="text-xs font-bold text-black/60 uppercase tracking-wide">Ostatnie wyszukiwania</p>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-xs text-[#C44E35] hover:text-[#B33D2A] font-medium transition-colors"
                    >
                      Wyczyść
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.slice(0, 5).map((search, index) => {
                      const isSelected = selectedIndex === index
                      return (
                        <button
                          key={`recent-${index}`}
                          type="button"
                          onClick={() => handleSuggestionClick(search)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 group ${
                            isSelected ? 'bg-black/10' : 'hover:bg-black/5'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center flex-shrink-0 group-hover:bg-black/10 transition-colors">
                            <svg className="w-4 h-4 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-sm text-black font-medium flex-1 truncate">{search}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Query correction - "Did you mean?" */}
              {results.queryCorrection && searchQuery && (
                <div className="mb-3 px-3 py-2.5 bg-[#FAF8F3] rounded-lg border border-black/10">
                  <p className="text-xs text-black/60 mb-1.5">Czy chodziło Ci o:</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(results.queryCorrection!.corrected)
                      setIsOpen(false)
                      router.push(`/posts?search=${encodeURIComponent(results.queryCorrection!.corrected)}`)
                    }}
                    className="text-sm font-semibold text-[#C44E35] hover:text-[#B33D2A] hover:underline transition-colors"
                  >
                    {results.queryCorrection.corrected}
                  </button>
                </div>
              )}

              {/* Empty state - show when no recent, no trending, no query */}
              {!searchQuery && recentSearches.length === 0 && results.trending.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-black mb-1">Zacznij wpisywać</p>
                  <p className="text-sm text-black/60 text-center">
                    Wpisz czego szukasz, aby zobaczyć sugestie
                  </p>
                </div>
              )}

              {/* Trending - show when no query */}
              {results.trending.length > 0 && !searchQuery && (
                <div className="mb-2">
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-black/60 uppercase tracking-wide">Trendy</p>
                  </div>
                  <div className="space-y-1">
                    {results.trending.slice(0, 5).map((item, index) => {
                      // Offset by recent searches length for keyboard nav
                      const isSelected = selectedIndex === (index + recentSearches.length)
                      return (
                      <button
                        key={`trending-${index}`}
                        type="button"
                        onClick={() => handleSuggestionClick(item.text)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 group ${
                          isSelected ? 'bg-[#C44E35]/10' : 'hover:bg-[#C44E35]/5'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C44E35]/20 transition-colors">
                          {getSuggestionIcon('trending')}
                        </div>
                        <span className="text-sm text-black font-medium flex-1 truncate">{item.text}</span>
                        <Badge className="rounded-full bg-[#C44E35] text-white text-xs px-2.5 py-0.5 border-0">
                          #{index + 1}
                        </Badge>
                      </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* No results message */}
              {searchQuery && results.suggestions.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-black mb-1">Brak wyników</p>
                  <p className="text-sm text-black/60 text-center">
                    Nie znaleziono sugestii dla <span className="font-medium">"{searchQuery}"</span>
                  </p>
                  <p className="text-xs text-black/50 mt-2 text-center">
                    Spróbuj innych słów kluczowych lub wciśnij Enter, aby szukać w ogłoszeniach
                  </p>
                </div>
              )}

              {/* Search suggestions - show when typing */}
              {results.suggestions.length > 0 && searchQuery && (
                <div>
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-black/60 uppercase tracking-wide">Sugestie</p>
                  </div>
                  <div className="space-y-1">
                    {results.suggestions.slice(0, 6).map((suggestion, index) => {
                      const isSelected = selectedIndex === index
                      return (
                      <button
                        key={`suggestion-${index}`}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 group ${
                          isSelected ? 'bg-[#C44E35]/10' : 'hover:bg-black/5'
                        }`}
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
                      )
                    })}
                  </div>
                </div>
              )}
              </>
              )}
            </div>

            {/* See all results button */}
            {searchQuery && searchQuery.length >= 2 && !isLoading && (
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

      {/* Location Selector */}
      <div ref={cityDropdownRef} className="relative">
        <div className="flex items-center gap-1 bg-[#FAF8F3] hover:bg-[#F5F1E8] rounded-full px-4 h-10 transition-colors">
          <button
            type="button"
            onClick={() => {
              setIsCityDropdownOpen(!isCityDropdownOpen)
              if (!isCityDropdownOpen) handleCityFocus()
            }}
            className="flex items-center gap-2 flex-1 whitespace-nowrap"
          >
            <MapPin className="w-4 h-4 text-[#C44E35] flex-shrink-0" />
            <span className="text-sm text-black font-medium truncate max-w-[120px]">
              {selectedCity || 'Lokalizacja'}
            </span>
          </button>
          {selectedCity && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                clearCity()
              }}
              className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors flex-shrink-0"
              aria-label="Usuń lokalizację"
            >
              <svg className="w-3 h-3 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* City Dropdown */}
        {isCityDropdownOpen && (
          <Card className="absolute top-full right-0 mt-2 w-80 border border-black/10 rounded-2xl bg-white shadow-lg max-h-[400px] z-50 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-black/5">
              <div className="relative flex items-center bg-[#FAF8F3] rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-black/40 mr-2 flex-shrink-0" />
                <input
                  ref={cityInputRef}
                  type="text"
                  placeholder="Wpisz miasto..."
                  value={cityQuery}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="flex-1 outline-none text-sm text-black placeholder:text-black/40 bg-transparent"
                  autoComplete="off"
                />
                {isLoadingCities && (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin ml-2" />
                )}
              </div>
            </div>

            <div className="overflow-y-auto p-2">
              {cities.length > 0 ? (
                <div className="space-y-1">
                  {cities.map((city, index) => (
                    <button
                      key={`${city.slug}-${index}`}
                      type="button"
                      onClick={() => handleCitySelect(city.name)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between group ${
                        selectedCity === city.name
                          ? 'bg-[#C44E35]/10 text-[#C44E35]'
                          : 'hover:bg-black/5 text-black'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 flex-shrink-0 ${
                          selectedCity === city.name ? 'text-[#C44E35]' : 'text-black/40'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{city.name}</p>
                          {city.voivodeship && (
                            <p className="text-xs text-black/50">{city.voivodeship}</p>
                          )}
                        </div>
                      </div>
                      {city.popular && (
                        <Badge className="rounded-full bg-black/10 text-black text-xs px-2 py-0.5 border-0">
                          Popularne
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-3">
                    <MapPin className="w-6 h-6 text-black/40" />
                  </div>
                  <p className="text-sm font-medium text-black mb-1">
                    {isLoadingCities ? 'Ładowanie...' : 'Brak miast'}
                  </p>
                  <p className="text-xs text-black/50 text-center">
                    {cityQuery ? 'Spróbuj innej nazwy' : 'Zacznij wpisywać, aby zobaczyć miasta'}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
