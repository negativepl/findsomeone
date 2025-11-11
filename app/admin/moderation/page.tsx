import { createClient } from '@/lib/supabase/server'
import { ModerationPanel } from '@/components/admin/ModerationPanel'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-3xl border p-0 gap-0 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-8 py-4 border-b">
          <div>
            <CardTitle className="text-base font-bold">Moderacja ogłoszeń</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Przeglądaj i zarządzaj ogłoszeniami wymagającymi weryfikacji
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-1 overflow-y-auto flex flex-col">
          <ModerationPanel
            flaggedCount={flaggedCount || 0}
            checkingCount={checkingCount || 0}
            pendingCount={pendingCount || 0}
            rejectedCount={rejectedCount || 0}
            appealsCount={appealsCount || 0}
          />
        </CardContent>
      </Card>
    </div>
  )
}
