'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LottieIcon } from './LottieIcon'

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
  const [isSearchButtonHovered, setIsSearchButtonHovered] = useState(false)
  const [isLocationButtonHovered, setIsLocationButtonHovered] = useState(false)
  const locationOpenTimeoutRef = useRef<NodeJS.Timeout>()
  const locationCloseTimeoutRef = useRef<NodeJS.Timeout>()

  // Location state
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [cityQuery, setCityQuery] = useState('')
  const [cities, setCities] = useState<City[]>([])
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const cityDropdownRef = useRef<HTMLDivElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const cityDebounceTimerRef = useRef<NodeJS.Timeout>()
  const isUserTypingRef = useRef(false)

  // Sync with URL params (only on /posts page)
  useEffect(() => {
    const cityParam = searchParams.get('city')
    const searchParam = searchParams.get('search')

    // Only show city on /posts page from URL params
    if (pathname === '/posts') {
      if (cityParam && cityParam !== selectedCity) {
        setSelectedCity(cityParam)
      } else if (!cityParam && selectedCity) {
        setSelectedCity('')
      }
    } else {
      // Clear city when not on /posts page
      if (selectedCity) {
        setSelectedCity('')
      }
    }

    // Sync search query from URL if different - but only when user is not actively typing
    if (searchParam && searchParam !== searchQuery && !isUserTypingRef.current) {
      setSearchQuery(searchParam)
    } else if (!searchParam && searchQuery && !isUserTypingRef.current) {
      // Clear search query if URL param is removed and user is not typing
      setSearchQuery('')
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
    isUserTypingRef.current = true
    setSearchQuery(value)

    // Only open if there's content
    if (value.trim().length > 0) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }

    setSelectedIndex(-1) // Reset selection on new input

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Start search immediately without showing loading for fast typing
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value)
      // User finished typing after debounce
      isUserTypingRef.current = false
    }, 150) // 150ms debounce - smooth typing
  }

  // Clear search query
  const clearSearch = (e?: React.MouseEvent) => {
    e?.stopPropagation() // Prevent triggering the container's onClick
    isUserTypingRef.current = false
    setSearchQuery('')
    setIsOpen(false)
    setResults({ suggestions: [], trending: [] })

    // Update URL if on /posts page
    if (pathname === '/posts') {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('search')
      const queryString = params.toString()
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
    }

    // Don't focus input after clearing - this prevents reopening dropdown
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

    // Always navigate to /posts with selected city
    const params = new URLSearchParams()

    // Preserve search query if exists
    if (searchQuery) {
      params.set('search', searchQuery)
    }

    params.set('city', cityName)
    router.push(`/posts?${params.toString()}`)
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

    // If on /posts page, remove city from URL
    if (pathname === '/posts') {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('city')
      const queryString = params.toString()
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
    }
  }

  // Detect user location
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      alert('Twoja przeglądarka nie obsługuje wykrywania lokalizacji')
      return
    }

    setIsDetectingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          // Use Nominatim API for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pl`
          )
          const data = await response.json()

          // Extract city name
          const city = data.address?.city ||
                      data.address?.town ||
                      data.address?.village ||
                      data.address?.municipality ||
                      null

          if (city) {
            handleCitySelect(city)
          } else {
            alert('Nie udało się określić miasta na podstawie Twojej lokalizacji')
          }
        } catch (error) {
          console.error('Błąd podczas wykrywania lokalizacji:', error)
          alert('Wystąpił błąd podczas wykrywania lokalizacji')
        } finally {
          setIsDetectingLocation(false)
        }
      },
      (error) => {
        console.error('Błąd geolokalizacji:', error)
        setIsDetectingLocation(false)

        if (error.code === error.PERMISSION_DENIED) {
          alert('Odmówiono dostępu do lokalizacji. Sprawdź ustawienia przeglądarki.')
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert('Lokalizacja jest niedostępna')
        } else if (error.code === error.TIMEOUT) {
          alert('Przekroczono limit czasu wykrywania lokalizacji')
        } else {
          alert('Wystąpił błąd podczas wykrywania lokalizacji')
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // Cache position for 5 minutes
      }
    )
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
      return [...recentSearches, ...(results.trending || []).map(item => item.text)]
    }
    return (results.suggestions || []).map(item => item.text)
  }

  // Load initial trending when focusing empty input
  const handleSearchFocus = () => {
    // Always open dropdown on focus
    setIsOpen(true)

    if (!searchQuery) {
      // Always show cached trending immediately if available
      if (cachedTrending.length > 0 && (results.trending?.length || 0) === 0) {
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
    isUserTypingRef.current = false
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
    isUserTypingRef.current = false
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
      if (locationOpenTimeoutRef.current) {
        clearTimeout(locationOpenTimeoutRef.current)
      }
      if (locationCloseTimeoutRef.current) {
        clearTimeout(locationCloseTimeoutRef.current)
      }
    }
  }, [])

  // Handle location button hover
  const handleLocationButtonMouseEnter = () => {
    setIsLocationButtonHovered(true)

    // Clear any pending close timeout
    if (locationCloseTimeoutRef.current) {
      clearTimeout(locationCloseTimeoutRef.current)
      locationCloseTimeoutRef.current = undefined
    }

    // Open menu on hover with slight delay
    if (!isCityDropdownOpen) {
      locationOpenTimeoutRef.current = setTimeout(() => {
        setIsCityDropdownOpen(true)
        handleCityFocus()
        setIsOpen(false) // Close autocomplete
      }, 150) // Small delay to prevent accidental opens
    }
  }

  const handleLocationButtonMouseLeave = () => {
    setIsLocationButtonHovered(false)

    // Cancel opening if hovering stopped before timeout completed
    if (locationOpenTimeoutRef.current) {
      clearTimeout(locationOpenTimeoutRef.current)
      locationOpenTimeoutRef.current = undefined
    }

    // Start close timer if menu is open
    if (isCityDropdownOpen) {
      locationCloseTimeoutRef.current = setTimeout(() => {
        setIsCityDropdownOpen(false)
      }, 300) // Delay to allow moving to menu
    }
  }

  const handleLocationMenuMouseEnter = () => {
    // Cancel closing if mouse enters the menu
    if (locationCloseTimeoutRef.current) {
      clearTimeout(locationCloseTimeoutRef.current)
      locationCloseTimeoutRef.current = undefined
    }
  }

  const handleLocationMenuMouseLeave = () => {
    // Set a delay before closing
    if (locationCloseTimeoutRef.current) {
      clearTimeout(locationCloseTimeoutRef.current)
    }
    locationCloseTimeoutRef.current = setTimeout(() => {
      setIsCityDropdownOpen(false)
      setIsLocationButtonHovered(false)
    }, 300) // Delay to allow returning to button
  }

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

  // Format suggestion - simple, clean, like Google
  const formatSuggestion = (text: string, type: string) => {
    // Check if it's category format: "query w kategorii Category"
    if (text.includes(' w kategorii ')) {
      const [query, categoryPart] = text.split(' w kategorii ')

      // Check if category has path (Parent > Child)
      if (categoryPart.includes(' > ')) {
        const [parent, child] = categoryPart.split(' > ')
        return (
          <span className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm text-black font-medium">{query}</span>
            <span className="text-xs text-black/40">w kategorii</span>
            <span className="text-xs text-black/50">{parent}</span>
            <svg className="w-2.5 h-2.5 text-black/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm text-black/70">{child}</span>
          </span>
        )
      }

      // Simple category (no parent)
      return (
        <span className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm text-black font-medium">{query}</span>
          <span className="text-xs text-black/40">w kategorii</span>
          <span className="text-sm text-black/70">{categoryPart}</span>
        </span>
      )
    }

    // Regular suggestion (no category context)
    return <span className="text-sm text-black font-normal truncate">{text}</span>
  }

  // Get icon for suggestion type - simple, uniform
  const getSuggestionIcon = (type: string) => {
    // All suggestions get the same search icon
    return (
      <svg className="w-4 h-4 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  }

  // Show dropdown when:
  // - Has suggestions/trending/recent searches
  // - User is typing
  const hasResults =
    (results.suggestions?.length || 0) > 0 ||
    (results.trending?.length || 0) > 0 ||
    (recentSearches.length || 0) > 0 ||
    results.queryCorrection ||
    (searchQuery && searchQuery.trim().length > 0) // Only show if typing

  return (
    <div ref={dropdownRef} className="relative hidden md:flex w-full max-w-3xl gap-2 items-center">
      <form onSubmit={handleSubmit} className="flex-1" suppressHydrationWarning>
        <div
          onClick={() => searchInputRef.current?.focus()}
          className="relative flex items-center bg-[#FAF8F3] rounded-full pr-2 py-2 h-10 transition-colors cursor-text"
          style={{ paddingLeft: '20px' }}
        >
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
          {searchQuery && (
            <button
              type="button"
              onClick={(e) => clearSearch(e)}
              {...(pathname === '/posts' && { 'data-navigate': 'true' })}
              className="p-1 hover:bg-black/5 rounded-full transition-colors flex-shrink-0 -ml-3 mr-3"
              aria-label="Wyczyść wyszukiwanie"
            >
              <svg className="w-4 h-4 text-black/40 hover:text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            onMouseEnter={() => setIsSearchButtonHovered(true)}
            onMouseLeave={() => setIsSearchButtonHovered(false)}
            className="h-8 w-8 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 transition-colors flex-shrink-0 flex items-center justify-center"
            aria-label="Szukaj"
          >
            <LottieIcon
              animationPath="/animations/search.json"
              fallbackSvg={<img src="/icons/search.svg" alt="Search" className="w-full h-full" />}
              className="w-4 h-4"
              isHovered={isSearchButtonHovered}
            />
          </button>
        </div>
      </form>

      {/* Dropdown with animation - now spans full container width including location button */}
      {isOpen && hasResults && (
        <Card
          className="absolute top-full left-0 mt-2 border border-black/10 rounded-2xl bg-white shadow-lg max-h-[450px] z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ width: '100%', right: 0 }}
        >
          <div className="overflow-y-auto p-3">
              {/* Results - always show (no loading state) */}
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
                          data-navigate="true"
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
                      isUserTypingRef.current = false
                      setSearchQuery(results.queryCorrection!.corrected)
                      setIsOpen(false)
                      router.push(`/posts?search=${encodeURIComponent(results.queryCorrection!.corrected)}`)
                    }}
                    data-navigate="true"
                    className="text-sm font-semibold text-[#C44E35] hover:text-[#B33D2A] hover:underline transition-colors"
                  >
                    {results.queryCorrection.corrected}
                  </button>
                </div>
              )}

              {/* Empty state - show when no recent, no trending, no query */}
              {!searchQuery && recentSearches.length === 0 && (results.trending?.length || 0) === 0 && (
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
              {(results.trending?.length || 0) > 0 && !searchQuery && (
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
                        data-navigate="true"
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
              {searchQuery && (results.suggestions?.length || 0) === 0 && (
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
              {(results.suggestions?.length || 0) > 0 && searchQuery && (
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
                        data-navigate="true"
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 group ${
                          isSelected ? 'bg-black/10' : 'hover:bg-black/5'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center flex-shrink-0 group-hover:bg-black/10 transition-colors">
                          {getSuggestionIcon(suggestion.type)}
                        </div>
                        <span className="flex-1 min-w-0">
                          {formatSuggestion(suggestion.text, suggestion.type)}
                        </span>
                        {suggestion.type === 'trending' && (
                          <Badge className="rounded-full bg-[#C44E35] text-white text-xs px-2.5 py-0.5 border-0 flex-shrink-0">
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
            </div>

          {/* See all results button */}
          {searchQuery && searchQuery.length >= 2 && (
            <div className="p-3 bg-white border-t border-black/5">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full text-center py-2.5 text-sm font-semibold text-[#C44E35] hover:bg-[#C44E35]/5 rounded-lg transition-all"
              >
                Zobacz wszystkie wyniki
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Location Selector */}
      <div ref={cityDropdownRef} className="relative">
        <button
          type="button"
          onMouseEnter={handleLocationButtonMouseEnter}
          onMouseLeave={handleLocationButtonMouseLeave}
          className="flex items-center gap-2 bg-[#FAF8F3] hover:bg-[#F5F1E8] rounded-full h-10 transition-colors flex-shrink-0 px-4"
          aria-label={selectedCity ? `Wybrana lokalizacja: ${selectedCity}` : 'Wybierz lokalizację'}
          aria-expanded={isCityDropdownOpen}
        >
          <LottieIcon
            animationPath="/animations/location.json"
            fallbackSvg={<img src="/icons/location.svg" alt="Location" className="w-full h-full" />}
            className="w-4 h-4 text-[#C44E35] flex-shrink-0"
            isHovered={isLocationButtonHovered}
          />
          <style>{`
            .location-label-text {
              display: none;
            }
            @media (min-width: 1280px) {
              .location-label-text {
                display: inline !important;
              }
            }
          `}</style>
          <span className="location-label-text text-sm text-black font-medium truncate max-w-[140px]">
            {selectedCity || 'Lokalizacja'}
          </span>
          {selectedCity && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                clearCity()
              }}
              className="ml-auto hover:bg-black/10 rounded-full p-0.5 transition-colors flex-shrink-0 cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  clearCity()
                }
              }}
              aria-label="Usuń lokalizację"
            >
              <svg className="w-3 h-3 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          )}
        </button>

        {/* City Dropdown */}
        {isCityDropdownOpen && (
          <Card
            onMouseEnter={handleLocationMenuMouseEnter}
            onMouseLeave={handleLocationMenuMouseLeave}
            className="absolute top-full right-0 mt-2 w-80 border border-black/10 rounded-2xl bg-white shadow-lg max-h-[400px] z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
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
              {/* Detect Location Button */}
              <button
                type="button"
                onClick={detectLocation}
                disabled={isDetectingLocation}
                data-navigate="true"
                className="w-full mb-2 px-3 py-3 rounded-lg bg-[#C44E35]/10 hover:bg-[#C44E35]/20 transition-all flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-8 h-8 rounded-lg bg-[#C44E35]/20 flex items-center justify-center flex-shrink-0">
                  {isDetectingLocation ? (
                    <div className="w-4 h-4 border-2 border-[#C44E35]/30 border-t-[#C44E35] rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-semibold text-[#C44E35] flex-1 text-left">
                  {isDetectingLocation ? 'Wykrywanie...' : 'Wykryj moją lokalizację'}
                </span>
              </button>

              {cities.length > 0 ? (
                <div className="space-y-1">
                  {cities.map((city, index) => (
                    <button
                      key={`${city.slug}-${index}`}
                      type="button"
                      onClick={() => handleCitySelect(city.name)}
                      data-navigate="true"
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
