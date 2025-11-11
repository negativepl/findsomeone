import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { UsersManager } from '@/components/admin/UsersManager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: "Zarządzanie użytkownikami - Panel administracyjny",
}

export default async function UsersManagementPage() {
  const supabase = await createClient()

  // Fetch all users with their profiles
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-3xl border p-0 gap-0 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-8 py-4 border-b">
          <div>
            <CardTitle className="text-base font-bold">Zarządzanie użytkownikami</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Zarządzaj weryfikacją, statusem firmy i innymi flagami użytkowników
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-1 overflow-y-auto flex flex-col">
          <UsersManager initialUsers={users || []} />
        </CardContent>
      </Card>
    </div>
  )
}
