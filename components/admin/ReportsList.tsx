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
      <Card className="border bg-muted flex-1 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Check className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Brak zgłoszeń
          </h2>
          <p className="text-muted-foreground">
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
        <Card className="border bg-muted rounded-3xl overflow-hidden">
          <div className="divide-y divide-border">
            {reports.map((report) => (
              <div
                key={report.report_id}
                className={`p-6 transition-colors cursor-pointer relative ${
                  !report.is_read
                    ? 'bg-brand/5 hover:bg-brand/10 border-l-4 border-l-brand'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedReport(report)}
              >
                {/* Unread Badge */}
                {!report.is_read && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-semibold shadow-sm">
                      <Eye className="w-3.5 h-3.5" />
                      Nieodczytane - zostanie odnotowane w systemie audit trail
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      !report.is_read ? 'bg-brand/10' : 'bg-red-50'
                    }`}>
                      <Flag className={`w-6 h-6 ${
                        !report.is_read ? 'text-brand' : 'text-red-600'
                      }`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header with reason and date */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-foreground">
                            {REASON_LABELS[report.reason] || report.reason}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
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
                      <div className="bg-accent rounded-lg p-3 border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Zgłaszający</p>
                        <p className="text-sm font-semibold text-foreground">{report.reporter_name}</p>
                      </div>

                      {/* ID */}
                      <div className="bg-accent rounded-lg p-3 border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1">ID zgłoszenia</p>
                        <p className="text-xs font-mono text-foreground break-all leading-relaxed">{report.report_id}</p>
                      </div>
                    </div>

                    {/* Conversation participants */}
                    <div className="bg-muted rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Rozmowa między</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-foreground">{report.sender_name}</span>
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span className="font-semibold text-foreground">{report.receiver_name}</span>
                      </div>
                    </div>

                    {/* Description if exists */}
                    {report.description && (
                      <div className="bg-accent rounded-lg p-3 border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Dodatkowy opis</p>
                        <p className="text-sm text-foreground italic">"{report.description}"</p>
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
          <Card className="border bg-muted rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h2 className="text-2xl font-bold text-foreground">Szczegóły zgłoszenia</h2>
                <p className="text-sm font-medium text-foreground flex-shrink-0">
                  {new Date(selectedReport.created_at).toLocaleString('pl-PL')}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  {REASON_LABELS[selectedReport.reason] || selectedReport.reason}
                </p>
                <p className="text-xs text-muted-foreground font-mono flex-shrink-0">
                  {selectedReport.report_id}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Message Content - Most Important */}
              <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4">
                <label className="text-sm font-semibold text-destructive mb-2 block">Zgłoszona wiadomość</label>
                {isLoadingContent ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                    <span className="text-sm text-destructive/80">Ładowanie...</span>
                  </div>
                ) : (
                  <p className="text-destructive">{messageContent || 'Brak treści'}</p>
                )}
              </div>

              {/* People Involved */}
              <div className="grid grid-cols-3 gap-3">
                <div className="border border-border rounded-xl p-3">
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Nadawca</label>
                  <p className="text-sm font-medium text-foreground">{selectedReport.sender_name}</p>
                </div>
                <div className="border border-border rounded-xl p-3">
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Odbiorca</label>
                  <p className="text-sm font-medium text-foreground">{selectedReport.receiver_name}</p>
                </div>
                <div className="border border-border rounded-xl p-3">
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Zgłaszający</label>
                  <p className="text-sm font-medium text-foreground">{selectedReport.reporter_name}</p>
                </div>
              </div>

              {/* Description if exists */}
              {selectedReport.description && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-2">Dodatkowy opis</label>
                  <p className="text-sm text-foreground border border-border rounded-xl p-3">{selectedReport.description}</p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">Notatki (opcjonalnie)</label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-input focus:outline-none focus:border-ring resize-none bg-muted text-foreground"
                  rows={3}
                  placeholder="Dodaj notatki do zgłoszenia..."
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="px-6 py-4 border-t border-border bg-muted/50 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDismiss}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-full bg-accent border border-border hover:bg-accent/80 text-foreground font-medium transition-colors disabled:opacity-50 text-sm"
                >
                  Odrzuć
                </button>
                <button
                  onClick={handleWarning}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-full bg-accent border border-border hover:bg-accent/80 text-foreground font-medium transition-colors disabled:opacity-50 text-sm"
                >
                  Ostrzeż
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium transition-colors disabled:opacity-50 text-sm"
                >
                  Usuń wiadomość
                </button>

                <button
                  onClick={() => setShowConfirmBan(true)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium transition-colors disabled:opacity-50 text-sm"
                >
                  Zbanuj {selectedReport?.sender_name}
                </button>
              </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showConfirmDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-card rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Trash2 className="w-6 h-6 text-destructive" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Potwierdź usunięcie</h3>
                  </div>

                  <p className="text-muted-foreground mb-6">
                    Czy na pewno chcesz usunąć tę wiadomość? Ta akcja jest <strong>nieodwracalna</strong> i zostanie zalogowana w systemie.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-3 rounded-full border border-border hover:bg-accent transition-colors font-semibold text-foreground"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={handleDeleteMessage}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-3 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold transition-colors disabled:opacity-50"
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
                <div className="bg-card rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Ban className="w-6 h-6 text-destructive" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Zbanuj użytkownika</h3>
                  </div>

                  <p className="text-muted-foreground mb-4">
                    Czy na pewno chcesz zbanować użytkownika <strong>{selectedReport?.sender_name}</strong>?
                    Użytkownik nie będzie mógł korzystać z platformy.
                  </p>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Powód bana (wymagane) *
                    </label>
                    <textarea
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-input focus:outline-none focus:border-ring resize-none bg-muted text-foreground"
                      rows={3}
                      placeholder="Np. Wielokrotne naruszanie regulaminu, spam, molestowanie..."
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
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
                      className="flex-1 px-6 py-3 rounded-full border border-border hover:bg-accent transition-colors font-semibold text-foreground"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={handleBanUser}
                      disabled={isProcessing || !banReason.trim()}
                      className="flex-1 px-6 py-3 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Banowanie...' : 'Zbanuj'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="border bg-muted rounded-3xl p-12">
            <div className="text-center">
              <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Wybierz zgłoszenie z listy, aby zobaczyć szczegóły
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
