'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Star } from 'lucide-react'

interface BookingActionsProps {
  bookingId: string
  status: string
  isProvider: boolean
  onUpdate: () => void
  reviewedId: string // ID of person to review (provider or client)
  postId: string
  hasReview?: boolean
}

export function BookingActions({ bookingId, status, isProvider, onUpdate, reviewedId, postId, hasReview = false }: BookingActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const updateBookingStatus = async (newStatus: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: newStatus })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Błąd podczas aktualizacji rezerwacji')
      }

      toast.success('Rezerwacja zaktualizowana', {
        description: getSuccessMessage(newStatus)
      })

      onUpdate()
    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('Wystąpił błąd', {
        description: error instanceof Error ? error.message : 'Nie udało się zaktualizować rezerwacji'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSuccessMessage = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Rezerwacja została potwierdzona'
      case 'cancelled': return 'Rezerwacja została anulowana'
      case 'completed': return 'Rezerwacja została oznaczona jako zakończona'
      default: return 'Status został zaktualizowany'
    }
  }

  const submitReview = async () => {
    if (rating < 1 || rating > 5) {
      toast.error('Wybierz ocenę od 1 do 5 gwiazdek')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewedId,
          postId,
          bookingId,
          rating,
          comment: comment.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Błąd podczas wystawiania oceny')
      }

      toast.success('Ocena została wystawiona', {
        description: 'Dziękujemy za Twoją opinię!'
      })

      setShowReviewDialog(false)
      setRating(5)
      setComment('')

      // Update booking status to 'reviewed'
      await updateBookingStatus('reviewed')
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Wystąpił błąd', {
        description: error instanceof Error ? error.message : 'Nie udało się wystawić oceny'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Provider can confirm, cancel, or mark as completed
  if (isProvider && status === 'pending') {
    return (
      <div className="flex gap-2 mt-3 pt-3 border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={isLoading}
              size="sm"
              variant="destructive"
              className="flex-1 rounded-full"
            >
              Odrzuć
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Odrzucić rezerwację?</AlertDialogTitle>
              <AlertDialogDescription>
                Czy na pewno chcesz odrzucić tę rezerwację? Klient zostanie poinformowany o anulowaniu.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anuluj</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => updateBookingStatus('cancelled')}
                className="bg-destructive hover:bg-destructive/90"
              >
                Odrzuć rezerwację
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          onClick={() => updateBookingStatus('confirmed')}
          disabled={isLoading}
          size="sm"
          className="flex-1 bg-brand hover:bg-brand/90 text-brand-foreground rounded-full"
        >
          Potwierdź
        </Button>
      </div>
    )
  }

  // Provider can mark confirmed booking as completed or cancel
  if (isProvider && status === 'confirmed') {
    return (
      <div className="flex gap-2 mt-3 pt-3 border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={isLoading}
              size="sm"
              variant="destructive"
              className="rounded-full"
            >
              Anuluj
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Anulować rezerwację?</AlertDialogTitle>
              <AlertDialogDescription>
                Czy na pewno chcesz anulować tę potwierdzoną rezerwację?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Nie</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => updateBookingStatus('cancelled')}
                className="bg-destructive hover:bg-destructive/90"
              >
                Tak, anuluj
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          onClick={() => updateBookingStatus('completed')}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="flex-1 rounded-full"
        >
          Oznacz jako zakończoną
        </Button>
      </div>
    )
  }

  // Client can cancel pending or confirmed booking
  if (!isProvider && (status === 'pending' || status === 'confirmed')) {
    return (
      <div className="mt-3 pt-3 border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={isLoading}
              size="sm"
              variant="destructive"
              className="w-full rounded-full"
            >
              Anuluj rezerwację
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Anulować rezerwację?</AlertDialogTitle>
              <AlertDialogDescription>
                Czy na pewno chcesz anulować tę rezerwację? Usługodawca zostanie poinformowany.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Nie</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => updateBookingStatus('cancelled')}
                className="bg-destructive hover:bg-destructive/90"
              >
                Tak, anuluj
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // Client can review completed booking
  if (!isProvider && status === 'completed' && !hasReview) {
    return (
      <>
        <div className="mt-3 pt-3 border-t">
          <Button
            onClick={() => setShowReviewDialog(true)}
            disabled={isLoading}
            size="sm"
            className="w-full bg-brand hover:bg-brand/90 text-brand-foreground rounded-full"
          >
            Wystaw ocenę
          </Button>
        </div>

        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Wystaw ocenę</DialogTitle>
              <DialogDescription>
                Oceń jakość wykonanej usługi
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Rating Stars */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Ocena</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'fill-brand text-brand'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Komentarz (opcjonalnie)</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Podziel się swoją opinią..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {comment.length}/500
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowReviewDialog(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Anuluj
              </Button>
              <Button
                onClick={submitReview}
                disabled={isLoading}
                className="flex-1 bg-brand hover:bg-brand/90 text-brand-foreground"
              >
                Wyślij ocenę
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Show message if already reviewed
  if (!isProvider && status === 'reviewed') {
    return (
      <div className="mt-3 pt-3 border-t">
        <p className="text-sm text-muted-foreground text-center">Ocena została wystawiona</p>
      </div>
    )
  }

  return null
}
