'use client'

import { usePostsInfinite } from '@/lib/hooks/usePosts'
import { useEffect, useRef } from 'react'

/**
 * Przykładowy komponent pokazujący nowoczesne użycie TanStack Query v5
 * z infinite scroll - BEZ useEffect do fetchowania danych!
 *
 * Korzyści tego podejścia:
 * 1. Automatyczne cache'owanie
 * 2. Automatyczne refetching w tle
 * 3. Optimistic updates
 * 4. No więcej useEffect spaghetti!
 */
export function InfinitePostsExample() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = usePostsInfinite({ city: 'Warszawa' })

  const observerTarget = useRef<HTMLDivElement>(null)

  // Jedyne miejsce gdzie używamy useEffect - do intersection observer
  // TanStack Query obsługuje resztę!
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 1.0 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (status === 'pending') {
    return <div>Ładowanie...</div>
  }

  if (status === 'error') {
    return <div>Błąd: {error.message}</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Posty (Infinite Scroll)</h2>

      {/* Wszystkie strony z infinite query */}
      {data.pages.map((page, pageIndex) => (
        <div key={pageIndex} className="space-y-2">
          {page.posts.map((post) => (
            <div
              key={post.id}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <h3 className="font-semibold">{post.title}</h3>
              <p className="text-sm text-gray-600">{post.city}</p>
              <p className="text-xs text-gray-400">
                {new Date(post.created_at).toLocaleDateString('pl-PL')}
              </p>
            </div>
          ))}
        </div>
      ))}

      {/* Intersection observer target - automatycznie loaduje następną stronę */}
      <div ref={observerTarget} className="h-10 flex items-center justify-center">
        {isFetchingNextPage ? (
          <div className="text-sm text-gray-500">Ładowanie więcej...</div>
        ) : hasNextPage ? (
          <div className="text-sm text-gray-400">Scroll aby załadować więcej</div>
        ) : (
          <div className="text-sm text-gray-400">To już wszystko!</div>
        )}
      </div>

      {/* Loading indicator */}
      {isFetching && !isFetchingNextPage && (
        <div className="text-xs text-gray-400 text-center">
          Odświeżanie w tle...
        </div>
      )}
    </div>
  )
}

/**
 * STARY SPOSÓB (z useEffect) - już NIE POTRZEBNY!
 *
 * const [posts, setPosts] = useState([])
 * const [page, setPage] = useState(0)
 * const [loading, setLoading] = useState(false)
 *
 * useEffect(() => {
 *   setLoading(true)
 *   fetchPosts(page).then(data => {
 *     setPosts(prev => [...prev, ...data])
 *     setLoading(false)
 *   })
 * }, [page])
 *
 * NOWY SPOSÓB (z TanStack Query):
 *
 * const { data, fetchNextPage } = usePostsInfinite()
 *
 * Wszystko działa automatycznie! 🎉
 */
