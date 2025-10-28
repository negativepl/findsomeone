import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { ContactForm } from '@/components/ContactForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Kontakt | FindSomeone - Skontaktuj się z nami",
  description: "Masz pytania? Skontaktuj się z zespołem FindSomeone. Pomożemy Ci z problemami technicznymi, pytaniami o platformę lub współpracą. Odpowiadamy w 24h.",
  openGraph: {
    title: "Kontakt | FindSomeone",
    description: "Skontaktuj się z zespołem FindSomeone. Jesteśmy tu aby pomóc!",
    type: "website",
    locale: "pl_PL",
  },
}

export default async function ContactPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <NavbarWithHide user={user} pageTitle="Kontakt" />

      <main className="container mx-auto px-4 md:px-6 py-2 md:py-4">
        <div className="mb-8 hidden md:block">
          <h1 className="text-2xl md:text-4xl font-bold text-black mb-3">Kontakt</h1>
          <p className="text-base md:text-lg text-black/60">
            Masz pytania? Chętnie pomożemy!
          </p>
        </div>

        <ContactForm userEmail={user?.email} />
      </main>

      <Footer />
    </div>
  )
}
