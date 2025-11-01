'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { MyListingsTabs } from '@/components/MyListingsTabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
import { deletePost, updatePostStatus, appealRejectedPost } from './actions'
import { useRouter } from 'next/navigation'
import { Pencil, PauseCircle, CheckCircle, PlayCircle, Trash2, MapPin, Clock, Eye, Phone, XCircle, CalendarClock, RefreshCw, AlertCircle, MessageSquare, CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
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
  city: string
  district: string | null
  price: number | null
  price_type: 'hourly' | 'fixed' | 'free' | null
  price_negotiable: boolean | null
  status: 'active' | 'pending' | 'closed' | 'completed'
  moderation_status: 'pending' | 'checking' | 'approved' | 'rejected' | 'flagged'
  moderation_reason: string | null
  appeal_status: 'pending' | 'reviewing' | 'approved' | 'rejected' | null
  appeal_message: string | null
  appealed_at: string | null
  created_at: string
  expires_at: string | null
  extended_count: number
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
  const [appealDialogOpen, setAppealDialogOpen] = useState(false)
  const [postToAppeal, setPostToAppeal] = useState<string | null>(null)
  const [appealMessage, setAppealMessage] = useState('')
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
    // Show confirmation for reactivation
    if (newStatus === 'active') {
      const confirmed = confirm(
        'Uwaga: Po reaktywowaniu ogłoszenia zostanie ono ponownie zweryfikowane przez system moderacji i będzie widoczne publicznie dopiero po zatwierdzeniu. Czy chcesz kontynuować?'
      )
      if (!confirmed) return
    }

    startTransition(async () => {
      const result = await updatePostStatus(postId, newStatus)
      if (result.error) {
        toast.error('Błąd', { description: result.error })
      } else {
        if (newStatus === 'active') {
          toast.success('Ogłoszenie wysłane do weryfikacji', {
            description: 'Będzie widoczne publicznie po zatwierdzeniu'
          })
        }
        router.refresh()
      }
    })
  }

  const handleDelete = async () => {
    if (!postToDelete) return

    startTransition(async () => {
      const result = await deletePost(postToDelete)
      if (result.error) {
        toast.error('Błąd', { description: result.error })
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

  const openAppealDialog = (postId: string) => {
    setPostToAppeal(postId)
    setAppealMessage('')
    setAppealDialogOpen(true)
  }

  const handleAppeal = async () => {
    if (!postToAppeal || !appealMessage.trim()) {
      toast.error('Proszę podać powód odwołania')
      return
    }

    startTransition(async () => {
      const result = await appealRejectedPost(postToAppeal, appealMessage)
      if (result.error) {
        toast.error('Błąd', { description: result.error })
      } else {
        toast.success('Odwołanie wysłane', {
          description: 'Moderator sprawdzi je w ciągu 24 godzin'
        })
        setAppealDialogOpen(false)
        setPostToAppeal(null)
        setAppealMessage('')
        router.refresh()
      }
    })
  }

  const handleExtendPost = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Czy na pewno chcesz przedłużyć to ogłoszenie o 30 dni?')) {
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/extend`, {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('Failed to extend post')
        }

        router.refresh()
      } catch (error) {
        toast.error('Błąd podczas przedłużania ogłoszenia', {
          description: 'Spróbuj ponownie'
        })
      }
    })
  }

  const getDaysUntilExpiry = (expiresAt: string | null): number | null => {
    if (!expiresAt) return null
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getExpiryText = (expiresAt: string | null): { text: string, urgent: boolean } => {
    const days = getDaysUntilExpiry(expiresAt)
    if (days === null) return { text: '', urgent: false }

    if (days < 0) return { text: 'Wygasło', urgent: true }
    if (days === 0) return { text: 'Wygasa dziś', urgent: true }
    if (days === 1) return { text: 'Wygasa jutro', urgent: true }
    if (days <= 7) return { text: `Wygasa za ${days} dni`, urgent: true }
    return { text: `Wygasa za ${days} dni`, urgent: false }
  }

  const isPendingModeration = (post: Post): boolean => {
    return (post.status === 'pending' ||
            post.moderation_status === 'checking' ||
            post.moderation_status === 'pending' ||
            post.moderation_status === 'flagged')
  }

  const pendingModerationPosts = posts.filter(isPendingModeration)

  // Helper function for Polish declension
  const getPendingPostsText = (count: number): { title: string, description: string } => {
    const getPostWord = (n: number): string => {
      if (n === 1) return 'ogłoszenie'
      const lastDigit = n % 10
      const lastTwoDigits = n % 100
      if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'ogłoszeń'
      if (lastDigit >= 2 && lastDigit <= 4) return 'ogłoszenia'
      return 'ogłoszeń'
    }

    const getVerbForm = (n: number): string => {
      // Dla 1 zawsze liczba pojedyncza
      if (n === 1) return 'oczekuje'

      // Dla 2-4 (oprócz 12-14) używamy liczby mnogiej
      const lastDigit = n % 10
      const lastTwoDigits = n % 100

      if (lastTwoDigits >= 12 && lastTwoDigits <= 14) {
        return 'oczekuje' // 12-14, 112-114 etc. z dopełniaczem
      }

      if (lastDigit >= 2 && lastDigit <= 4) {
        return 'oczekują' // 2-4, 22-24, 32-34 etc.
      }

      return 'oczekuje' // 5-21, 25-31 etc. z dopełniaczem
    }

    const getPronoun = (n: number): string => {
      if (n === 1) return 'Twoje ogłoszenie jest'
      return 'Twoje ogłoszenia są'
    }

    const getPublishForm = (n: number): string => {
      if (n === 1) return 'Zostanie opublikowane'
      return 'Zostaną opublikowane'
    }

    return {
      title: `${count} ${getPostWord(count)} ${getVerbForm(count)} na zatwierdzenie`,
      description: `${getPronoun(count)} obecnie sprawdzane przez moderatora. ${getPublishForm(count)} po pozytywnej weryfikacji.`
    }
  }

  // Don't render until we've loaded the saved preference
  if (!isLoaded) {
    return null
  }

  return (
    <>
      {/* Pending Moderation Alert */}
      {pendingModerationPosts.length > 0 && (
        <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-1">
              {getPendingPostsText(pendingModerationPosts.length).title}
            </h3>
            <p className="text-sm text-yellow-800">
              {getPendingPostsText(pendingModerationPosts.length).description}
            </p>
          </div>
        </div>
      )}

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
        <div className={viewMode === 'list' ? 'space-y-4' : 'grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3'}>
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

              <CardContent className={viewMode === 'list' ? 'p-0 relative z-10' : 'p-0 flex flex-col h-full relative z-10'}>
                {viewMode === 'list' ? (
                  /* List view: mobile - vertical layout, desktop - horizontal with image on left (like /posts) */
                  <>
                    {/* Mobile layout */}
                    <div className="md:hidden flex flex-col">
                      <div className="flex gap-3 p-4 pb-0 items-start">
                        {/* Image thumbnail */}
                        {post.images && post.images.length > 0 && (
                          <div className="relative overflow-hidden bg-black/5 flex-shrink-0 w-20 h-20 rounded-xl">
                            <Image
                              src={post.images[0]}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 flex flex-col min-w-0">
                          {/* Status badge in top right */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-base font-bold text-black line-clamp-2 flex-1">
                              {post.title}
                            </h3>
                            {post.moderation_status === 'rejected' ? (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
                                <XCircle className="w-3 h-3 text-red-600" />
                                <span className="text-xs font-semibold text-red-700">Odrzucone</span>
                              </div>
                            ) : isPendingModeration(post) ? (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 border border-yellow-200 rounded-lg flex-shrink-0">
                                <Clock className="w-3 h-3 text-yellow-600" />
                                <span className="text-xs font-semibold text-yellow-700">Oczekuje</span>
                              </div>
                            ) : post.status === 'active' ? (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-lg flex-shrink-0">
                                <CheckCircle2 className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-semibold text-green-700">Aktywne</span>
                              </div>
                            ) : post.status === 'completed' ? (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-lg flex-shrink-0">
                                <CheckCircle className="w-3 h-3 text-gray-600" />
                                <span className="text-xs font-semibold text-gray-700">Zakończone</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-lg flex-shrink-0">
                                <PauseCircle className="w-3 h-3 text-gray-600" />
                                <span className="text-xs font-semibold text-gray-700">Nieaktywne</span>
                              </div>
                            )}
                          </div>

                          {/* Rejection reason */}
                          {post.moderation_status === 'rejected' && post.moderation_reason && (
                            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-xl">
                              <p className="text-xs text-red-800">
                                <span className="font-semibold">Powód:</span> {post.moderation_reason}
                              </p>
                            </div>
                          )}

                          {/* Location and Stats */}
                          <div className="flex items-center gap-2 text-xs text-black/60 flex-wrap">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{post.city}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{post.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{post.phone_clicks || 0}</span>
                            </div>
                            {post.status === 'active' && post.expires_at && (() => {
                              const expiryInfo = getExpiryText(post.expires_at)
                              return expiryInfo.text && (
                                <div className={`flex items-center gap-1 ${expiryInfo.urgent ? 'text-[#C44E35] font-semibold' : ''}`}>
                                  <CalendarClock className="w-3 h-3" />
                                  <span>{expiryInfo.text}</span>
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Footer - full width */}
                      <div className="pt-3 pb-4 mt-3 border-t-2 border-black/5 px-4">
                        <div className="flex items-center justify-between gap-2">
                          {/* Price */}
                          {post.price ? (
                            <div className="text-left">
                              <p className="text-base font-bold text-black">
                                {post.price} zł
                              </p>
                              {post.price_type && (
                                <p className="text-xs text-black/60">
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

                        {/* Actions Container */}
                        <div className="bg-black/[0.02] rounded-xl p-2 flex items-center gap-1.5">
                          {post.status === 'active' && post.expires_at && getDaysUntilExpiry(post.expires_at) !== null && getDaysUntilExpiry(post.expires_at)! <= 7 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => handleExtendPost(post.id, e)}
                                    className="h-8 w-8 rounded-lg bg-white border border-[#C44E35]/30 text-[#C44E35] hover:bg-[#C44E35]/10 flex items-center justify-center transition-all relative z-20"
                                    disabled={isPending}
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={5}>
                                  <p>Przedłuż o 30 dni</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          {post.moderation_status === 'rejected' && !post.appeal_status && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      openAppealDialog(post.id)
                                    }}
                                    className="h-8 w-8 rounded-lg bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all relative z-20"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={5}>
                                  <p>Odwołaj się od decyzji</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          {post.appeal_status === 'pending' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="h-8 px-3 rounded-lg bg-white border border-yellow-200 text-yellow-700 flex items-center justify-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-xs font-semibold">W trakcie</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={5}>
                                  <p>Oczekuje na rozpatrzenie</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/dashboard/my-posts/${post.id}/edit`} className="relative z-20">
                                  <button className="h-8 w-8 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all">
                                    <Pencil className="w-3 h-3 text-black" />
                                  </button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent sideOffset={5}>
                                <p>Edytuj</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {post.status === 'active' && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault()
                                        handleStatusChange(post.id, 'closed')
                                      }}
                                      className="h-8 w-8 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                      disabled={isPending}
                                    >
                                      <PauseCircle className="w-3 h-3 text-black" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={5}>
                                    <p>Dezaktywuj</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault()
                                        handleStatusChange(post.id, 'completed')
                                      }}
                                      className="h-8 w-8 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                      disabled={isPending}
                                    >
                                      <CheckCircle className="w-3 h-3 text-black" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={5}>
                                    <p>Zakończ</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}

                          {post.status === 'closed' && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault()
                                        handleStatusChange(post.id, 'active')
                                      }}
                                      className="h-8 w-8 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                      disabled={isPending}
                                    >
                                      <PlayCircle className="w-3 h-3 text-black" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={5}>
                                    <p>Aktywuj</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault()
                                        handleStatusChange(post.id, 'completed')
                                      }}
                                      className="h-8 w-8 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                      disabled={isPending}
                                    >
                                      <CheckCircle className="w-3 h-3 text-black" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={5}>
                                    <p>Zakończ</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}

                          {post.status === 'completed' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleStatusChange(post.id, 'active')
                                    }}
                                    className="h-8 w-8 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                    disabled={isPending}
                                  >
                                    <PlayCircle className="w-3 h-3 text-black" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={5}>
                                  <p>Aktywuj ponownie</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    openDeleteDialog(post.id)
                                  }}
                                  className="h-8 w-8 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center transition-all relative z-20"
                                  disabled={isPending}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent sideOffset={5}>
                                <p>Usuń</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  </div>

                    {/* Desktop layout */}
                    <div className="hidden md:flex h-full overflow-hidden rounded-3xl">
                      {/* Image container - left side, full height */}
                      {post.images && post.images.length > 0 && (
                        <div className="relative bg-black/5 w-64 flex-shrink-0">
                          <Image
                            src={post.images[0]}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Content container - right side */}
                      <div className="flex-1 flex flex-col p-6">
                        {/* Top section */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="text-xl font-bold text-black flex-1">
                            {post.title}
                          </h3>
                          {/* Status badge */}
                          {post.moderation_status === 'rejected' ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm font-semibold text-red-700">Odrzucone</span>
                            </div>
                          ) : isPendingModeration(post) ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg flex-shrink-0">
                              <Clock className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-semibold text-yellow-700">Oczekuje</span>
                            </div>
                          ) : post.status === 'active' ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg flex-shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-700">Aktywne</span>
                            </div>
                          ) : post.status === 'completed' ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg flex-shrink-0">
                              <CheckCircle className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-semibold text-gray-700">Zakończone</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg flex-shrink-0">
                              <PauseCircle className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-semibold text-gray-700">Nieaktywne</span>
                            </div>
                          )}
                        </div>

                        {/* Rejection reason */}
                        {post.moderation_status === 'rejected' && post.moderation_reason && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-800">
                              <span className="font-semibold">Powód odrzucenia:</span> {post.moderation_reason}
                            </p>
                          </div>
                        )}

                        {/* Spacer */}
                        <div className="flex-1"></div>

                        {/* Bottom section */}
                        <div className="space-y-3">
                          {/* Location and Stats */}
                          <div className="flex items-center gap-4 text-sm text-black/60">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{post.city}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{post.phone_clicks || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 ml-auto">
                              <Clock className="w-4 h-4" />
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

                          {/* Border separator */}
                          <div className="border-t-2 border-black/5"></div>

                          {/* Price and Actions */}
                          <div className="flex items-center justify-between gap-4">
                            {/* Price */}
                            {post.price && (
                              <div className="text-left">
                                <p className="text-xl font-bold text-black">
                                  {post.price} zł
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
                            )}

                            {/* Actions Container */}
                            <div className="bg-black/[0.02] rounded-xl p-2 flex items-center gap-2">
                              {post.moderation_status === 'rejected' && !post.appeal_status && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault()
                                          openAppealDialog(post.id)
                                        }}
                                        className="h-10 w-10 rounded-lg bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all relative z-20"
                                      >
                                        <MessageSquare className="w-4 h-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent sideOffset={5}>
                                      <p>Odwołaj się od decyzji</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {post.appeal_status === 'pending' && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="h-10 px-4 rounded-lg bg-white border border-yellow-200 text-yellow-700 flex items-center justify-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm font-semibold">W trakcie</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent sideOffset={5}>
                                      <p>Oczekuje na rozpatrzenie</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/dashboard/my-posts/${post.id}/edit`} className="relative z-20">
                                      <button className="h-10 w-10 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all">
                                        <Pencil className="w-4 h-4 text-black" />
                                      </button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={5}>
                                    <p>Edytuj</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {post.status === 'active' && (
                                <>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault()
                                            handleStatusChange(post.id, 'closed')
                                          }}
                                          className="h-10 w-10 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                          disabled={isPending}
                                        >
                                          <PauseCircle className="w-4 h-4 text-black" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent sideOffset={5}>
                                        <p>Dezaktywuj</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault()
                                            handleStatusChange(post.id, 'completed')
                                          }}
                                          className="h-10 w-10 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                          disabled={isPending}
                                        >
                                          <CheckCircle className="w-4 h-4 text-black" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent sideOffset={5}>
                                        <p>Zakończ</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </>
                              )}

                              {post.status === 'closed' && (
                                <>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault()
                                            handleStatusChange(post.id, 'active')
                                          }}
                                          className="h-10 w-10 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                          disabled={isPending}
                                        >
                                          <PlayCircle className="w-4 h-4 text-black" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent sideOffset={5}>
                                        <p>Aktywuj</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault()
                                            handleStatusChange(post.id, 'completed')
                                          }}
                                          className="h-10 w-10 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                          disabled={isPending}
                                        >
                                          <CheckCircle className="w-4 h-4 text-black" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent sideOffset={5}>
                                        <p>Zakończ</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </>
                              )}

                              {post.status === 'completed' && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault()
                                          handleStatusChange(post.id, 'active')
                                        }}
                                        className="h-10 w-10 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                        disabled={isPending}
                                      >
                                        <PlayCircle className="w-4 h-4 text-black" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent sideOffset={5}>
                                      <p>Aktywuj ponownie</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault()
                                        openDeleteDialog(post.id)
                                      }}
                                      className="h-10 w-10 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center transition-all relative z-20"
                                      disabled={isPending}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={5}>
                                    <p>Usuń</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Grid view: image above, content below */
                  <>
                    {/* Image thumbnail */}
                    {post.images && post.images.length > 0 && (
                      <div className="relative overflow-hidden bg-black/5 flex-shrink-0 w-full h-40 md:h-48 rounded-t-3xl">
                        <Image
                          src={post.images[0]}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Content area */}
                    <div className="flex-1 flex flex-col min-w-0 p-4 md:p-6">
                      {/* Top section - Title and Status */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
                          {/* Status badge in top right */}
                          {post.moderation_status === 'rejected' ? (
                            <div className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
                              <XCircle className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                              <span className="text-xs md:text-sm font-semibold text-red-700">Odrzucone</span>
                            </div>
                          ) : isPendingModeration(post) ? (
                            <div className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 bg-yellow-50 border border-yellow-200 rounded-lg flex-shrink-0">
                              <Clock className="w-3 h-3 md:w-4 md:h-4 text-yellow-600" />
                              <span className="text-xs md:text-sm font-semibold text-yellow-700">Oczekuje</span>
                            </div>
                          ) : post.status === 'active' ? (
                            <div className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 bg-green-50 border border-green-200 rounded-lg flex-shrink-0">
                              <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                              <span className="text-xs md:text-sm font-semibold text-green-700">Aktywne</span>
                            </div>
                          ) : post.status === 'completed' ? (
                            <div className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 bg-gray-50 border border-gray-200 rounded-lg flex-shrink-0">
                              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                              <span className="text-xs md:text-sm font-semibold text-gray-700">Zakończone</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 bg-gray-50 border border-gray-200 rounded-lg flex-shrink-0">
                              <PauseCircle className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                              <span className="text-xs md:text-sm font-semibold text-gray-700">Nieaktywne</span>
                            </div>
                          )}
                        </div>

                        <h3 className="text-base md:text-xl font-bold text-black mb-2 md:mb-3 line-clamp-2">
                          {post.title}
                        </h3>

                        {/* Rejection reason */}
                        {post.moderation_status === 'rejected' && post.moderation_reason && (
                          <div className="mb-2 md:mb-3 p-2 md:p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-xs md:text-sm text-red-800">
                              <span className="font-semibold">Powód odrzucenia:</span> {post.moderation_reason}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Bottom section - Stats/Price and Actions */}
                      <div className="mt-auto">
                        {/* Location and Stats in one row */}
                        <div className="flex items-center justify-between gap-2 md:gap-3 text-xs md:text-sm text-black/60 mb-3">
                            {/* Location - left */}
                            <div className="flex items-center gap-1 md:gap-1.5 min-w-0">
                              <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                              <span className="truncate">{post.city}{post.district && `, ${post.district}`}</span>
                            </div>

                            {/* Stats - right */}
                            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                              <div className="flex items-center gap-1 md:gap-1.5">
                                <Eye className="w-3 h-3 md:w-4 md:h-4" />
                                <span>{post.views}</span>
                              </div>
                              <div className="flex items-center gap-1 md:gap-1.5">
                                <Phone className="w-3 h-3 md:w-4 md:h-4" />
                                <span>{post.phone_clicks || 0}</span>
                              </div>
                            </div>
                        </div>

                        {/* Footer with price and actions */}
                        <div className="pt-3 md:pt-4 border-t-2 border-black/5">
                          <div className="flex items-center justify-between gap-2 md:gap-4">
                            {/* Price */}
                            {post.price ? (
                              <div className="text-left">
                                <p className="text-base md:text-xl font-bold text-black">
                                  {post.price} zł
                                </p>
                                {post.price_type && (
                                  <p className="text-xs md:text-sm text-black/60">
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

                            {/* Actions Container */}
                            <div className="bg-black/[0.02] rounded-xl p-2 flex items-center gap-1.5 md:gap-2">
                              {post.moderation_status === 'rejected' && !post.appeal_status && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault()
                                          openAppealDialog(post.id)
                                        }}
                                        className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all relative z-20"
                                      >
                                        <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent sideOffset={5}>
                                      <p>Odwołaj się</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {post.appeal_status === 'pending' && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="h-8 px-2 md:h-10 md:px-3 rounded-lg bg-white border border-yellow-200 text-yellow-700 flex items-center justify-center gap-1">
                                        <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="text-xs md:text-sm font-semibold hidden md:inline">W trakcie</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent sideOffset={5}>
                                      <p>Odwołanie oczekuje</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/dashboard/my-posts/${post.id}/edit`} className="relative z-20">
                                      <button className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all">
                                        <Pencil className="w-3 h-3 md:w-4 md:h-4 text-black" />
                                      </button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={5}>
                                    <p>Edytuj</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {post.status === 'active' && (
                                <>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault()
                                            handleStatusChange(post.id, 'closed')
                                          }}
                                          className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                          disabled={isPending}
                                        >
                                          <PauseCircle className="w-3 h-3 md:w-4 md:h-4 text-black" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent sideOffset={5}>
                                        <p>Dezaktywuj</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault()
                                            handleStatusChange(post.id, 'completed')
                                          }}
                                          className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                          disabled={isPending}
                                        >
                                          <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-black" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent sideOffset={5}>
                                        <p>Zakończ</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </>
                              )}

                              {post.status === 'closed' && (
                                <>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault()
                                            handleStatusChange(post.id, 'active')
                                          }}
                                          className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                          disabled={isPending}
                                        >
                                          <PlayCircle className="w-3 h-3 md:w-4 md:h-4 text-black" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent sideOffset={5}>
                                        <p>Aktywuj</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault()
                                            handleStatusChange(post.id, 'completed')
                                          }}
                                          className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                          disabled={isPending}
                                        >
                                          <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-black" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent sideOffset={5}>
                                        <p>Zakończ</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </>
                              )}

                              {post.status === 'completed' && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault()
                                          handleStatusChange(post.id, 'active')
                                        }}
                                        className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center transition-all relative z-20"
                                        disabled={isPending}
                                      >
                                        <PlayCircle className="w-3 h-3 md:w-4 md:h-4 text-black" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent sideOffset={5}>
                                      <p>Aktywuj ponownie</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault()
                                        openDeleteDialog(post.id)
                                      }}
                                      className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center transition-all relative z-20"
                                      disabled={isPending}
                                    >
                                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={5}>
                                    <p>Usuń</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
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
        <AlertDialogContent className="rounded-3xl border-0 shadow-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">
              Usuń ogłoszenie
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
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

      {/* Appeal Dialog */}
      <AlertDialog open={appealDialogOpen} onOpenChange={setAppealDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-0 shadow-xl sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">
              Odwołaj się od decyzji moderacji
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Jeśli uważasz, że Twoje ogłoszenie zostało niesłusznie odrzucone, możesz wysłać odwołanie. Moderator ponownie sprawdzi treść w ciągu 24 godzin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="appeal-message" className="text-sm font-semibold mb-2 block">
              Wyjaśnij dlaczego uważasz, że odrzucenie było błędne *
            </Label>
            <Textarea
              id="appeal-message"
              value={appealMessage}
              onChange={(e) => setAppealMessage(e.target.value)}
              placeholder="np. Moje ogłoszenie nie zawiera treści zabronionych. Podane informacje są zgodne z regulaminem..."
              className="rounded-2xl border-2 border-black/10 min-h-[120px] focus:border-black/30"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {appealMessage.length}/500 znaków
            </p>
          </div>
          <div className="mt-8 pt-6 border-t-2 border-black/5">
            <AlertDialogFooter className="gap-3 sm:gap-3">
            <AlertDialogCancel
              className="rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 h-11"
              disabled={isPending}
            >
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAppeal}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white border-0 h-11 font-semibold"
              disabled={isPending || !appealMessage.trim()}
            >
              {isPending ? 'Wysyłanie...' : 'Wyślij odwołanie'}
            </AlertDialogAction>
          </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
