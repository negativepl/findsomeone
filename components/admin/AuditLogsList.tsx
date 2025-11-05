'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Eye, Shield, User, Calendar, AlertCircle } from 'lucide-react'

interface AuditLog {
  log_id: string
  admin_id: string
  admin_name: string
  admin_email: string
  message_id: string
  message_content: string
  message_sender_name: string
  message_receiver_name: string
  report_id: string | null
  reason: string
  accessed_at: string
}

interface AuditLogsListProps {
  initialLogs: AuditLog[]
}

export function AuditLogsList({ initialLogs }: AuditLogsListProps) {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  if (logs.length === 0) {
    return (
      <Card className="border border-border rounded-3xl bg-card p-12">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-50 flex items-center justify-center">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Brak logów dostępu
          </h2>
          <p className="text-muted-foreground">
            Żaden administrator nie przeglądał jeszcze wiadomości użytkowników.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid lg:grid-cols-[1fr_500px] gap-6">
      {/* Logs List */}
      <div>
        <Card className="border border-border rounded-3xl bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div
                key={log.log_id}
                className="p-6 hover:bg-[#F5F1E8] transition-colors cursor-pointer"
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {log.admin_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {log.admin_email}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground flex-shrink-0">
                        {new Date(log.accessed_at).toLocaleString('pl-PL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Reason */}
                    <div className="bg-blue-50 rounded-2xl p-3 mb-2">
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        Powód dostępu:
                      </p>
                      <p className="text-sm text-blue-700">
                        {log.reason}
                      </p>
                    </div>

                    {/* Conversation */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>
                        <strong>{log.message_sender_name}</strong> → <strong>{log.message_receiver_name}</strong>
                      </span>
                      {log.report_id && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          Ze zgłoszenia
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Details Panel */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        {selectedLog ? (
          <Card className="border border-border rounded-3xl bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Szczegóły dostępu
                </h2>
                <p className="text-sm text-black/60">
                  ID: {selectedLog.log_id.slice(0, 8)}...
                </p>
              </div>
            </div>

            {/* Log Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Administrator
                </label>
                <p className="text-foreground mt-1">{selectedLog.admin_name}</p>
                <p className="text-sm text-black/60 mt-1">{selectedLog.admin_email}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data dostępu
                </label>
                <p className="text-foreground mt-1">
                  {new Date(selectedLog.accessed_at).toLocaleString('pl-PL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Powód dostępu
                </label>
                <div className="bg-blue-50 rounded-2xl p-4 mt-1">
                  <p className="text-blue-900">{selectedLog.reason}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-black/70">Konwersacja</label>
                <p className="text-foreground mt-1">
                  <strong>{selectedLog.message_sender_name}</strong>
                  {' → '}
                  <strong>{selectedLog.message_receiver_name}</strong>
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-black/70">Treść wiadomości</label>
                <div className="bg-muted rounded-2xl p-4 mt-1">
                  <p className="text-foreground text-sm">{selectedLog.message_content}</p>
                </div>
              </div>

              {selectedLog.report_id && (
                <div>
                  <label className="text-sm font-semibold text-black/70 flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    Typ dostępu
                  </label>
                  <div className="px-3 py-2 bg-red-50 rounded-2xl inline-flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-red-700 font-semibold text-sm">
                      Dostęp ze zgłoszenia użytkownika
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* RODO Info */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="bg-amber-50 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">
                      Informacja RODO
                    </p>
                    <p className="text-xs text-amber-800">
                      Ten log jest przechowywany przez 2 lata zgodnie z wymogami RODO.
                      Użytkownicy mają prawo zażądać informacji o dostępach do swoich wiadomości.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="border border-border rounded-3xl bg-card p-12">
            <div className="text-center">
              <Eye className="w-12 h-12 text-black/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Wybierz log z listy, aby zobaczyć szczegóły
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
