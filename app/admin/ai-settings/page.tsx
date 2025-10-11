import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/admin'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { AISettingsManager } from '@/components/admin/AISettingsManager'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Ustawienia AI - Panel admina",
}

export default async function AISettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userRole = await getUserRole()
  if (userRole !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch AI settings
  const { data: settings } = await supabase
    .from('ai_settings')
    .select('*')
    .single()

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <NavbarWithHide user={user} showAddButton={false} />

      <main className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Ustawienia AI</h1>
          <p className="text-black/60">
            Zarządzaj promptami, modelami i parametrami sztucznej inteligencji
          </p>
        </div>

        <AISettingsManager initialSettings={settings} />
      </main>

      <Footer />
    </div>
  )
}
