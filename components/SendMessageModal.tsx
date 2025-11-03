'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AI_BOT_USER_ID } from '@/lib/constants'

interface SendMessageModalProps {
  postId: string
  receiverId: string
  receiverName: string
  postTitle: string
  trigger?: React.ReactNode
  variant?: 'default' | 'mobile-dock'
}

export function SendMessageModal({
  postId,
  receiverId,
  receiverName,
  postTitle,
  trigger,
  variant = 'default'
}: SendMessageModalProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Client-side validation
    const trimmedMessage = message.trim()

    if (trimmedMessage.length < 10) {
      setError('Wiadomość musi mieć minimum 10 znaków')
      setLoading(false)
      return
    }

    if (trimmedMessage.length > 2000) {
      setError('Wiadomość może mieć maksymalnie 2000 znaków')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Musisz być zalogowany aby wysłać wiadomość')
        setLoading(false)
        return
      }

      // Additional client-side check to prevent self-messaging
      if (user.id === receiverId) {
        setError('Nie możesz wysłać wiadomości do siebie')
        setLoading(false)
        return
      }

      // Prevent sending messages to AI bot
      if (receiverId === AI_BOT_USER_ID) {
        setError('Nie możesz wysłać wiadomości do tego użytkownika')
        setLoading(false)
        return
      }

      // Send message
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          post_id: postId,
          content: trimmedMessage
        })

      if (insertError) {
        // Handle specific errors
        if (insertError.message.includes('rate_limit')) {
          setError('Wysłałeś zbyt wiele wiadomości. Poczekaj chwilę.')
        } else if (insertError.message.includes('spam')) {
          setError('Wysyłasz zbyt wiele wiadomości do tej osoby. Poczekaj kilka minut.')
        } else if (insertError.message.includes('min_length')) {
          setError('Wiadomość jest zbyt krótka (minimum 10 znaków)')
        } else if (insertError.message.includes('max_length')) {
          setError('Wiadomość jest zbyt długa (maksimum 2000 znaków)')
        } else {
          setError('Nie udało się wysłać wiadomości. Spróbuj ponownie.')
        }
        setLoading(false)
        return
      }

      setSuccess(true)
      setMessage('')

      // Close modal after 2 seconds
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError('Wystąpił nieoczekiwany błąd')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      setMessage('')
      setError(null)
      setSuccess(false)
    }
  }

  const characterCount = message.length
  const isValid = message.trim().length >= 10 && message.length <= 2000

  // Default trigger based on variant
  const defaultTrigger = variant === 'mobile-dock' ? (
    <Button className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-11 text-sm font-semibold gap-0">
      Wiadomość
    </Button>
  ) : (
    <Button className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 py-6 text-lg">
      Wyślij wiadomość
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] rounded-3xl border border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Wyślij wiadomość do {receiverName}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Dotyczy ogłoszenia: <span className="font-semibold text-foreground">{postTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="bg-green-50 text-green-700 p-6 rounded-2xl text-center">
            <svg className="w-16 h-16 mx-auto mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-lg font-semibold">Wiadomość została wysłana!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-3">
              <Label htmlFor="message" className="text-base font-semibold text-foreground">
                Twoja wiadomość *
              </Label>
              <Textarea
                id="message"
                placeholder="Napisz swoją wiadomość... (minimum 10 znaków)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="rounded-2xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-[#C44E35] resize-none"
                disabled={loading}
              />
              <div className="flex justify-between items-center text-sm">
                <span className={characterCount > 2000 ? 'text-red-500' : 'text-muted-foreground'}>
                  {characterCount} / 2000 znaków
                </span>
                {message.trim().length > 0 && message.trim().length < 10 && (
                  <span className="text-orange-500">
                    Minimum 10 znaków
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-4 rounded-2xl">
                {error}
              </div>
            )}

            <DialogFooter className="mt-8 pt-6 border-t-2 border-border">
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="rounded-full border-2"
                  disabled={loading}
                >
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0"
                  disabled={loading || !isValid}
                >
                  {loading ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
