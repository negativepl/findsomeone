import { createClient } from '@/lib/supabase/server'
import { PostReportsList } from '@/components/admin/PostReportsList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Zgłoszenia ogłoszeń - Panel Administratora",
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
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Zgłoszenia ogłoszeń</h1>
        <p className="text-black/60">
          Moderacja zgłoszonych ogłoszeń przez użytkowników
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Błąd ładowania zgłoszeń</h3>
          <p className="text-red-800">{error.message || 'Nieznany błąd'}</p>
          <pre className="mt-2 text-xs text-red-700 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
        </div>
      ) : (
        <PostReportsList initialReports={reports || []} />
      )}
    </>
  )
}
