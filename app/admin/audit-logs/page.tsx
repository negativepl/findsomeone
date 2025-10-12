import { createClient } from '@/lib/supabase/server'
import { AuditLogsList } from '@/components/admin/AuditLogsList'
import { Card, CardContent } from '@/components/ui/card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Audit Logs - Panel Administratora",
}

export default async function AdminAuditLogsPage() {
  const supabase = await createClient()

  // Get audit logs using the function
  const { data: auditLogs, error } = await supabase.rpc('get_admin_access_logs', {
    p_limit: 100,
    p_offset: 0
  })

  if (error) {
    console.error('Error fetching audit logs:', error)
  }

  // Get statistics
  const totalLogs = auditLogs?.length || 0
  const uniqueAdmins = new Set(auditLogs?.map((log: any) => log.admin_id) || []).size
  const logsWithReports = auditLogs?.filter((log: any) => log.report_id !== null).length || 0

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Audit Logs (RODO)</h1>
        <p className="text-black/60">
          Historia dostępów administratorów do wiadomości użytkowników
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 rounded-3xl bg-white shadow-sm">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">Łącznie logów</p>
                <div className="text-3xl font-bold text-black">{totalLogs}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-3xl bg-white shadow-sm">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">Unikalnych adminów</p>
                <div className="text-3xl font-bold text-black">{uniqueAdmins}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-3xl bg-white shadow-sm">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">Ze zgłoszeń</p>
                <div className="text-3xl font-bold text-black">{logsWithReports}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RODO Information */}
      <Card className="mb-6 border-0 rounded-3xl bg-white shadow-sm">
        <CardContent className="p-8">
          <h3 className="font-bold text-black mb-6 text-lg">Wymogi RODO</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/5 rounded-2xl p-5 text-sm text-black/80 leading-relaxed">
              Logi są przechowywane przez 2 lata zgodnie z wymogami RODO
            </div>
            <div className="bg-black/5 rounded-2xl p-5 text-sm text-black/80 leading-relaxed">
              Każdy dostęp administratora do wiadomości jest automatycznie rejestrowany
            </div>
            <div className="bg-black/5 rounded-2xl p-5 text-sm text-black/80 leading-relaxed">
              Użytkownicy mają prawo zażądać informacji o dostępach do swoich danych
            </div>
            <div className="bg-black/5 rounded-2xl p-5 text-sm text-black/80 leading-relaxed">
              Nieautoryzowany dostęp może skutkować karami do 20 mln EUR lub 4% obrotu
            </div>
          </div>
        </CardContent>
      </Card>

      <AuditLogsList initialLogs={auditLogs || []} />
    </>
  )
}
