import { MobileDock } from './MobileDock'
import { User } from '@supabase/supabase-js'
import { getUserRole } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'

interface MobileDockWrapperProps {
  user: User | null
}

export async function MobileDockWrapper({ user }: MobileDockWrapperProps) {
  const userRole = user ? await getUserRole() : null
  const isAdmin = userRole === 'admin'

  // Fetch user profile if logged in
  let profile = null
  if (user) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url, full_name')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return <MobileDock user={user} profile={profile} isAdmin={isAdmin} />
}
