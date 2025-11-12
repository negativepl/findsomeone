import { createClient } from '@/lib/supabase/server'
import { BannedUsersList } from '@/components/admin/BannedUsersList'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-xl border bg-card p-0 gap-0 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="h-20 flex flex-row items-center justify-between space-y-0 px-8 border-b flex-shrink-0">
          <div>
            <CardTitle className="text-base font-bold">Zbanowani użytkownicy</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Zarządzaj zbanowanymi użytkownikami - przeglądaj i odblokuj dostęp
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Łącznie zbanowanych
            </p>
            <p className="text-3xl font-bold text-red-600">
              {transformedUsers.length}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-1 overflow-y-auto flex flex-col bg-background">
          <BannedUsersList initialUsers={transformedUsers} />
        </CardContent>
      </Card>
    </div>
  )
}
