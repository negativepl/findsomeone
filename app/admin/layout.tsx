import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { AdminLayout } from '@/components/admin/AdminLayout'

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = await isAdmin()
  if (!admin) {
    redirect('/dashboard')
  }

  // Get user profile from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Get statistics for badges
  const { count: bannedUsersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('banned', true)

  const { count: reportsCount } = await supabase
    .from('message_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: synonymsCount } = await supabase
    .from('search_synonyms')
    .select('*', { count: 'exact', head: true })

  const { count: moderationCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('moderation_status', 'flagged')

  return (
    <AdminLayout
      user={user}
      profile={profile}
      stats={{
        reportsCount: reportsCount || 0,
        bannedUsersCount: bannedUsersCount || 0,
        moderationCount: moderationCount || 0,
        synonymsCount: synonymsCount || 0,
      }}
    >
      {children}
    </AdminLayout>
  )
}
