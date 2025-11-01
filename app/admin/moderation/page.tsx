import { createClient } from '@/lib/supabase/server'
import { ModerationPanel } from '@/components/admin/ModerationPanel'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Moderacja ogłoszeń - Panel administracyjny",
}

export default async function ModerationPage() {
  const supabase = await createClient()

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

  // Get count for pending appeals
  const { count: appealsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('moderation_status', 'rejected')
    .in('appeal_status', ['pending', 'reviewing'])

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Moderacja ogłoszeń</h1>
        <p className="text-black/60">
          Przeglądaj i zarządzaj ogłoszeniami wymagającymi weryfikacji
        </p>
      </div>

      {/* Stats - Now clickable */}
      <ModerationPanel
        flaggedCount={flaggedCount || 0}
        checkingCount={checkingCount || 0}
        pendingCount={pendingCount || 0}
        rejectedCount={rejectedCount || 0}
        appealsCount={appealsCount || 0}
      />
    </>
  )
}
