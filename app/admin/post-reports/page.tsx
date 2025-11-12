import { createClient } from '@/lib/supabase/server'
import { PostReportsList } from '@/components/admin/PostReportsList'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: "Zgłoszenia ogłoszeń - Panel administracyjny",
}

export default async function AdminPostReportsPage() {
  const supabase = await createClient()

  // Get reported posts using the function
  const { data: reports, error } = await supabase.rpc('get_reported_posts')

  if (error) {
    console.error('Error fetching post reports:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
  }

  return (
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-xl border bg-card p-0 gap-0 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="h-20 flex flex-row items-center justify-between space-y-0 px-8 border-b flex-shrink-0">
          <div>
            <CardTitle className="text-base font-bold">Zgłoszenia ogłoszeń</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Moderacja zgłoszonych ogłoszeń przez użytkowników
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
            <PostReportsList initialReports={reports || []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
