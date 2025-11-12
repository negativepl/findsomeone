import { createClient } from '@/lib/supabase/server'
import { AuditLogsList } from '@/components/admin/AuditLogsList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Audit Logs - Panel administracyjny",
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
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-xl border bg-card p-0 gap-0 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="h-20 flex flex-row items-center justify-between space-y-0 px-8 border-b flex-shrink-0">
          <div>
            <CardTitle className="text-base font-bold">Audit Logs (RODO)</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Historia dostępów administratorów do wiadomości użytkowników
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-1 overflow-y-auto flex flex-col">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 flex-shrink-0">
            <Card className="border bg-muted">
              <div className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">Łącznie logów</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-foreground">{totalLogs}</div>
                </div>
              </div>
            </Card>

            <Card className="border bg-muted">
              <div className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">Unikalnych adminów</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-foreground">{uniqueAdmins}</div>
                </div>
              </div>
            </Card>

            <Card className="border bg-muted">
              <div className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">Ze zgłoszeń</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-foreground">{logsWithReports}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* RODO Information */}
          <Card className="mb-6 border bg-muted">
            <CardContent className="p-8">
              <h3 className="font-bold text-foreground mb-6 text-lg">Wymogi RODO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-accent rounded-2xl p-5 text-sm text-foreground leading-relaxed">
                  Logi są przechowywane przez 2 lata zgodnie z wymogami RODO
                </div>
                <div className="bg-accent rounded-2xl p-5 text-sm text-foreground leading-relaxed">
                  Każdy dostęp administratora do wiadomości jest automatycznie rejestrowany
                </div>
                <div className="bg-accent rounded-2xl p-5 text-sm text-foreground leading-relaxed">
                  Użytkownicy mają prawo zażądać informacji o dostępach do swoich danych
                </div>
                <div className="bg-accent rounded-2xl p-5 text-sm text-foreground leading-relaxed">
                  Nieautoryzowany dostęp może skutkować karami do 20 mln EUR lub 4% obrotu
                </div>
              </div>
            </CardContent>
          </Card>

          <AuditLogsList initialLogs={auditLogs || []} />
        </CardContent>
      </Card>
    </div>
  )
}
