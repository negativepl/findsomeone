import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { MobileDock } from '@/components/MobileDock'
import { Metadata } from 'next'
import { MyListingsClient } from './MyListingsClient'

export const metadata: Metadata = {
  title: "Moje ogłoszenia",
}

export default async function MyListingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      categories (
        name
      )
    `)
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
      <NavbarWithHide user={user} />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-10 pb-20 md:pb-10">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-black mb-3">Moje ogłoszenia</h2>
          <p className="text-lg text-black/60">
            Zarządzaj swoimi ogłoszeniami i sprawdzaj ich status
          </p>
        </div>

        {/* Client Component with Tabs and Posts */}
        <MyListingsClient posts={posts || []} />
      </main>

      <Footer />

      {/* Mobile Dock */}
      <MobileDock />
    </div>
  )
}
