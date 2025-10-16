'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MyListingsTabs } from '@/components/MyListingsTabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deletePost, updatePostStatus } from './actions'
import { useRouter } from 'next/navigation'
import { Pencil, PauseCircle, CheckCircle, PlayCircle, Trash2, MapPin, Clock, Eye, Phone } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ViewToggle } from '@/components/ViewToggle'

interface Post {
  id: string
  title: string
  description: string
  type: 'seeking' | 'offering'
  city: string
  district: string | null
  price_min: number | null
  price_max: number | null
  price_type: 'hourly' | 'fixed' | 'negotiable' | null
  status: 'active' | 'pending' | 'closed' | 'completed'
  moderation_status: 'pending' | 'checking' | 'approved' | 'rejected' | 'flagged'
  moderation_reason: string | null
  created_at: string
  views: number
  phone_clicks: number
  images: string[] | null
  categories: {
    name: string
  } | null
}

interface MyListingsClientProps {
  posts: Post[]
}

type FilterTab = 'all' | 'active' | 'rejected' | 'closed' | 'completed'

export function MyListingsClient({ posts: initialPosts }: MyListingsClientProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [isLoaded, setIsLoaded] = useState(false)
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Load saved view mode and sort from localStorage on mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('my-posts-view-mode')
    if (savedViewMode === 'grid' || savedViewMode === 'list') {
      setViewMode(savedViewMode)
    }
    const savedSort = localStorage.getItem('my-posts-sort')
    if (savedSort) {
      setSortBy(savedSort)
    }
    setIsLoaded(true)
  }, [])

  // Save view mode to localStorage when it changes
  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    localStorage.setItem('my-posts-view-mode', mode)
  }

  // Save sort to localStorage when it changes
  const handleSortChange = (value: string) => {
    setSortBy(value)
    localStorage.setItem('my-posts-sort', value)
  }

  // Reset posts when initialPosts change (e.g., after delete or status change)
  useEffect(() => {
    setPosts(initialPosts)
    setHasMore(initialPosts.length >= 12) // Assume more if we have at least 12 posts
  }, [initialPosts])

  const filteredPosts = posts
    .filter(post => {
      if (activeTab === 'all') return true
      if (activeTab === 'rejected') {
        return post.moderation_status === 'rejected'
      }
      return post.status === activeTab
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'views_desc':
          return b.views - a.views
        case 'views_asc':
          return a.views - b.views
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && filteredPosts.length >= 12) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, filteredPosts.length])

  const loadMore = async () => {
    setLoading(true)
    try {
      const offset = posts.length
      const response = await fetch(`/api/my-posts?offset=${offset}&limit=12`)
      const data = await response.json()

      if (data.posts && data.posts.length > 0) {
        setPosts((prev) => [...prev, ...data.posts])
        setHasMore(data.posts.length === 12)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more posts:', error)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const getTabCount = (tab: FilterTab) => {
    if (tab === 'all') return posts.length
    if (tab === 'rejected') {
      return posts.filter(p => p.moderation_status === 'rejected').length
    }
    return posts.filter(p => p.status === tab).length
  }

  const handleStatusChange = async (postId: string, newStatus: 'active' | 'closed' | 'completed') => {
    startTransition(async () => {
      const result = await updatePostStatus(postId, newStatus)
      if (result.error) {
        alert('Błąd: ' + result.error)
      } else {
        router.refresh()
      }
    })
  }

  const handleDelete = async () => {
    if (!postToDelete) return

    startTransition(async () => {
      const result = await deletePost(postToDelete)
      if (result.error) {
        alert('Błąd: ' + result.error)
      } else {
        router.refresh()
      }
      setDeleteDialogOpen(false)
      setPostToDelete(null)
    })
  }

  const openDeleteDialog = (postId: string) => {
    setPostToDelete(postId)
    setDeleteDialogOpen(true)
  }

  // Don't render until we've loaded the saved preference
  if (!isLoaded) {
    return null
  }

  return (
    <>
      {/* Tabs */}
      <div className="mb-6">
        <MyListingsTabs
          activeTab={activeTab}
          allCount={getTabCount('all')}
          activeCount={getTabCount('active')}
          rejectedCount={getTabCount('rejected')}
          completedCount={getTabCount('completed')}
          onTabChange={(tab) => setActiveTab(tab)}
        />
      </div>

      {/* Filters - View Toggle and Sort */}
      <div className="flex flex-row items-center justify-between gap-2 mb-6">
        {/* Left side - View toggle */}
        <ViewToggle view={viewMode} onViewChange={handleViewChange} />

        {/* Right side - Sort */}
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-auto rounded-xl border-black/10 h-9 bg-white focus:ring-0 focus:ring-offset-0 focus:border-black/20 px-2.5 gap-1 justify-start">
            <span className="text-sm">Sortuj według</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Najnowsze najpierw</SelectItem>
            <SelectItem value="oldest">Najstarsze najpierw</SelectItem>
            <SelectItem value="views_desc">Wyświetlenia: malejąco</SelectItem>
            <SelectItem value="views_asc">Wyświetlenia: rosnąco</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts List/Grid */}
      {filteredPosts && filteredPosts.length > 0 ? (
        <div className={viewMode === 'list' ? 'space-y-4' : 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'}>
          {filteredPosts.map((post: Post) => (
            <Card key={post.id} className={`border-0 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow group relative ${
              viewMode === 'list' ? '' : 'flex flex-col h-full'
            }`}>
              {/* Clickable overlay for entire card */}
              <Link
                href={`/dashboard/my-posts/${post.id}`}
                className="absolute inset-0 z-0 rounded-3xl"
                aria-label={`Zobacz ogłoszenie: ${post.title}`}
              />

              <CardContent className={viewMode === 'list' ? 'p-6 relative z-10' : 'p-0 flex flex-col h-full relative z-10'}>
                <div className={viewMode === 'list' ? 'flex flex-col md:flex-row gap-6' : 'flex flex-col h-full'}>
                  {/* Image thumbnail */}
                  {post.images && post.images.length > 0 && (
                    <div className={`relative overflow-hidden bg-black/5 flex-shrink-0 ${
                      viewMode === 'list'
                        ? 'w-full md:w-40 h-40 rounded-2xl'
                        : 'w-full h-48 rounded-t-3xl'
                    }`}>
                      <Image
                        src={post.images[0]}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Content area */}
                  <div className={`flex-1 flex flex-col justify-between min-w-0 ${
                    viewMode === 'grid' ? 'p-6' : ''
                  }`}>
                    {/* Top section - Badges and Title */}
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            className={`rounded-full px-3 py-1 text-xs ${
                              post.type === 'seeking'
                                ? 'bg-[#C44E35] text-white border-0'
                                : 'bg-black text-white border-0'
                            }`}
                          >
                            {post.type === 'seeking' ? 'Szukam' : 'Oferuję'}
                          </Badge>
                          {viewMode === 'list' && post.categories && (
                            <Badge variant="outline" className="rounded-full border-black/10 text-black/60 text-xs">
                              {post.categories.name}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={`rounded-full text-xs ${
                              post.moderation_status === 'rejected'
                                ? 'border-red-500 text-red-600 bg-red-50'
                                : post.status === 'active'
                                ? 'border-green-500 text-green-600 bg-green-50'
                                : post.status === 'completed'
                                ? 'border-blue-500 text-blue-600 bg-blue-50'
                                : 'border-black/10 text-black/60'
                            }`}
                          >
                            {post.moderation_status === 'rejected'
                              ? '✗ Odrzucone'
                              : post.status === 'active'
                              ? '✓ Aktywne'
                              : post.status === 'completed'
                              ? 'Zakończone'
                              : 'Nieaktywne'}
                          </Badge>
                        </div>
                        {viewMode === 'grid' && (
                          <span className="text-sm text-black/60">
                            {new Date(post.created_at).toLocaleDateString('pl-PL', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}, {new Date(post.created_at).toLocaleTimeString('pl-PL', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-black mb-3">
                        {post.title}
                      </h3>

                      {/* Rejection reason */}
                      {post.moderation_status === 'rejected' && post.moderation_reason && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-sm text-red-800">
                            <span className="font-semibold">Powód odrzucenia:</span> {post.moderation_reason}
                          </p>
                        </div>
                      )}

                      {/* Meta info - Grid view: location in bottom section, List view: all details */}
                      {viewMode === 'list' && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-black/60">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{post.city}{post.district && `, ${post.district}`}</span>
                          </div>
                          <span className="text-black/30">•</span>
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4 flex-shrink-0" />
                            <span>{post.views} wyświetleń</span>
                          </div>
                          <span className="text-black/30">•</span>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span>{post.phone_clicks || 0} kliknięć tel.</span>
                          </div>
                          <span className="text-black/30">•</span>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {new Date(post.created_at).toLocaleDateString('pl-PL', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })},{' '}
                              {new Date(post.created_at).toLocaleTimeString('pl-PL', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom section - Stats/Price and Actions */}
                    {viewMode === 'grid' ? (
                      /* Grid view: simple stats + location + price with actions */
                      <div className="mt-auto">
                        {/* Stats and Location in one row */}
                        <div className="flex items-center justify-center gap-3 text-sm text-black/60 flex-wrap p-3 bg-black/5 rounded-xl mb-3">
                            <div className="flex items-center gap-1.5">
                              <Eye className="w-4 h-4" />
                              <span>{post.views}</span>
                            </div>
                            <span className="text-black/30">•</span>
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-4 h-4" />
                              <span>{post.phone_clicks || 0}</span>
                            </div>
                            <span className="text-black/30">•</span>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{post.city}{post.district && `, ${post.district}`}</span>
                            </div>
                        </div>

                        {/* Footer with price and actions */}
                        <div className="pt-4 border-t-2 border-black/5">
                          <div className="flex items-center justify-between gap-4">
                            {/* Price */}
                            {(post.price_min || post.price_max) ? (
                              <div className="text-left">
                                <p className="text-xl font-bold text-black">
                                  {post.price_min && post.price_max
                                    ? `${post.price_min}-${post.price_max} zł`
                                    : post.price_min
                                    ? `${post.price_min} zł`
                                    : `${post.price_max} zł`}
                                </p>
                                {post.price_type && (
                                  <p className="text-sm text-black/60">
                                    {post.price_type === 'hourly'
                                      ? 'za godzinę'
                                      : post.price_type === 'fixed'
                                      ? 'cena stała'
                                      : 'do negocjacji'}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div></div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Link href={`/dashboard/my-posts/${post.id}/edit`} className="relative z-20">
                                <button
                                  className="h-10 w-10 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 flex items-center justify-center transition-all"
                                  title="Edytuj"
                                >
                                  <Pencil className="w-4 h-4 text-black" />
                                </button>
                              </Link>

                              {post.status === 'active' && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleStatusChange(post.id, 'closed')
                                    }}
                                    className="h-10 w-10 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                    disabled={isPending}
                                    title="Dezaktywuj"
                                  >
                                    <PauseCircle className="w-4 h-4 text-black" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleStatusChange(post.id, 'completed')
                                    }}
                                    className="h-10 w-10 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                    disabled={isPending}
                                    title="Zakończ"
                                  >
                                    <CheckCircle className="w-4 h-4 text-black" />
                                  </button>
                                </>
                              )}

                              {post.status === 'closed' && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleStatusChange(post.id, 'active')
                                    }}
                                    className="h-10 w-10 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                    disabled={isPending}
                                    title="Aktywuj"
                                  >
                                    <PlayCircle className="w-4 h-4 text-black" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleStatusChange(post.id, 'completed')
                                    }}
                                    className="h-10 w-10 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                    disabled={isPending}
                                    title="Zakończ"
                                  >
                                    <CheckCircle className="w-4 h-4 text-black" />
                                  </button>
                                </>
                              )}

                              {post.status === 'completed' && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handleStatusChange(post.id, 'active')
                                  }}
                                  className="h-10 w-10 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                  disabled={isPending}
                                  title="Aktywuj ponownie"
                                >
                                  <PlayCircle className="w-4 h-4 text-black" />
                                </button>
                              )}

                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  openDeleteDialog(post.id)
                                }}
                                className="h-10 w-10 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] flex items-center justify-center transition-colors relative z-20"
                                disabled={isPending}
                                title="Usuń"
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* List view: full details with price and actions in one footer */
                      <>
                        {/* Footer with price and actions */}
                        <div className="pt-4 mt-4 border-t-2 border-black/5">
                          <div className="flex items-center justify-between gap-4">
                            {/* Price */}
                            {(post.price_min || post.price_max) ? (
                              <div className="flex items-center gap-3">
                                <span className="text-xl font-bold text-black">
                                  {post.price_min && post.price_max
                                    ? `${post.price_min}-${post.price_max} zł`
                                    : post.price_min
                                    ? `${post.price_min} zł`
                                    : `${post.price_max} zł`}
                                </span>
                                {post.price_type && (
                                  <span className="text-sm text-black/60">
                                    {post.price_type === 'hourly'
                                      ? 'za godzinę'
                                      : post.price_type === 'fixed'
                                      ? 'cena stała'
                                      : 'do negocjacji'}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div></div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Link href={`/dashboard/my-posts/${post.id}/edit`} className="relative z-20">
                                <button
                                  className="h-10 w-10 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 flex items-center justify-center transition-all"
                                  title="Edytuj"
                                >
                                  <Pencil className="w-4 h-4 text-black" />
                                </button>
                              </Link>

                              {post.status === 'active' && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleStatusChange(post.id, 'closed')
                                    }}
                                    className="h-10 w-10 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                    disabled={isPending}
                                    title="Dezaktywuj"
                                  >
                                    <PauseCircle className="w-4 h-4 text-black" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleStatusChange(post.id, 'completed')
                                    }}
                                    className="h-10 w-10 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                    disabled={isPending}
                                    title="Zakończ"
                                  >
                                    <CheckCircle className="w-4 h-4 text-black" />
                                  </button>
                                </>
                              )}

                              {post.status === 'closed' && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleStatusChange(post.id, 'active')
                                    }}
                                    className="h-10 w-10 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                    disabled={isPending}
                                    title="Aktywuj"
                                  >
                                    <PlayCircle className="w-4 h-4 text-black" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleStatusChange(post.id, 'completed')
                                    }}
                                    className="h-10 w-10 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                    disabled={isPending}
                                    title="Zakończ"
                                  >
                                    <CheckCircle className="w-4 h-4 text-black" />
                                  </button>
                                </>
                              )}

                              {post.status === 'completed' && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handleStatusChange(post.id, 'active')
                                  }}
                                  className="h-10 w-10 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                  disabled={isPending}
                                  title="Aktywuj ponownie"
                                >
                                  <PlayCircle className="w-4 h-4 text-black" />
                                </button>
                              )}

                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  openDeleteDialog(post.id)
                                }}
                                className="h-10 w-10 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] flex items-center justify-center transition-colors relative z-20"
                                disabled={isPending}
                                title="Usuń"
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Card className="border-0 rounded-3xl bg-white max-w-md mx-auto">
            <CardContent className="p-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-black/5 flex items-center justify-center">
                <svg className="w-10 h-10 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-black mb-2">
                {activeTab === 'all'
                  ? 'Nie masz jeszcze żadnych ogłoszeń'
                  : `Nie masz ogłoszeń w kategorii "${
                      activeTab === 'active' ? 'Aktywne' :
                      activeTab === 'rejected' ? 'Odrzucone' :
                      activeTab === 'closed' ? 'Nieaktywne' : 'Zakończone'
                    }"`
                }
              </p>
              <p className="text-black/60 mb-6">
                {activeTab === 'all'
                  ? 'Dodaj swoje pierwsze ogłoszenie i zacznij pomagać innym!'
                  : 'Zmień filtr lub dodaj nowe ogłoszenie'
                }
              </p>
              {activeTab === 'all' && (
                <Link href="/dashboard/my-posts/new">
                  <Button className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 px-8">
                    Dodaj ogłoszenie
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Observer target for infinite scroll */}
      {hasMore && filteredPosts.length > 0 && (
        <div ref={observerTarget} className="py-8 text-center">
          {loading && (
            <div className="flex items-center justify-center gap-2 text-black/60">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Ładowanie...</span>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-0 bg-white shadow-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-black">
              Usuń ogłoszenie
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-black/60">
              Czy na pewno chcesz usunąć to ogłoszenie? Ta akcja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-8 pt-6 border-t-2 border-black/5">
            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel
                className="rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5"
                disabled={isPending}
              >
                Anuluj
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0"
                disabled={isPending}
              >
                {isPending ? 'Usuwanie...' : 'Usuń'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
