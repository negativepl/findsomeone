'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface Post {
  id: string
  title: string
  type: string
  city: string
  district: string | null
  categories: {
    name: string
  } | null
}

interface UserPostsListProps {
  userId: string
  initialPosts: Post[]
  totalCount: number
}

const POSTS_PER_PAGE = 6

export function UserPostsList({ userId, initialPosts, totalCount }: UserPostsListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loading, setLoading] = useState(false)

  const remainingCount = totalCount - posts.length

  const loadMore = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/users/${userId}/posts?offset=${posts.length}&limit=${POSTS_PER_PAGE}`
      )
      const data = await response.json()

      if (data.posts && data.posts.length > 0) {
        setPosts((prev) => [...prev, ...data.posts])
      }
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Aktywne ogłoszenia ({totalCount})
      </h2>

      {posts.length > 0 ? (
        <>
          <div className="flex flex-col gap-4 mb-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block bg-card border border-border rounded-3xl shadow-sm p-5 hover:bg-muted transition-all"
              >
                {post.categories && (
                  <div className="mb-3">
                    <Badge variant="outline" className="rounded-full border-border text-muted-foreground px-3 py-1.5">
                      {post.categories.name}
                    </Badge>
                  </div>
                )}

                <h3 className="text-lg font-bold text-foreground mb-3">
                  {post.title}
                </h3>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {post.city}{post.district && `, ${post.district}`}
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Button */}
          {remainingCount > 0 && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-8 py-2.5 text-sm font-semibold text-brand hover:bg-brand/5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Wczytywanie...
                  </>
                ) : (
                  `Wczytaj więcej (${remainingCount})`
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-card border border-border rounded-3xl shadow-sm p-8 text-center">
          <p className="text-muted-foreground">Brak aktywnych ogłoszeń</p>
        </div>
      )}
    </div>
  )
}
