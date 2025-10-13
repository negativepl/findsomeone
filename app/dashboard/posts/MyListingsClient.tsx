'use client'

import { useState, useTransition } from 'react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deletePost, updatePostStatus } from './actions'
import { useRouter } from 'next/navigation'
import { Edit2, Pause, CheckCircle, Play, Trash2, MapPin, Clock, Eye, Phone } from 'lucide-react'

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

export function MyListingsClient({ posts }: MyListingsClientProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true
    if (activeTab === 'rejected') {
      return post.moderation_status === 'rejected'
    }
    return post.status === activeTab
  })

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

  return (
    <>
      {/* Tabs */}
      <div className="mb-8">
        <MyListingsTabs
          activeTab={activeTab}
          allCount={getTabCount('all')}
          activeCount={getTabCount('active')}
          rejectedCount={getTabCount('rejected')}
          completedCount={getTabCount('completed')}
          onTabChange={(tab) => setActiveTab(tab)}
        />
      </div>

      {/* Posts List */}
      {filteredPosts && filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post: Post) => (
            <Card key={post.id} className="border-0 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image thumbnail */}
                  {post.images && post.images.length > 0 && (
                    <div className="relative w-full md:w-40 h-40 rounded-2xl overflow-hidden bg-black/5 flex-shrink-0">
                      <Image
                        src={post.images[0]}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Content area */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    {/* Top section - Badges and Title */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge
                          className={`rounded-full px-3 py-1 text-xs ${
                            post.type === 'seeking'
                              ? 'bg-[#C44E35] text-white border-0'
                              : 'bg-black text-white border-0'
                          }`}
                        >
                          {post.type === 'seeking' ? 'Szukam' : 'Oferuję'}
                        </Badge>
                        {post.categories && (
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

                      <h3 className="text-xl font-bold text-black mb-3 group-hover:text-[#C44E35] transition-colors">
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

                      {/* Meta info */}
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
                    </div>

                    {/* Bottom section - Price and Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5">
                      {(post.price_min || post.price_max) ? (
                        <div className="text-sm">
                          <span className="font-semibold text-black">
                            {post.price_min && post.price_max
                              ? `${post.price_min} - ${post.price_max} zł`
                              : post.price_min
                              ? `od ${post.price_min} zł`
                              : `do ${post.price_max} zł`}
                          </span>
                          {post.price_type && (
                            <span className="text-black/50 ml-2">
                              {post.price_type === 'hourly'
                                ? '/ za godzinę'
                                : post.price_type === 'fixed'
                                ? '/ stała cena'
                                : '/ do negocjacji'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div></div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/dashboard/posts/${post.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5"
                          >
                            Zobacz
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5"
                              disabled={isPending}
                            >
                              Akcje
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-2xl border-0 shadow-lg bg-white p-2">
                            <DropdownMenuItem asChild className="rounded-xl cursor-pointer px-3 py-2.5">
                              <Link href={`/dashboard/posts/${post.id}/edit`} className="flex items-center gap-3">
                                <Edit2 className="w-4 h-4 text-black/60" />
                                <span>Edytuj</span>
                              </Link>
                            </DropdownMenuItem>

                            {post.status === 'active' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(post.id, 'closed')}
                                  className="rounded-xl cursor-pointer px-3 py-2.5 flex items-center gap-3"
                                >
                                  <Pause className="w-4 h-4 text-black/60" />
                                  <span>Dezaktywuj</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(post.id, 'completed')}
                                  className="rounded-xl cursor-pointer px-3 py-2.5 flex items-center gap-3"
                                >
                                  <CheckCircle className="w-4 h-4 text-black/60" />
                                  <span>Zakończ</span>
                                </DropdownMenuItem>
                              </>
                            )}

                            {post.status === 'closed' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(post.id, 'active')}
                                  className="rounded-xl cursor-pointer px-3 py-2.5 flex items-center gap-3"
                                >
                                  <Play className="w-4 h-4 text-black/60" />
                                  <span>Aktywuj</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(post.id, 'completed')}
                                  className="rounded-xl cursor-pointer px-3 py-2.5 flex items-center gap-3"
                                >
                                  <CheckCircle className="w-4 h-4 text-black/60" />
                                  <span>Zakończ</span>
                                </DropdownMenuItem>
                              </>
                            )}

                            {post.status === 'completed' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(post.id, 'active')}
                                className="rounded-xl cursor-pointer px-3 py-2.5 flex items-center gap-3"
                              >
                                <Play className="w-4 h-4 text-black/60" />
                                <span>Aktywuj ponownie</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(post.id)}
                              className="rounded-xl cursor-pointer px-3 py-2.5 flex items-center gap-3 text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Usuń</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
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
                <Link href="/dashboard/posts/new">
                  <Button className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 px-8">
                    Dodaj ogłoszenie
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-0 bg-white max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-center space-y-2">
              <AlertDialogTitle className="text-xl font-bold text-black">
                Usuń ogłoszenie
              </AlertDialogTitle>
              <AlertDialogDescription className="text-black/60">
                Czy na pewno chcesz usunąć to ogłoszenie? Ta akcja jest nieodwracalna.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 mt-6">
            <AlertDialogCancel
              className="flex-1 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 m-0"
              disabled={isPending}
            >
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white border-0 m-0"
              disabled={isPending}
            >
              {isPending ? 'Usuwanie...' : 'Usuń'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
