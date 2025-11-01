import { createClient } from '@/lib/supabase/server'
import { BannedUsersList } from '@/components/admin/BannedUsersList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Zbanowani użytkownicy - Panel administracyjny",
}

export default async function AdminBannedUsersPage() {
  const supabase = await createClient()

  // Get all banned users
  const { data: bannedUsers, error: bannedError } = await supabase
    .from('profiles')
    .select('id, full_name, email, banned_at, ban_reason, banned_by')
    .eq('banned', true)
    .order('banned_at', { ascending: false })

  if (bannedError) {
    console.error('Error fetching banned users:', bannedError)
  }

  // Get admin names for those who banned users
  const adminIds = bannedUsers?.map(u => u.banned_by).filter(Boolean) || []
  const { data: adminProfiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', adminIds)

  // Create a map of admin names
  const adminMap = new Map(adminProfiles?.map(a => [a.id, a.full_name]) || [])

  // Transform data to include banned_by_name
  const transformedUsers = bannedUsers?.map((user: any) => ({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    banned_at: user.banned_at,
    ban_reason: user.ban_reason,
    banned_by_name: adminMap.get(user.banned_by) || 'Nieznany administrator'
  })) || []

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Zbanowani użytkownicy</h1>
          <p className="text-black/60">
            Zarządzaj zbanowanymi użytkownikami - przeglądaj i odblokuj dostęp
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-black/60">
            Łącznie zbanowanych
          </p>
          <p className="text-3xl font-bold text-red-600">
            {transformedUsers.length}
          </p>
        </div>
      </div>

      <BannedUsersList initialUsers={transformedUsers} />
    </>
  )
}
