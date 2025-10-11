'use client'

import { useState } from 'react'
import { Flag, X } from 'lucide-react'

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
  const [isOpen, setIsOpen] = useState(false)
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
        setIsOpen(false)
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
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-black/40 hover:text-red-600 transition-colors p-1"
        title="Zgłoś wiadomość"
      >
        <Flag className="w-4 h-4" />
      </button>

      {/* Dialog/Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <Flag className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-black">Zgłoś wiadomość</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-black/40 hover:text-black transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

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
              <form onSubmit={handleSubmit}>
                {/* Description */}
                <p className="text-black/70 mb-6">
                  Zgłoś tę wiadomość, jeśli narusza regulamin lub zawiera nieodpowiednie treści.
                </p>

                {/* Reason Select */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-black mb-2">
                    Powód zgłoszenia *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#C44E35] bg-white"
                    required
                  >
                    <option value="">Wybierz powód...</option>
                    {REPORT_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description Textarea */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-black mb-2">
                    Dodatkowe informacje (opcjonalnie)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#C44E35] resize-none"
                    rows={4}
                    placeholder="Opisz problem..."
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-6 py-3 rounded-full border border-black/10 hover:bg-black/5 transition-colors font-semibold text-black"
                    disabled={isSubmitting}
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !reason}
                    className="flex-1 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Wysyłanie...' : 'Zgłoś'}
                  </button>
                </div>

                {/* Info */}
                <p className="text-xs text-black/50 mt-4 text-center">
                  Zgłoszenia są weryfikowane przez nasz zespół w ciągu 24-48h
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
