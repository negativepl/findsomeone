'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Flag, Check, X, AlertTriangle, Trash2, Ban, Loader2, Eye, EyeOff } from 'lucide-react'
import { updatePostReportStatus, deletePost, deactivatePost, warnPostAuthor } from '@/lib/actions/admin-post-reports'
import { banUser } from '@/lib/actions/admin-reports'
import Link from 'next/link'

interface PostReport {
  report_id: string
  post_id: string
  post_title: string
  post_description: string
  post_status: string
  post_author_id: string
  post_author_name: string
  reporter_id: string
  reporter_name: string
  reason: string
  description: string | null
  status: string
  created_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  notes: string | null
}

interface PostReportsListProps {
  initialReports: PostReport[]
}

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  inappropriate: 'Treść niestosowna',
  scam: 'Oszustwo',
  misleading: 'Wprowadzające w błąd',
  duplicate: 'Duplikat',
  other: 'Inne',
}

export function PostReportsList({ initialReports }: PostReportsListProps) {
  const [reports, setReports] = useState<PostReport[]>(initialReports)
  const [selectedReport, setSelectedReport] = useState<PostReport | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionNotes, setActionNotes] = useState('')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showConfirmDeactivate, setShowConfirmDeactivate] = useState(false)
  const [showConfirmBan, setShowConfirmBan] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [showPostDescription, setShowPostDescription] = useState(false)

  const handleDismiss = async () => {
    if (!selectedReport) return
    setIsProcessing(true)

    try {
      await updatePostReportStatus(selectedReport.report_id, 'dismissed', actionNotes || 'Zgłoszenie nieuzasadnione')

      // Remove from list
      setReports(reports.filter(r => r.report_id !== selectedReport.report_id))
      setSelectedReport(null)
      setActionNotes('')
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
      await warnPostAuthor(
        selectedReport.post_author_id,
        selectedReport.post_id,
        selectedReport.report_id,
        actionNotes || 'Naruszenie regulaminu'
      )

      // Remove from list
      setReports(reports.filter(r => r.report_id !== selectedReport.report_id))
      setSelectedReport(null)
      setActionNotes('')
    } catch (error: any) {
      toast.error('Błąd', { description: error.message })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeactivate = async () => {
    if (!selectedReport) return
    setIsProcessing(true)

    try {
      await deactivatePost(
        selectedReport.post_id,
        selectedReport.report_id,
        actionNotes || 'Naruszenie regulaminu'
      )

      // Remove from list
      setReports(reports.filter(r => r.report_id !== selectedReport.report_id))
      setSelectedReport(null)
      setActionNotes('')
      setShowConfirmDeactivate(false)
    } catch (error: any) {
      toast.error('Błąd', { description: error.message })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeletePost = async () => {
    if (!selectedReport) return
    setIsProcessing(true)

    try {
      await deletePost(
        selectedReport.post_id,
        selectedReport.report_id,
        actionNotes || 'Naruszenie regulaminu'
      )

      // Remove from list
      setReports(reports.filter(r => r.report_id !== selectedReport.report_id))
      setSelectedReport(null)
      setActionNotes('')
      setShowConfirmDelete(false)
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
        selectedReport.post_author_id,
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
    } catch (error: any) {
      toast.error('Błąd', { description: error.message })
    } finally {
      setIsProcessing(false)
    }
  }

  if (reports.length === 0) {
    return (
      <Card className="border-0 rounded-3xl bg-card p-12">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
            <Check className="w-10 h-10 text-green-600" />
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
        <Card className="border-0 rounded-3xl bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {reports.map((report) => (
              <div
                key={report.report_id}
                className={`p-6 transition-colors cursor-pointer ${
                  selectedReport?.report_id === report.report_id
                    ? 'bg-[#C44E35]/10 border-l-4 border-l-[#C44E35]'
                    : 'hover:bg-[#F5F1E8]'
                }`}
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

                    {/* Post Title */}
                    <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-100">
                      <p className="text-xs font-medium text-blue-700 mb-1">Zgłoszone ogłoszenie</p>
                      <p className="text-sm font-semibold text-blue-900 line-clamp-2">{report.post_title}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* Reporter */}
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                        <p className="text-xs font-medium text-amber-700 mb-1">Zgłaszający</p>
                        <p className="text-sm font-semibold text-amber-900">{report.reporter_name}</p>
                      </div>

                      {/* Author */}
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                        <p className="text-xs font-medium text-purple-700 mb-1">Autor ogłoszenia</p>
                        <p className="text-sm font-semibold text-purple-900">{report.post_author_name}</p>
                      </div>
                    </div>

                    {/* Description if exists */}
                    {report.description && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-xs font-medium text-gray-700 mb-1">Dodatkowy opis</p>
                        <p className="text-sm text-gray-900 italic">"{report.description}"</p>
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
          <Card className="border-0 rounded-3xl bg-card p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <Flag className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground">
                  Szczegóły zgłoszenia
                </h2>
              </div>
            </div>

            {/* ID */}
            <div className="mb-6 pb-6 border-b border-border">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-1.5">ID zgłoszenia</p>
                <p className="text-xs font-mono text-gray-900 break-all leading-relaxed">
                  {selectedReport.report_id}
                </p>
              </div>
            </div>

            {/* Report Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Powód</label>
                <p className="text-foreground mt-1">
                  {REASON_LABELS[selectedReport.reason] || selectedReport.reason}
                </p>
              </div>

              {selectedReport.description && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Opis zgłoszenia</label>
                  <p className="text-foreground mt-1">{selectedReport.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-muted-foreground">Tytuł ogłoszenia</label>
                <p className="text-foreground mt-1">{selectedReport.post_title}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-muted-foreground">Opis ogłoszenia</label>
                  <button
                    onClick={() => setShowPostDescription(!showPostDescription)}
                    className="text-xs text-[#C44E35] hover:text-[#B33D2A] flex items-center gap-1"
                  >
                    {showPostDescription ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Ukryj
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        Pokaż
                      </>
                    )}
                  </button>
                </div>
                {showPostDescription && (
                  <div className="bg-muted rounded-2xl p-4 mt-1 max-h-48 overflow-y-auto">
                    <div
                      className="prose prose-sm max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: selectedReport.post_description }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground">Autor ogłoszenia</label>
                <p className="text-foreground mt-1">{selectedReport.post_author_name}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground">Zgłaszający</label>
                <p className="text-foreground mt-1">{selectedReport.reporter_name}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground">Data zgłoszenia</label>
                <p className="text-foreground mt-1">
                  {new Date(selectedReport.created_at).toLocaleString('pl-PL')}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground">Status ogłoszenia</label>
                <p className="text-foreground mt-1">
                  {selectedReport.post_status === 'active' ? 'Aktywne' :
                   selectedReport.post_status === 'closed' ? 'Zamknięte' :
                   selectedReport.post_status === 'completed' ? 'Ukończone' : selectedReport.post_status}
                </p>
              </div>

              <div>
                <Link
                  href={`/posts/${selectedReport.post_id}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm text-[#C44E35] hover:text-[#B33D2A] font-medium"
                >
                  Zobacz ogłoszenie
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-6 border-t border-border">
              <label className="text-sm font-semibold text-muted-foreground">Notatki (opcjonalnie)</label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-[#C44E35] resize-none"
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
                onClick={() => setShowConfirmDeactivate(true)}
                disabled={isProcessing || selectedReport.post_status === 'closed'}
                className="w-full px-4 py-3 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <EyeOff className="w-4 h-4" />
                Dezaktywuj ogłoszenie
              </button>

              <button
                onClick={() => setShowConfirmDelete(true)}
                disabled={isProcessing}
                className="w-full px-4 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Usuń ogłoszenie
              </button>

              <button
                onClick={() => setShowConfirmBan(true)}
                disabled={isProcessing}
                className="w-full px-4 py-3 rounded-full bg-black hover:bg-black/80 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Zbanuj autora ({selectedReport?.post_author_name})
              </button>
            </div>

            {/* Deactivate Confirmation Dialog */}
            {showConfirmDeactivate && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-card rounded-3xl max-w-md w-full p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                      <EyeOff className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Potwierdź dezaktywację</h3>
                  </div>

                  <p className="text-muted-foreground mb-6">
                    Czy na pewno chcesz dezaktywować to ogłoszenie? Ogłoszenie zostanie zamknięte i nie będzie widoczne publicznie.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmDeactivate(false)}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-3 rounded-full border border-border hover:bg-black/5 transition-colors font-semibold text-foreground"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={handleDeactivate}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-3 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Dezaktywacja...' : 'Dezaktywuj'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Dialog */}
            {showConfirmDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-card rounded-3xl max-w-md w-full p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Potwierdź usunięcie</h3>
                  </div>

                  <p className="text-muted-foreground mb-6">
                    Czy na pewno chcesz usunąć to ogłoszenie? Ta akcja jest <strong>nieodwracalna</strong> i zostanie zalogowana w systemie.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-3 rounded-full border border-border hover:bg-black/5 transition-colors font-semibold text-foreground"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={handleDeletePost}
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
                <div className="bg-card rounded-3xl max-w-md w-full p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center">
                      <Ban className="w-6 h-6 text-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Zbanuj użytkownika</h3>
                  </div>

                  <p className="text-muted-foreground mb-4">
                    Czy na pewno chcesz zbanować użytkownika <strong>{selectedReport?.post_author_name}</strong>?
                    Użytkownik nie będzie mógł korzystać z platformy.
                  </p>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Powód bana (wymagane) *
                    </label>
                    <textarea
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-[#C44E35] resize-none"
                      rows={3}
                      placeholder="Np. Wielokrotne naruszanie regulaminu, spam, oszustwo..."
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
                      className="flex-1 px-6 py-3 rounded-full border border-border hover:bg-black/5 transition-colors font-semibold text-foreground"
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
          <Card className="border-0 rounded-3xl bg-card p-12">
            <div className="text-center">
              <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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
