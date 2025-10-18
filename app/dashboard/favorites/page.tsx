import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { FavoritesClient } from './FavoritesClient'

export const metadata: Metadata = {
  title: "Ulubione - Twoje zapisane ogłoszenia",
}

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
      <NavbarWithHide user={user} pageTitle="Ulubione" />

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-16 flex-1">
        <div className="mb-8 hidden md:block">
          <h2 className="text-2xl md:text-4xl font-bold mb-3 text-black">
            Ulubione ogłoszenia
          </h2>
          <p className="text-base md:text-lg text-black/60">
            Twoje zapisane ogłoszenia
          </p>
        </div>

        {/* Favorites List with React Query */}
        <FavoritesClient userId={user.id} />
      </main>

      <Footer />

      {/* Mobile Dock */}
    </div>
  )
}
