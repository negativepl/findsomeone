import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { UsersManager } from '@/components/admin/UsersManager'

export const metadata: Metadata = {
  title: "Zarządzanie użytkownikami - Panel admina",
}

export default async function UsersManagementPage() {
  const supabase = await createClient()

  // Fetch all users with their profiles
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Zarządzanie użytkownikami</h1>
        <p className="text-black/60">
          Zarządzaj weryfikacją, statusem firmy i innymi flagami użytkowników
        </p>
      </div>

      <UsersManager initialUsers={users || []} />
    </>
  )
}
