'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface PostsTopFiltersProps {
  searchQuery: string
  cityQuery: string
  categoryQuery: string
}

export function PostsTopFilters({
  searchQuery,
  cityQuery,
  categoryQuery,
}: PostsTopFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchQuery)
  const [city, setCity] = useState(cityQuery)

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('search', search)
      if (city) params.set('city', city)
      if (categoryQuery) params.set('category', categoryQuery)
      router.push(`/posts?` + params.toString())
    }
  }

  const handleCity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && city.trim()) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('city', city)
      if (search) params.set('search', search)
      if (categoryQuery) params.set('category', categoryQuery)
      router.push(`/posts?` + params.toString())
    }
  }

  return (
    <div className="w-full bg-card border-b border-border">
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Szukaj ogłoszenia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full px-4 py-2.5 md:py-3 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm md:text-base"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Location Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Wpisz lokalizację..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleCity}
              className="w-full px-4 py-2.5 md:py-3 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm md:text-base"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
