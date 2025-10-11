import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { getUserRole } from '@/lib/admin'
import { AuditLogsList } from '@/components/admin/AuditLogsList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Audit Logs - Panel Administratora",
}

export default async function AdminAuditLogsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const userRole = await getUserRole()
  if (userRole !== 'admin') {
    redirect('/dashboard')
  }

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
    <div className="min-h-screen bg-[#FAF8F3] pb-20 md:pb-0">
      <NavbarWithHide user={user} showAddButton={false} />

      <main className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-black mb-3">Audit Logs</h1>
              <p className="text-lg text-black/60">
                Historia dostępów administratorów do wiadomości użytkowników
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-2xl p-6 border-0">
              <div className="text-sm text-black/60 mb-1">Łącznie logów</div>
              <div className="text-3xl font-bold text-blue-600">{totalLogs}</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border-0">
              <div className="text-sm text-black/60 mb-1">Unikalnych adminów</div>
              <div className="text-3xl font-bold text-purple-600">{uniqueAdmins}</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border-0">
              <div className="text-sm text-black/60 mb-1">Ze zgłoszeń</div>
              <div className="text-3xl font-bold text-red-600">{logsWithReports}</div>
            </div>
          </div>

          {/* RODO Information */}
          <div className="mt-6 bg-amber-50 rounded-2xl p-6 border border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Wymogi RODO</h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Logi są przechowywane przez 2 lata zgodnie z wymogami RODO</li>
                  <li>• Każdy dostęp administratora do wiadomości jest automatycznie rejestrowany</li>
                  <li>• Użytkownicy mają prawo zażądać informacji o dostępach do swoich danych</li>
                  <li>• Nieautoryzowany dostęp może skutkować karami do 20 mln EUR lub 4% obrotu</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <AuditLogsList initialLogs={auditLogs || []} />
      </main>

      <Footer />
    </div>
  )
}
