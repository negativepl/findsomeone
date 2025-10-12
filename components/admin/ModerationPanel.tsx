'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'

interface Post {
  id: string
  title: string
  description: string
  type: string
  city: string
  district: string | null
  price_min: number | null
  price_max: number | null
  moderation_status: string
  moderation_score: number | null
  moderation_reason: string | null
  moderation_details: any
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
}

const ITEMS_PER_PAGE = 10

export function ModerationPanel({
  flaggedCount,
  checkingCount,
  pendingCount,
  rejectedCount
}: ModerationPanelProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('flagged')
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

  const handleAction = async (postId: string, action: 'approve' | 'reject' | 'delete') => {
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
          }),
        })
      }

      await loadPosts()
    } catch (error) {
      console.error('Error performing action:', error)
      alert('Wystąpił błąd podczas wykonywania akcji')
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

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b-2 border-black/10">
        <button
          onClick={() => setSelectedStatus('flagged')}
          className={`flex items-center gap-3 px-6 py-4 font-semibold transition-all relative ${
            selectedStatus === 'flagged'
              ? 'text-[#C44E35]'
              : 'text-black/60 hover:text-black'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Wymagają uwagi</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            selectedStatus === 'flagged'
              ? 'bg-[#C44E35] text-white'
              : 'bg-black/10 text-black/60'
          }`}>
            {flaggedCount}
          </span>
          {selectedStatus === 'flagged' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
          )}
        </button>

        <button
          onClick={() => setSelectedStatus('checking')}
          className={`flex items-center gap-3 px-6 py-4 font-semibold transition-all relative ${
            selectedStatus === 'checking'
              ? 'text-[#C44E35]'
              : 'text-black/60 hover:text-black'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Sprawdzane</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            selectedStatus === 'checking'
              ? 'bg-[#C44E35] text-white'
              : 'bg-black/10 text-black/60'
          }`}>
            {checkingCount}
          </span>
          {selectedStatus === 'checking' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
          )}
        </button>

        <button
          onClick={() => setSelectedStatus('pending')}
          className={`flex items-center gap-3 px-6 py-4 font-semibold transition-all relative ${
            selectedStatus === 'pending'
              ? 'text-[#C44E35]'
              : 'text-black/60 hover:text-black'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Oczekujące</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            selectedStatus === 'pending'
              ? 'bg-[#C44E35] text-white'
              : 'bg-black/10 text-black/60'
          }`}>
            {pendingCount}
          </span>
          {selectedStatus === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
          )}
        </button>

        <button
          onClick={() => setSelectedStatus('rejected')}
          className={`flex items-center gap-3 px-6 py-4 font-semibold transition-all relative ${
            selectedStatus === 'rejected'
              ? 'text-[#C44E35]'
              : 'text-black/60 hover:text-black'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Odrzucone</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            selectedStatus === 'rejected'
              ? 'bg-[#C44E35] text-white'
              : 'bg-black/10 text-black/60'
          }`}>
            {rejectedCount}
          </span>
          {selectedStatus === 'rejected' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
          )}
        </button>
      </div>

      {/* Posts List */}
      {loading ? (
        <Card className="border-0 rounded-3xl bg-white">
          <CardContent className="py-20 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-[#C44E35] border-t-transparent rounded-full animate-spin" />
              <span className="text-black/60">Ładowanie...</span>
            </div>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card className="border-0 rounded-3xl bg-white">
          <CardContent className="py-20 text-center text-black/60">
            Brak ogłoszeń do wyświetlenia
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-0 rounded-3xl bg-white overflow-hidden">
            <div className="divide-y divide-black/5">
              {currentPosts.map((post) => (
                <div key={post.id} className="p-6">
                  {/* Compact Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-black truncate">{post.title}</h3>
                        {getStatusBadge(post.moderation_status)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-black/60 flex-wrap">
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
                          <div className="text-xs text-black/60">Score</div>
                        </div>
                      )}
                      <button
                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        className="p-2 hover:bg-black/5 rounded-xl transition-colors"
                      >
                        {expandedPost === post.id ? (
                          <ChevronUp className="w-5 h-5 text-black/60" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-black/60" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedPost === post.id && (
                    <div className="mt-4 space-y-4 pt-4 border-t border-black/10">
                      {/* Description */}
                      <div>
                        <div className="text-sm font-semibold text-black mb-2">Opis:</div>
                        <div
                          className="text-sm text-black/80 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: post.description }}
                        />
                      </div>

                      {/* Moderation Reason */}
                      {post.moderation_reason && (
                        <div>
                          <div className="text-sm font-semibold text-black mb-2">Powód flagowania:</div>
                          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                            {post.moderation_reason}
                          </div>
                        </div>
                      )}

                      {/* Details */}
                      {post.moderation_details && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-black/60 hover:text-black">
                            Szczegóły techniczne
                          </summary>
                          <pre className="mt-2 bg-black/5 p-3 rounded-xl overflow-auto text-xs">
                            {JSON.stringify(post.moderation_details, null, 2)}
                          </pre>
                        </details>
                      )}

                      {/* Actions */}
                      {selectedStatus === 'flagged' && (
                        <div className="pt-4 border-t border-black/10 space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-black/60">
                              Powód odrzucenia (opcjonalnie)
                            </Label>
                            <Textarea
                              placeholder="Podaj powód odrzucenia..."
                              value={rejectReasons[post.id] || ''}
                              onChange={(e) =>
                                setRejectReasons({ ...rejectReasons, [post.id]: e.target.value })
                              }
                              className="rounded-2xl border-2 border-black/10"
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
                              className="rounded-full border-2 border-red-600 text-red-600 hover:bg-red-50"
                            >
                              Odrzuć
                            </Button>
                            <Button
                              onClick={() => handleAction(post.id, 'delete')}
                              disabled={actionLoading === post.id}
                              variant="outline"
                              className="rounded-full border-2 border-black/10 text-black/60 hover:bg-black/5"
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
                className="rounded-full border-2 border-black/10"
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
                        : 'border-2 border-black/10'
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
                className="rounded-full border-2 border-black/10"
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
