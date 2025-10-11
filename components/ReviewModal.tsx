'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'

interface ReviewModalProps {
  reviewedUserId: string
  reviewedUserName: string
  postId?: string
  onReviewSubmitted?: () => void
}

export function ReviewModal({
  reviewedUserId,
  reviewedUserName,
  postId,
  onReviewSubmitted
}: ReviewModalProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Wybierz ocenę od 1 do 5 gwiazdek')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewed_id: reviewedUserId,
          post_id: postId,
          rating,
          comment: comment.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Nie udało się dodać opinii')
      }

      // Success
      setOpen(false)
      setRating(0)
      setComment('')
      onReviewSubmitted?.()
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas dodawania opinii')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full rounded-full bg-black hover:bg-black/80 text-white border-0 py-6 text-lg">
          Wystaw opinię
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-0 bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">
            Wystaw opinię
          </DialogTitle>
          <DialogDescription className="text-black/60">
            Oceń współpracę z {reviewedUserName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Star Rating */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-black">
              Twoja ocena *
            </label>
            <div className="flex gap-2 justify-center py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-[#C44E35] text-[#C44E35]'
                        : 'text-black/20'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-black/60">
              {rating === 0
                ? 'Kliknij aby wybrać ocenę'
                : rating === 1
                ? '⭐ Słabo'
                : rating === 2
                ? '⭐⭐ Poniżej oczekiwań'
                : rating === 3
                ? '⭐⭐⭐ Dobrze'
                : rating === 4
                ? '⭐⭐⭐⭐ Bardzo dobrze'
                : '⭐⭐⭐⭐⭐ Doskonale!'}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-3">
            <label htmlFor="comment" className="text-sm font-semibold text-black">
              Komentarz (opcjonalnie)
            </label>
            <Textarea
              id="comment"
              placeholder="Opisz swoją opinię o współpracy..."
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              className="rounded-2xl border-2 border-black/10 focus:border-black/30 resize-none"
            />
            <p className="text-xs text-black/40 text-right">
              {comment.length}/500
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5"
              disabled={loading}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0"
              disabled={loading || rating === 0}
            >
              {loading ? 'Wysyłanie...' : 'Wyślij opinię'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
