'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, MessageSquare, Calendar, User, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  response: string | null
  responded_at: string | null
  reviewer: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
  post: {
    id: string
    title: string
  } | null
}

interface ReviewsClientProps {
  reviews: Review[]
  rating: number
  totalReviews: number
  userId: string
}

export function ReviewsClient({ reviews, rating, totalReviews, userId }: ReviewsClientProps) {
  const router = useRouter()
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestingDeletion, setRequestingDeletion] = useState<string | null>(null)

  // Calculate rating distribution - use actual reviews count
  const actualReviewsCount = reviews.length
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: actualReviewsCount > 0 ? (reviews.filter(r => r.rating === stars).length / actualReviewsCount) * 100 : 0
  }))

  const handleSubmitResponse = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error('Proszę wpisać odpowiedź')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          response: responseText
        })
      })

      if (!response.ok) throw new Error('Failed to submit response')

      toast.success('Odpowiedź została dodana')
      setRespondingTo(null)
      setResponseText('')
      router.refresh()
    } catch (error) {
      console.error('Error submitting response:', error)
      toast.error('Nie udało się dodać odpowiedzi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestDeletion = async (reviewId: string) => {
    setRequestingDeletion(reviewId)

    try {
      const response = await fetch('/api/reviews/request-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('API Error:', data)
        throw new Error(data.error || 'Failed to request deletion')
      }

      toast.success('Wysłano prośbę o usunięcie opinii')
    } catch (error) {
      console.error('Error requesting deletion:', error)
      toast.error('Nie udało się wysłać prośby')
    } finally {
      setRequestingDeletion(null)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 md:gap-6">
        {/* Average Rating */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Star className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Średnia ocena</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-foreground">{rating.toFixed(1)}</p>
                  <span className="text-sm text-muted-foreground">/ 5.0</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{totalReviews} {totalReviews === 1 ? 'ocena' : 'ocen'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Rozkład ocen</h3>
          <div className="space-y-3">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{stars}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Wszystkie oceny</h3>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Star className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-2">Brak ocen</p>
              <p className="text-muted-foreground">Nie otrzymałeś jeszcze żadnych opinii</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      {/* Reviewer Avatar */}
                      {review.reviewer?.avatar_url ? (
                        <Image
                          src={review.reviewer.avatar_url}
                          alt={review.reviewer.full_name || 'Użytkownik'}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center">
                          <User className="w-6 h-6 text-brand-foreground" />
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-foreground">
                          {review.reviewer?.full_name || 'Użytkownik'}
                        </p>
                        {renderStars(review.rating)}
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(review.created_at).toLocaleDateString('pl-PL', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Link */}
                  {review.post && (
                    <Link
                      href={`/posts/${review.post.id}`}
                      className="inline-block mb-3 text-sm text-brand hover:underline"
                    >
                      Ogłoszenie: {review.post.title}
                    </Link>
                  )}

                  {/* Review Comment */}
                  {review.comment ? (
                    <p className="text-foreground mb-4 bg-muted/50 p-4 rounded-xl">
                      {review.comment}
                    </p>
                  ) : (
                    <p className="text-muted-foreground mb-4 italic text-sm">
                      Brak komentarza
                    </p>
                  )}

                  {/* Response Section */}
                  {review.response ? (
                    <div className="mt-4 pl-12 border-l-2 border-brand/30">
                      <div className="bg-brand/5 p-4 rounded-xl">
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                          <MessageSquare className="w-3 h-3" />
                          Twoja odpowiedź • {new Date(review.responded_at!).toLocaleDateString('pl-PL')}
                        </p>
                        <p className="text-foreground">{review.response}</p>
                      </div>
                    </div>
                  ) : respondingTo === review.id ? (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pl-12 border-l-2 border-brand/30"
                      >
                        <div className="space-y-3">
                          <Textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Napisz swoją odpowiedź..."
                            className="rounded-xl min-h-[100px]"
                            maxLength={500}
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {responseText.length}/500
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setRespondingTo(null)
                                  setResponseText('')
                                }}
                                className="rounded-full"
                              >
                                Anuluj
                              </Button>
                              <Button
                                onClick={() => handleSubmitResponse(review.id)}
                                disabled={isSubmitting || !responseText.trim()}
                                className="rounded-full bg-brand hover:bg-brand/90 text-brand-foreground"
                              >
                                {isSubmitting ? 'Wysyłanie...' : 'Wyślij odpowiedź'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setRespondingTo(review.id)}
                        className="rounded-full h-12 w-full"
                        size="lg"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Odpowiedz na opinie
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRequestDeletion(review.id)}
                        disabled={requestingDeletion === review.id}
                        className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 h-12 w-full"
                        size="lg"
                      >
                        <Trash2 className="w-5 h-5 mr-2" />
                        {requestingDeletion === review.id ? 'Wysyłanie...' : 'Poproś o usunięcie'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
