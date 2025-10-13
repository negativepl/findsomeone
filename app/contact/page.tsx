import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { ContactForm } from '@/components/ContactForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Kontakt - FindSomeone",
}

export default async function ContactPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-20 md:pb-0">
      <NavbarWithHide user={user} pageTitle="Kontakt" />

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-16">
        <div className="mb-10 hidden md:block">
          <h1 className="text-2xl md:text-4xl font-bold text-black mb-3">Kontakt</h1>
          <p className="text-lg text-black/60">
            Masz pytania? Chętnie pomożemy!
          </p>
        </div>

        <ContactForm userEmail={user?.email} />
      </main>

      <Footer />
    </div>
  )
}
