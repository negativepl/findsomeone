import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { getUserRole } from '@/lib/admin'
import { ReportsList } from '@/components/admin/ReportsList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Zgłoszenia wiadomości - Panel Administratora",
}

export default async function AdminReportsPage() {
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

  // Get reported messages using the function
  const { data: reports, error } = await supabase.rpc('get_reported_messages')

  if (error) {
    console.error('Error fetching reports:', error)
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-20 md:pb-0">
      <NavbarWithHide user={user} showAddButton={false} />

      <main className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black mb-3">Zgłoszenia wiadomości</h1>
            <p className="text-lg text-black/60">
              Moderacja zgłoszonych wiadomości przez użytkowników
            </p>
          </div>
        </div>

        <ReportsList initialReports={reports || []} />
      </main>

      <Footer />
    </div>
  )
}
