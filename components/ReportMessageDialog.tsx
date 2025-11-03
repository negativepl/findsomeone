'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ReportMessageDialogProps {
  messageId: string
  onReport: (messageId: string, reason: string, description: string) => Promise<void>
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Molestowanie' },
  { value: 'inappropriate', label: 'Treść niestosowna' },
  { value: 'scam', label: 'Oszustwo' },
  { value: 'other', label: 'Inne' },
]

export function ReportMessageDialog({ messageId, onReport }: ReportMessageDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason) {
      setError('Wybierz powód zgłoszenia')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onReport(messageId, reason, description)
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setReason('')
        setDescription('')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Nie udało się wysłać zgłoszenia')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors p-1" aria-label="Zgłoś wiadomość">
        <Flag className="w-4 h-4" aria-hidden="true" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border border-border rounded-3xl shadow-xl">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-foreground mb-2">Zgłoszenie wysłane</p>
            <p className="text-muted-foreground">Dziękujemy. Sprawdzimy tę wiadomość.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Flag className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <DialogTitle className="text-2xl text-foreground">Zgłoś wiadomość</DialogTitle>
              </div>
              <DialogDescription className="text-base text-muted-foreground">
                Zgłoś tę wiadomość, jeśli narusza regulamin lub zawiera nieodpowiednie treści.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 py-4">
                <div className="space-y-3">
                  <Label htmlFor="reason" className="text-base font-semibold text-foreground">
                    Powód zgłoszenia *
                  </Label>
                  <Select value={reason} onValueChange={setReason} disabled={isSubmitting}>
                    <SelectTrigger className="w-full rounded-2xl border-2 border-border h-12 focus:border-[#C44E35] bg-background text-foreground">
                      <SelectValue placeholder="Wybierz powód..." />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_REASONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-base font-semibold text-foreground">
                    Dodatkowe informacje (opcjonalnie)
                  </Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-border focus:outline-none focus:ring-2 focus:ring-[#C44E35]/20 focus:border-[#C44E35] resize-none bg-background text-foreground placeholder:text-muted-foreground"
                    rows={4}
                    placeholder="Opisz problem..."
                    disabled={isSubmitting}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Zgłoszenia są weryfikowane przez nasz zespół w ciągu 24-48h
                </p>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-border">
                <DialogFooter className="gap-2 sm:gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                    className="rounded-full border-2"
                  >
                    Anuluj
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !reason}
                    className="rounded-full bg-red-600 hover:bg-red-700 text-white border-0"
                  >
                    {isSubmitting ? 'Wysyłanie...' : 'Zgłoś'}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
