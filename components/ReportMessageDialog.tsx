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
      <DialogTrigger className="text-black/40 hover:text-red-600 transition-colors p-1">
        <Flag className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-0 rounded-3xl shadow-xl">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-black mb-2">Zgłoszenie wysłane</p>
            <p className="text-black/60">Dziękujemy. Sprawdzimy tę wiadomość.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <Flag className="w-5 h-5 text-red-600" />
                </div>
                <DialogTitle className="text-2xl">Zgłoś wiadomość</DialogTitle>
              </div>
              <DialogDescription className="text-base">
                Zgłoś tę wiadomość, jeśli narusza regulamin lub zawiera nieodpowiednie treści.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 py-4">
                <div className="space-y-3">
                  <Label htmlFor="reason" className="text-base font-semibold">
                    Powód zgłoszenia *
                  </Label>
                  <Select value={reason} onValueChange={setReason} disabled={isSubmitting}>
                    <SelectTrigger className="w-full rounded-2xl border-2 border-black/10 h-12 focus:border-black/30">
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
                  <Label htmlFor="description" className="text-base font-semibold">
                    Dodatkowe informacje (opcjonalnie)
                  </Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-black/10 focus:outline-none focus:ring-2 focus:ring-[#C44E35] focus:border-black/30 resize-none"
                    rows={4}
                    placeholder="Opisz problem..."
                    disabled={isSubmitting}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
                    {error}
                  </div>
                )}

                <p className="text-xs text-black/50 text-center">
                  Zgłoszenia są weryfikowane przez nasz zespół w ciągu 24-48h
                </p>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-black/5">
                <DialogFooter className="gap-2 sm:gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                    className="rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5"
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
