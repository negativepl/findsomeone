import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { MobileDock } from '@/components/MobileDock'
import { Metadata } from 'next'
import { AboutPageClient } from './AboutPageClient'

export const metadata: Metadata = {
  title: "O nas - FindSomeone",
  description: "Poznaj historię i misję FindSomeone - platformy łączącej ludzi lokalnie"
}

export default async function AboutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="relative h-screen overflow-hidden">
      <NavbarWithHide user={user} />
      <AboutPageClient />
      <MobileDock />
    </div>
  )
}
