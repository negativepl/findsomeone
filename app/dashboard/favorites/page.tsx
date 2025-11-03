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
    <div className="min-h-screen bg-background flex flex-col">
      <NavbarWithHide user={user} pageTitle="Ulubione" />

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8 flex-1">
        <div className="mb-8 hidden md:block">
          <h2 className="text-4xl font-bold mb-3 text-foreground">
            Ulubione ogłoszenia
          </h2>
          <p className="text-lg text-muted-foreground">
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
