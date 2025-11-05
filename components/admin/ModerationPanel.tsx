'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatedTabs } from '@/components/AnimatedTabs'

interface Post {
  id: string
  title: string
  description: string
  type: string
  city: string
  district: string | null
  price: number | null
  price: number | null
  moderation_status: string
  moderation_score: number | null
  moderation_reason: string | null
  moderation_details: any
  appeal_status: string | null
  appeal_message: string | null
  appealed_at: string | null
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string | null
  }
  categories: {
    name: string
    slug: string
  } | null
}

interface ModerationPanelProps {
  flaggedCount: number
  checkingCount: number
  pendingCount: number
  rejectedCount: number
  appealsCount: number
}

const ITEMS_PER_PAGE = 10

export function ModerationPanel({
  flaggedCount,
  checkingCount,
  pendingCount,
  rejectedCount,
  appealsCount
}: ModerationPanelProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  // Always start with appeals tab (most urgent items)
  const [selectedStatus, setSelectedStatus] = useState('appeals')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const loadPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/moderation?status=${selectedStatus}`)
      const data = await response.json()
      setPosts(data.posts || [])
      setCurrentPage(1) // Reset to first page when changing status
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [selectedStatus])

  const handleAction = async (postId: string, action: 'approve' | 'reject' | 'delete' | 'approve_appeal' | 'reject_appeal') => {
    if (action === 'delete' && !confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) {
      return
    }

    setActionLoading(postId)
    try {
      if (action === 'delete') {
        await fetch(`/api/admin/moderation/${postId}`, {
          method: 'DELETE',
        })
      } else {
        await fetch(`/api/admin/moderation/${postId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            reason: action === 'reject' ? rejectReasons[postId] : null,
            appealResponse: (action === 'approve_appeal' || action === 'reject_appeal') ? rejectReasons[postId] : null,
          }),
        })
      }

      await loadPosts()
      toast.success('Akcja wykonana pomyślnie')
    } catch (error) {
      console.error('Error performing action:', error)
      toast.error('Wystąpił błąd podczas wykonywania akcji', {
        description: 'Spróbuj ponownie'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      flagged: { color: 'bg-yellow-100 text-yellow-800', label: 'Wymaga sprawdzenia' },
      checking: { color: 'bg-blue-100 text-blue-800', label: 'Sprawdzanie' },
      pending: { color: 'bg-gray-100 text-gray-800', label: 'Oczekuje' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Odrzucone' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Zatwierdzone' },
    }
    const variant = variants[status] || variants.pending
    return (
      <Badge className={`${variant.color} border-0`}>
        {variant.label}
      </Badge>
    )
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500'
    if (score >= 70) return 'text-green-600'
    if (score >= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Pagination
  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentPosts = posts.slice(startIndex, endIndex)

  const tabs = [
    {
      id: 'appeals',
      label: 'Odwołania',
      count: appealsCount,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      id: 'flagged',
      label: 'Wymagają uwagi',
      count: flaggedCount,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      id: 'checking',
      label: 'Sprawdzane',
      count: checkingCount,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'pending',
      label: 'Oczekujące',
      count: pendingCount,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'rejected',
      label: 'Odrzucone',
      count: rejectedCount,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <AnimatedTabs tabs={tabs} activeTab={selectedStatus} onTabChange={setSelectedStatus} />

      {/* Posts List */}
      {loading ? (
        <Card className="border border-border rounded-3xl bg-card">
          <CardContent className="py-20 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border border-[#C44E35] border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground">Ładowanie...</span>
            </div>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card className="border border-border rounded-3xl bg-card">
          <CardContent className="py-20 text-center text-muted-foreground">
            Brak ogłoszeń do wyświetlenia
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border border-border rounded-3xl bg-card overflow-hidden">
            <div className="divide-y divide-border">
              {currentPosts.map((post) => (
                <div key={post.id} className="p-6">
                  {/* Compact Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground truncate">{post.title}</h3>
                        {getStatusBadge(post.moderation_status)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span>{post.profiles?.full_name || 'Użytkownik'}</span>
                        <span>•</span>
                        <span>{post.city}</span>
                        {post.categories && (
                          <>
                            <span>•</span>
                            <span>{post.categories.name}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString('pl-PL')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {post.moderation_score !== null && (
                        <div className="text-right">
                          <div className={`text-xl font-bold ${getScoreColor(post.moderation_score)}`}>
                            {post.moderation_score.toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                      )}
                      <button
                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        className="p-2 hover:bg-muted rounded-xl transition-colors"
                      >
                        {expandedPost === post.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedPost === post.id && (
                    <div className="mt-4 space-y-4 pt-4 border-t border-border">
                      {/* Description */}
                      <div>
                        <div className="text-sm font-semibold text-foreground mb-2">Opis:</div>
                        <div
                          className="text-sm text-foreground prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: post.description }}
                        />
                      </div>

                      {/* Moderation Reason */}
                      {post.moderation_reason && (
                        <div>
                          <div className="text-sm font-semibold text-foreground mb-2">Powód flagowania:</div>
                          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                            {post.moderation_reason}
                          </div>
                        </div>
                      )}

                      {/* Appeal Message */}
                      {post.appeal_message && (
                        <div>
                          <div className="text-sm font-semibold text-foreground mb-2">Odwołanie użytkownika:</div>
                          <div className="text-sm text-blue-800 bg-blue-50 p-3 rounded-xl border border-blue-200">
                            {post.appeal_message}
                          </div>
                          {post.appealed_at && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Wysłano: {new Date(post.appealed_at).toLocaleString('pl-PL')}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Details */}
                      {post.moderation_details && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            Szczegóły techniczne
                          </summary>
                          <pre className="mt-2 bg-muted p-3 rounded-xl overflow-auto text-xs">
                            {JSON.stringify(post.moderation_details, null, 2)}
                          </pre>
                        </details>
                      )}

                      {/* Actions */}
                      {selectedStatus === 'appeals' && post.appeal_status === 'pending' && (
                        <div className="pt-4 border-t border-border space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">
                              Odpowiedź dla użytkownika (opcjonalnie)
                            </Label>
                            <Textarea
                              placeholder="Podaj dodatkowe informacje..."
                              value={rejectReasons[post.id] || ''}
                              onChange={(e) =>
                                setRejectReasons({ ...rejectReasons, [post.id]: e.target.value })
                              }
                              className="rounded-2xl border-border bg-card text-foreground"
                              rows={2}
                            />
                          </div>

                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleAction(post.id, 'approve_appeal')}
                              disabled={actionLoading === post.id}
                              className="rounded-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              {actionLoading === post.id ? 'Ładowanie...' : 'Zatwierdź odwołanie'}
                            </Button>
                            <Button
                              onClick={() => handleAction(post.id, 'reject_appeal')}
                              disabled={actionLoading === post.id}
                              variant="outline"
                              className="rounded-full border border-red-600 text-red-600 hover:bg-red-50"
                            >
                              Odrzuć odwołanie
                            </Button>
                          </div>
                        </div>
                      )}

                      {selectedStatus === 'flagged' && (
                        <div className="pt-4 border-t border-border space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">
                              Powód odrzucenia (opcjonalnie)
                            </Label>
                            <Textarea
                              placeholder="Podaj powód odrzucenia..."
                              value={rejectReasons[post.id] || ''}
                              onChange={(e) =>
                                setRejectReasons({ ...rejectReasons, [post.id]: e.target.value })
                              }
                              className="rounded-2xl border-border bg-card text-foreground"
                              rows={2}
                            />
                          </div>

                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleAction(post.id, 'approve')}
                              disabled={actionLoading === post.id}
                              className="rounded-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              {actionLoading === post.id ? 'Ładowanie...' : 'Zatwierdź'}
                            </Button>
                            <Button
                              onClick={() => handleAction(post.id, 'reject')}
                              disabled={actionLoading === post.id}
                              variant="outline"
                              className="rounded-full border border-red-600 text-red-600 hover:bg-red-50"
                            >
                              Odrzuć
                            </Button>
                            <Button
                              onClick={() => handleAction(post.id, 'delete')}
                              disabled={actionLoading === post.id}
                              variant="outline"
                              className="rounded-full border border-border text-muted-foreground hover:bg-muted"
                            >
                              Usuń
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-border"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-full w-10 h-10 p-0 ${
                      currentPage === page
                        ? 'bg-[#C44E35] hover:bg-[#B33D2A] text-white'
                        : 'border border-border'
                    }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-border"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
