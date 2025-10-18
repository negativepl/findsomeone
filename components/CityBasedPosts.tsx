'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FavoriteButtonWrapper } from '@/components/FavoriteButtonWrapper'
import { ScrollArrows } from '@/components/ScrollArrows'
import { PostCard } from '@/components/PostCard'
import { createClient } from '@/lib/supabase/client'

interface Post {
  id: string
  title: string
  type: 'seeking' | 'offering'
  city: string
  district?: string
  price_min?: number
  price_max?: number
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

    async function detectCityAndFetchPosts() {
      try {
        // Get user's location from geolocation API
        if (!navigator.geolocation) {
          await detectCityByIP()
          return
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords

            // Reverse geocode to get city name using Nominatim (free OpenStreetMap service)
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pl`,
                {
                  headers: {
                    'User-Agent': 'FindSomeone/1.0'
                  }
                }
              )
              const data = await response.json()

              // Extract city from address
              const detectedCity = data.address?.city || data.address?.town || data.address?.village || null

              if (detectedCity) {
                setCity(detectedCity)
                await fetchPostsByCity(detectedCity)
                setLoading(false)
              } else {
                // Fallback to IP-based detection
                await detectCityByIP()
              }
            } catch (error) {
              await detectCityByIP()
            }
          },
          async (error) => {
            // Geolocation failed, fallback to IP-based detection
            await detectCityByIP()
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000 // Cache for 5 minutes
          }
        )
      } catch (error) {
        // Silently fail - city detection is optional feature
        setLoading(false)
      }
    }

    detectCityAndFetchPosts()
  }, [])

  if (loading || !city || posts.length === 0) {
    return null
  }

  return (
    <section className="container mx-auto px-6 py-12 md:py-14">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm group/section">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-black mb-2">
              W Twoim mieście
            </h3>
            <p className="text-lg text-black/60">
              Ogłoszenia z miasta {city}
            </p>
          </div>
          <div className="hidden md:block">
            <Link href={`/posts?city=${encodeURIComponent(city)}`}>
              <button className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white px-6 py-2.5 text-sm font-medium transition-colors">
                Zobacz wszystkie
              </button>
            </Link>
          </div>
        </div>

        {/* Horizontal Scroll for all devices */}
        <div className="relative">
          <div className="hidden md:block">
            <ScrollArrows containerId="city-posts-scroll" />
          </div>
          <div id="city-posts-scroll" className="overflow-x-auto scrollbar-hide -mx-6 md:-mx-8 snap-x snap-mandatory">
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
        </div>
      </div>
    </section>
  )
}
