import { createClient } from '@/lib/supabase/server'
import { ReportsList } from '@/components/admin/ReportsList'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: "Zgłoszenia wiadomości - Panel administracyjny",
}

export default async function AdminReportsPage() {
  const supabase = await createClient()

  // Get reported messages using the function
  const { data: reports, error } = await supabase.rpc('get_reported_messages')

  if (error) {
    console.error('Error fetching reports:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
  }

  return (
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-3xl border p-0 gap-0 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-8 py-4 border-b">
          <div>
            <CardTitle className="text-base font-bold">Zgłoszenia wiadomości</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Moderacja zgłoszonych wiadomości przez użytkowników
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-1 overflow-y-auto flex flex-col">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Błąd ładowania zgłoszeń</h3>
              <p className="text-red-800">{error.message || 'Nieznany błąd'}</p>
              <pre className="mt-2 text-xs text-red-700 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
            </div>
          ) : (
            <ReportsList initialReports={reports || []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
