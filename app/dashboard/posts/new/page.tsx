import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Footer } from '@/components/Footer'
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
    <div className="min-h-screen bg-[#FAF8F3] pb-20 md:pb-0">
      <NewPostPageClient user={user} />
      <Footer />
    </div>
  )
}
