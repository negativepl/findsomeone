'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

export function ModerationPanel() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('flagged')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})

  const loadPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/moderation?status=${selectedStatus}`)
      const data = await response.json()
      setPosts(data.posts || [])
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

      // Reload posts
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-black/60">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label className="text-base font-semibold text-black">Status:</Label>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-64 rounded-2xl border-2 border-black/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flagged">Wymaga sprawdzenia</SelectItem>
            <SelectItem value="checking">W trakcie sprawdzania</SelectItem>
            <SelectItem value="pending">Oczekujące</SelectItem>
            <SelectItem value="rejected">Odrzucone</SelectItem>
            <SelectItem value="approved">Zatwierdzone</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card className="border-0 rounded-3xl bg-white">
          <CardContent className="py-20 text-center text-black/60">
            Brak ogłoszeń do wyświetlenia
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="border-0 rounded-3xl bg-white">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      {getStatusBadge(post.moderation_status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-black/60">
                      <span>{post.profiles?.full_name || 'Użytkownik'}</span>
                      <span>•</span>
                      <span>{post.city}{post.district ? `, ${post.district}` : ''}</span>
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
                  {post.moderation_score !== null && (
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(post.moderation_score)}`}>
                        {post.moderation_score.toFixed(0)}%
                      </div>
                      <div className="text-xs text-black/60">Score</div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    {/* Reject reason input */}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
