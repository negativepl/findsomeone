'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FavoriteButtonWrapper } from '@/components/FavoriteButtonWrapper'
import { ScrollArrows } from '@/components/ScrollArrows'
import { ScrollGradients } from '@/components/ScrollGradients'
import { ScrollIndicator } from '@/components/ScrollIndicator'
import { PostCard } from '@/components/PostCard'
import { createClient } from '@/lib/supabase/client'

interface Post {
  id: string
  title: string
  city: string
  district?: string
  price?: number
  price_type?: string
  images?: string[]
  profiles?: {
    full_name?: string
    avatar_url?: string
  }
  categories?: {
    name: string
  }
}

interface CityBasedPostsProps {
  userFavorites: string[]
}

export function CityBasedPosts({ userFavorites }: CityBasedPostsProps) {
  const [city, setCity] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPostsByCity(detectedCity: string) {
      const supabase = createClient()
      const { data: cityPosts } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          ),
          categories (
            name
          )
        `)
        .eq('status', 'active')
        .ilike('city', `%${detectedCity}%`)
        .order('created_at', { ascending: false })
        .limit(8)

      setPosts(cityPosts || [])
    }

    async function detectCityByIP() {
      try {
        // Fallback: Use IP-based geolocation (ipapi.co - free tier)
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()

        const detectedCity = data.city || null

        if (detectedCity) {
          setCity(detectedCity)
          await fetchPostsByCity(detectedCity)
        }
      } catch (error) {
        // IP geolocation failed - silently continue
      } finally {
        setLoading(false)
      }
    }

    // Use IP-based detection only (no permission prompt)
    // GPS-based geolocation should only be triggered by user action
    detectCityByIP()
  }, [])

  if (loading || !city || posts.length === 0) {
    return null
  }

  return (
    <section className="container mx-auto px-6 py-6 md:py-14">
      {/* Mobile: flat design */}
      <div className="md:hidden">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">W Twoim mieście</h3>
          <p className="text-sm text-muted-foreground">Ogłoszenia z miasta {city}</p>
        </div>

        <div className="relative -mx-6">
          <ScrollGradients containerId="city-posts-scroll-mobile" />

          <div id="city-posts-scroll-mobile" className="overflow-x-auto overflow-y-visible scrollbar-hide snap-x snap-mandatory w-full">
            <div className="horizontal-scroll-padding-mobile flex gap-4 pb-2">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isFavorite={userFavorites.includes(post.id)}
                />
              ))}
            </div>
          </div>
          <ScrollIndicator containerId="city-posts-scroll-mobile" />
        </div>
      </div>

      {/* Desktop: card design */}
      <div className="hidden md:block bg-card rounded-3xl p-8 shadow-sm group/section overflow-visible">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-4xl font-bold text-foreground mb-2">W Twoim mieście</h3>
            <p className="text-lg text-muted-foreground">Ogłoszenia z miasta {city}</p>
          </div>
          <Link href={`/posts?city=${encodeURIComponent(city)}`} className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white px-6 py-2.5 text-sm font-medium transition-colors inline-block">
            Zobacz wszystkie
          </Link>
        </div>

        <div className="relative -mx-8">
          <ScrollArrows containerId="city-posts-scroll-desktop" />
          <ScrollGradients containerId="city-posts-scroll-desktop" />

          <div id="city-posts-scroll-desktop" className="overflow-x-auto overflow-y-visible scrollbar-hide snap-x snap-mandatory w-full">
            <div className="horizontal-scroll-padding-mobile flex gap-4 pb-2">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isFavorite={userFavorites.includes(post.id)}
                />
              ))}
            </div>
          </div>
          <ScrollIndicator containerId="city-posts-scroll-desktop" />
        </div>
      </div>
    </section>
  )
}
