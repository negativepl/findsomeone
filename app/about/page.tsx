import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Metadata } from 'next'
import { AboutPageClient } from './AboutPageClient'

export const metadata: Metadata = {
  title: "O nas | FindSomeone - Darmowa platforma lokalnej pomocy",
  description: "FindSomeone to darmowa polska platforma łącząca ludzi w okolicy. Pomoc przy zakupach, remoncie, sprzątaniu. Poznaj naszą misję budowania społeczności wzajemnej pomocy.",
  openGraph: {
    title: "O nas | FindSomeone",
    description: "Poznaj historię i misję FindSomeone - platformy łączącej ludzi lokalnie. Budujemy społeczność wzajemnej pomocy.",
    type: "website",
    locale: "pl_PL",
  },
}

export default async function AboutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="relative h-screen overflow-hidden">
      <NavbarWithHide user={user} pageTitle="O nas" />
      <AboutPageClient />
    </div>
  )
}
