import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { ModerationPanel } from '@/components/admin/ModerationPanel'

export default async function ModerationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !(await isAdmin(user.id))) {
    redirect('/login')
  }

  // Get counts for different statuses
  const { count: flaggedCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('moderation_status', 'flagged')

  const { count: pendingCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('moderation_status', 'pending')

  const { count: checkingCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('moderation_status', 'checking')

  const { count: rejectedCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('moderation_status', 'rejected')

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <NavbarWithHide user={user} showAddButton={false} />

      <main className="container mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-black mb-3">Moderacja ogłoszeń</h1>
          <p className="text-lg text-black/60">
            Przeglądaj i zarządzaj ogłoszeniami wymagającymi weryfikacji
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border-2 border-black/5">
            <div className="text-3xl font-bold text-[#C44E35]">{flaggedCount || 0}</div>
            <div className="text-sm text-black/60 mt-1">Wymagają sprawdzenia</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-black/5">
            <div className="text-3xl font-bold text-yellow-600">{checkingCount || 0}</div>
            <div className="text-sm text-black/60 mt-1">W trakcie sprawdzania</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-black/5">
            <div className="text-3xl font-bold text-blue-600">{pendingCount || 0}</div>
            <div className="text-sm text-black/60 mt-1">Oczekujące</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-black/5">
            <div className="text-3xl font-bold text-red-600">{rejectedCount || 0}</div>
            <div className="text-sm text-black/60 mt-1">Odrzucone</div>
          </div>
        </div>

        {/* Moderation Panel */}
        <ModerationPanel />
      </main>
    </div>
  )
}
