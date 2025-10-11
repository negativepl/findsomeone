'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Flag, Check, X, Eye, Trash2, AlertTriangle, Ban } from 'lucide-react'
import { updateReportStatus, deleteMessage, banUser } from '@/lib/actions/admin-reports'

interface Report {
  report_id: string
  message_id: string
  message_content: string
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
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionNotes, setActionNotes] = useState('')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showConfirmBan, setShowConfirmBan] = useState(false)
  const [banReason, setBanReason] = useState('')

  const handleDismiss = async () => {
    if (!selectedReport) return
    setIsProcessing(true)

    try {
      await updateReportStatus(selectedReport.report_id, 'dismissed', actionNotes || 'Zgłoszenie nieuzasadnione')

      // Remove from list
      setReports(reports.filter(r => r.report_id !== selectedReport.report_id))
      setSelectedReport(null)
      setActionNotes('')
    } catch (error: any) {
      alert('Błąd: ' + error.message)
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
    } catch (error: any) {
      alert('Błąd: ' + error.message)
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
    } catch (error: any) {
      alert('Błąd: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBanUser = async () => {
    if (!selectedReport || !banReason.trim()) {
      alert('Podaj powód bana')
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

      alert(result.message)

      // Remove from list
      setReports(reports.filter(r => r.report_id !== selectedReport.report_id))
      setSelectedReport(null)
      setActionNotes('')
      setBanReason('')
      setShowConfirmBan(false)
    } catch (error: any) {
      alert('Błąd: ' + error.message)
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
    <div className="grid lg:grid-cols-[1fr_400px] gap-6">
      {/* Reports List */}
      <div>
        <Card className="border-0 rounded-3xl bg-white overflow-hidden">
          <div className="divide-y divide-black/5">
            {reports.map((report) => (
              <div
                key={report.report_id}
                className="p-6 hover:bg-[#F5F1E8] transition-colors cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                      <Flag className="w-6 h-6 text-red-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          {REASON_LABELS[report.reason] || report.reason}
                        </h3>
                        <p className="text-sm text-black/60">
                          Zgłoszone przez: <strong>{report.reporter_name}</strong>
                        </p>
                      </div>
                      <span className="text-sm text-black/50 flex-shrink-0">
                        {new Date(report.created_at).toLocaleDateString('pl-PL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Message Preview */}
                    <div className="bg-black/5 rounded-2xl p-3 mb-2">
                      <p className="text-sm text-black/70 line-clamp-2">
                        {report.message_content}
                      </p>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center gap-4 text-sm text-black/60">
                      <span>
                        Od: <strong>{report.sender_name}</strong>
                      </span>
                      <span>→</span>
                      <span>
                        Do: <strong>{report.receiver_name}</strong>
                      </span>
                    </div>

                    {report.description && (
                      <p className="mt-2 text-sm text-black/70 italic">
                        "{report.description}"
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 text-black/40">
                    <Eye className="w-6 h-6" />
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
          <Card className="border-0 rounded-3xl bg-white p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <Flag className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black">
                  Szczegóły zgłoszenia
                </h2>
                <p className="text-sm text-black/60">
                  ID: {selectedReport.report_id.slice(0, 8)}...
                </p>
              </div>
            </div>

            {/* Report Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-semibold text-black/70">Powód</label>
                <p className="text-black mt-1">
                  {REASON_LABELS[selectedReport.reason] || selectedReport.reason}
                </p>
              </div>

              {selectedReport.description && (
                <div>
                  <label className="text-sm font-semibold text-black/70">Opis</label>
                  <p className="text-black mt-1">{selectedReport.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-black/70">Treść wiadomości</label>
                <div className="bg-black/5 rounded-2xl p-4 mt-1">
                  <p className="text-black">{selectedReport.message_content}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-black/70">Nadawca</label>
                <p className="text-black mt-1">{selectedReport.sender_name}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-black/70">Odbiorca</label>
                <p className="text-black mt-1">{selectedReport.receiver_name}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-black/70">Zgłaszający</label>
                <p className="text-black mt-1">{selectedReport.reporter_name}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-black/70">Data zgłoszenia</label>
                <p className="text-black mt-1">
                  {new Date(selectedReport.created_at).toLocaleString('pl-PL')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-6 border-t border-black/10">
              <label className="text-sm font-semibold text-black/70">Notatki (opcjonalnie)</label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#C44E35] resize-none"
                rows={3}
                placeholder="Dodaj notatki do zgłoszenia..."
                disabled={isProcessing}
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDismiss}
                  disabled={isProcessing}
                  className="px-4 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Odrzuć
                </button>

                <button
                  onClick={handleWarning}
                  disabled={isProcessing}
                  className="px-4 py-3 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Ostrzeż
                </button>
              </div>

              <button
                onClick={() => setShowConfirmDelete(true)}
                disabled={isProcessing}
                className="w-full px-4 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Usuń wiadomość
              </button>

              <button
                onClick={() => setShowConfirmBan(true)}
                disabled={isProcessing}
                className="w-full px-4 py-3 rounded-full bg-black hover:bg-black/80 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Zbanuj użytkownika ({selectedReport?.sender_name})
              </button>

              <p className="text-xs text-black/50 mt-2">
                <strong>Info:</strong> Wszystkie akcje są automatycznie logowane w systemie audit trail zgodnie z RODO.
              </p>
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
