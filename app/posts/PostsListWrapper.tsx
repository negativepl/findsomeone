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
  price_type: 'hourly' | 'fixed' | 'negotiable' | null
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
    return null
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
