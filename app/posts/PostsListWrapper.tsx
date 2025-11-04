'use client'

import { useState, useEffect } from 'react'
import { PostsFilters } from '@/components/PostsFilters'
import { PostsList } from './PostsList'

interface Post {
  id: string
  user_id: string
  title: string
  description: string
  city: string
  district: string | null
  price: number | null
  price_type: 'hourly' | 'fixed' | 'free' | null
  price_negotiable: boolean | null
  images: string[] | null
  profiles: {
    full_name: string | null
    avatar_url: string | null
    rating: number
    total_reviews: number
  } | null
  categories: {
    name: string
  } | null
}

interface PostsListWrapperProps {
  initialPosts: Post[]
  totalCount: number
  userFavorites: string[]
  currentSort: string
  searchParams: {
    search?: string
    city?: string
    category?: string
    sort?: string
    limit?: string
  }
}

export function PostsListWrapper({
  initialPosts,
  totalCount,
  userFavorites,
  currentSort,
  searchParams
}: PostsListWrapperProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved view mode from localStorage on mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('posts-view-mode')
    if (savedViewMode === 'grid' || savedViewMode === 'list') {
      setViewMode(savedViewMode)
    }
    setIsLoaded(true)
  }, [])

  // Save view mode to localStorage when it changes
  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    localStorage.setItem('posts-view-mode', mode)
  }

  // Don't render until we've loaded the saved preference
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-muted-foreground">Ładowanie ogłoszeń...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Filters with view toggle */}
      <PostsFilters
        currentSort={currentSort}
        currentView={viewMode}
        onViewChange={handleViewChange}
      />

      {/* Posts List/Grid */}
      <PostsList
        initialPosts={initialPosts}
        totalCount={totalCount}
        userFavorites={userFavorites}
        searchParams={searchParams}
        viewMode={viewMode}
      />
    </>
  )
}
