'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Flag, Check, X, Eye, Trash2, AlertTriangle, Ban, Loader2 } from 'lucide-react'
import { updateReportStatus, deleteMessage, banUser, logReportAccess, getMessageContent } from '@/lib/actions/admin-reports'

interface Report {
  report_id: string
  message_id: string
  message_content?: string // Optional - loaded only when selected
  sender_id: string
  sender_name: string
  receiver_id: string
  receiver_name: string
  reporter_id: string
  reporter_name: string
  reason: string
  description: string | null
  status: string
  created_at: string
  is_read: boolean
  first_read_at: string | null
  first_read_by: string | null
}

interface ReportsListProps {
  initialReports: Report[]
}

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  harassment: 'Molestowanie',
  inappropriate: 'Treść niestosowna',
  scam: 'Oszustwo',
  other: 'Inne',
}

export function ReportsList({ initialReports }: ReportsListProps) {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [messageContent, setMessageContent] = useState<string | null>(null)
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionNotes, setActionNotes] = useState('')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showConfirmBan, setShowConfirmBan] = useState(false)
  const [banReason, setBanReason] = useState('')

  // Load message content when report is selected
  useEffect(() => {
    if (selectedReport) {
      setIsLoadingContent(true)
      setMessageContent(null)

      // Load content and log access
      Promise.all([
        logReportAccess(selectedReport.report_id, selectedReport.message_id),
        getMessageContent(selectedReport.message_id, selectedReport.report_id)
      ])
        .then(([_, contentResult]) => {
          setMessageContent(contentResult.content)

          // Mark report as read in the UI
          if (!selectedReport.is_read) {
            setReports(prevReports =>
              prevReports.map(r =>
                r.report_id === selectedReport.report_id
                  ? { ...r, is_read: true, first_read_at: new Date().toISOString() }
                  : r
              )
            )
            // Update selectedReport to reflect the read state
            setSelectedReport(prev =>
              prev ? { ...prev, is_read: true, first_read_at: new Date().toISOString() } : null
            )
          }
        })
        .catch(err => {
          console.error('Failed to load message content:', err)
          setMessageContent('Błąd: Nie udało się załadować treści wiadomości')
        })
        .finally(() => {
          setIsLoadingContent(false)
        })
    }
  }, [selectedReport?.report_id]) // Use report_id instead of full object

  const handleDismiss = async () => {
    if (!selectedReport) return
    setIsProcessing(true)

    try {
      await updateReportStatus(selectedReport.report_id, 'dismissed', actionNotes || 'Zgłoszenie nieuzasadnione')

      // Remove from list
      setReports(reports.filter(r => r.report_id !== selectedReport.report_id))
      setSelectedReport(null)
      setActionNotes('')

      // Refresh server data to ensure consistency
      router.refresh()
    } catch (error: any) {
      toast.error('Błąd', { description: error.message })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWarning = async () => {
    if (!selectedReport) return
    setIsProcessing(true)

    try {
      await updateReportStatus(selectedReport.report_id, 'resolved', actionNotes || 'Ostrzeżenie wysłane do użytkownika')

      // Remove from list
      setReports(reports.filter(r => r.report_id !== selectedReport.report_id))
      setSelectedReport(null)
      setActionNotes('')

      // Refresh server data to ensure consistency
      router.refresh()
    } catch (error: any) {
      toast.error('Błąd', { description: error.message })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteMessage = async () => {
    if (!selectedReport) return
    setIsProcessing(true)

    try {
      await deleteMessage(
        selectedReport.message_id,
        selectedReport.report_id,
        actionNotes || 'Naruszenie regulaminu'
      )

      // Remove from list
      setReports(reports.filter(r => r.report_id !== selectedReport.report_id))
      setSelectedReport(null)
      setActionNotes('')
      setShowConfirmDelete(false)

      // Refresh server data to ensure consistency
      router.refresh()
    } catch (error: any) {
      toast.error('Błąd', { description: error.message })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBanUser = async () => {
    if (!selectedReport || !banReason.trim()) {
      toast.error('Podaj powód bana')
      return
    }
    setIsProcessing(true)

    try {
      const result = await banUser(
        selectedReport.sender_id,
        banReason,
        selectedReport.report_id,
        actionNotes || undefined
      )

      toast.success(result.message)

      // Remove from list
      setReports(reports.filter(r => r.report_id !== selectedReport.report_id))
      setSelectedReport(null)
      setActionNotes('')
      setBanReason('')
      setShowConfirmBan(false)

      // Refresh server data to ensure consistency
      router.refresh()
    } catch (error: any) {
      toast.error('Błąd', { description: error.message })
    } finally {
      setIsProcessing(false)
    }
  }

  if (reports.length === 0) {
    return (
      <Card className="border-0 rounded-3xl bg-white p-12">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">
            Brak zgłoszeń
          </h2>
          <p className="text-black/60">
            Wszystkie zgłoszenia zostały rozpatrzone. Świetna robota!
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid lg:grid-cols-[1fr_550px] gap-6">
      {/* Reports List */}
      <div>
        <Card className="border-0 rounded-3xl bg-white overflow-hidden">
          <div className="divide-y divide-black/5">
            {reports.map((report) => (
              <div
                key={report.report_id}
                className={`p-6 transition-colors cursor-pointer relative ${
                  !report.is_read
                    ? 'bg-[#C44E35]/5 hover:bg-[#C44E35]/10 border-l-4 border-l-[#C44E35]'
                    : 'hover:bg-[#F5F1E8]'
                }`}
                onClick={() => setSelectedReport(report)}
              >
                {/* Unread Badge */}
                {!report.is_read && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C44E35]/10 border border-[#C44E35]/30 text-[#C44E35] text-xs font-semibold shadow-sm">
                      <Eye className="w-3.5 h-3.5" />
                      Nieodczytane - zostanie odnotowane w systemie audit trail
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      !report.is_read ? 'bg-[#C44E35]/10' : 'bg-red-50'
                    }`}>
                      <Flag className={`w-6 h-6 ${
                        !report.is_read ? 'text-[#C44E35]' : 'text-red-600'
                      }`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header with reason and date */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-black">
                            {REASON_LABELS[report.reason] || report.reason}
                          </h3>
                        </div>
                        <p className="text-sm text-black/50">
                          {new Date(report.created_at).toLocaleDateString('pl-PL', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* Reporter */}
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                        <p className="text-xs font-medium text-amber-700 mb-1">Zgłaszający</p>
                        <p className="text-sm font-semibold text-amber-900">{report.reporter_name}</p>
                      </div>

                      {/* ID */}
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-xs font-medium text-gray-600 mb-1">ID zgłoszenia</p>
                        <p className="text-xs font-mono text-gray-900 break-all leading-relaxed">{report.report_id}</p>
                      </div>
                    </div>

                    {/* Conversation participants */}
                    <div className="bg-black/5 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-black/60 mb-2">Rozmowa między</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-black">{report.sender_name}</span>
                        <svg className="w-4 h-4 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span className="font-semibold text-black">{report.receiver_name}</span>
                      </div>
                    </div>

                    {/* Description if exists */}
                    {report.description && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <p className="text-xs font-medium text-blue-700 mb-1">Dodatkowy opis</p>
                        <p className="text-sm text-blue-900 italic">"{report.description}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Details Panel */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        {selectedReport ? (
          <Card className="border-0 rounded-3xl bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-black/10">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h2 className="text-2xl font-bold text-black">Szczegóły zgłoszenia</h2>
                <p className="text-sm font-medium text-black flex-shrink-0">
                  {new Date(selectedReport.created_at).toLocaleString('pl-PL')}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-black/60">
                  {REASON_LABELS[selectedReport.reason] || selectedReport.reason}
                </p>
                <p className="text-xs text-black/40 font-mono flex-shrink-0">
                  {selectedReport.report_id}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Message Content - Most Important */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <label className="text-sm font-semibold text-red-900 mb-2 block">Zgłoszona wiadomość</label>
                {isLoadingContent ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                    <span className="text-sm text-red-700">Ładowanie...</span>
                  </div>
                ) : (
                  <p className="text-red-900">{messageContent || 'Brak treści'}</p>
                )}
              </div>

              {/* People Involved */}
              <div className="grid grid-cols-3 gap-3">
                <div className="border border-black/10 rounded-xl p-3">
                  <label className="text-xs font-semibold text-black/60 block mb-1">Nadawca</label>
                  <p className="text-sm font-medium text-black">{selectedReport.sender_name}</p>
                </div>
                <div className="border border-black/10 rounded-xl p-3">
                  <label className="text-xs font-semibold text-black/60 block mb-1">Odbiorca</label>
                  <p className="text-sm font-medium text-black">{selectedReport.receiver_name}</p>
                </div>
                <div className="border border-black/10 rounded-xl p-3">
                  <label className="text-xs font-semibold text-black/60 block mb-1">Zgłaszający</label>
                  <p className="text-sm font-medium text-black">{selectedReport.reporter_name}</p>
                </div>
              </div>

              {/* Description if exists */}
              {selectedReport.description && (
                <div>
                  <label className="text-sm font-semibold text-black/70 block mb-2">Dodatkowy opis</label>
                  <p className="text-sm text-black/80 border border-black/10 rounded-xl p-3">{selectedReport.description}</p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold text-black/70 block mb-2">Notatki (opcjonalnie)</label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#C44E35] resize-none"
                  rows={3}
                  placeholder="Dodaj notatki do zgłoszenia..."
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="px-6 py-4 border-t border-black/10 bg-black/[0.02] space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDismiss}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-full bg-white border border-black/10 hover:bg-black/5 text-black font-medium transition-colors disabled:opacity-50 text-sm"
                >
                  Odrzuć
                </button>
                <button
                  onClick={handleWarning}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-full bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 text-yellow-700 font-medium transition-colors disabled:opacity-50 text-sm"
                >
                  Ostrzeż
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 text-sm"
                >
                  Usuń wiadomość
                </button>

                <button
                  onClick={() => setShowConfirmBan(true)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-full bg-black hover:bg-black/90 text-white font-medium transition-colors disabled:opacity-50 text-sm"
                >
                  Zbanuj {selectedReport?.sender_name}
                </button>
              </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showConfirmDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-black">Potwierdź usunięcie</h3>
                  </div>

                  <p className="text-black/70 mb-6">
                    Czy na pewno chcesz usunąć tę wiadomość? Ta akcja jest <strong>nieodwracalna</strong> i zostanie zalogowana w systemie.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-3 rounded-full border border-black/10 hover:bg-black/5 transition-colors font-semibold text-black"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={handleDeleteMessage}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Usuwanie...' : 'Usuń'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Ban User Confirmation Dialog */}
            {showConfirmBan && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center">
                      <Ban className="w-6 h-6 text-black" />
                    </div>
                    <h3 className="text-xl font-bold text-black">Zbanuj użytkownika</h3>
                  </div>

                  <p className="text-black/70 mb-4">
                    Czy na pewno chcesz zbanować użytkownika <strong>{selectedReport?.sender_name}</strong>?
                    Użytkownik nie będzie mógł korzystać z platformy.
                  </p>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-black mb-2">
                      Powód bana (wymagane) *
                    </label>
                    <textarea
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#C44E35] resize-none"
                      rows={3}
                      placeholder="Np. Wielokrotne naruszanie regulaminu, spam, molestowanie..."
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-black/50 mt-1">
                      Ten powód będzie widoczny dla użytkownika
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowConfirmBan(false)
                        setBanReason('')
                      }}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-3 rounded-full border border-black/10 hover:bg-black/5 transition-colors font-semibold text-black"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={handleBanUser}
                      disabled={isProcessing || !banReason.trim()}
                      className="flex-1 px-6 py-3 rounded-full bg-black hover:bg-black/80 text-white font-semibold transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Banowanie...' : 'Zbanuj'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="border-0 rounded-3xl bg-white p-12">
            <div className="text-center">
              <Eye className="w-12 h-12 text-black/30 mx-auto mb-4" />
              <p className="text-black/60">
                Wybierz zgłoszenie z listy, aby zobaczyć szczegóły
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
