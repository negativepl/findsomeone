import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Footer } from '@/components/Footer'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { NewPostPageClient } from './NewPostPageClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Dodaj nowe ogłoszenie",
}

export default async function NewPostPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="h-screen bg-[#FAF8F3] md:min-h-screen md:h-auto overflow-hidden md:overflow-visible">
      <NavbarWithHide user={user} showAddButton={false} />
      <NewPostPageClient user={user} />
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  )
}
