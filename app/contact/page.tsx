import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { MobileDock } from '@/components/MobileDock'
import { Card, CardContent } from '@/components/ui/card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Kontakt - FindSomeone",
}

export default async function ContactPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-20 md:pb-0">
      <NavbarWithHide user={user} />

      <main className="container mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-black mb-3">Kontakt</h1>
        <p className="text-lg text-black/60 mb-10">
          Masz pytania? Chętnie pomożemy!
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-0 rounded-3xl bg-white">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Email</h3>
                <p className="text-black/60 mb-4">
                  Napisz do nas, odpowiemy w ciągu 24h
                </p>
                <a href="mailto:kontakt@findsomeone.app" className="text-[#C44E35] font-medium hover:underline">
                  kontakt@findsomeone.app
                </a>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-3xl bg-white">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Pomoc techniczna</h3>
                <p className="text-black/60 mb-4">
                  Masz problem techniczny? Zgłoś go
                </p>
                <a href="mailto:pomoc@findsomeone.app" className="text-[#C44E35] font-medium hover:underline">
                  pomoc@findsomeone.app
                </a>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 rounded-3xl bg-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-black mb-6">Formularz kontaktowy</h2>
              <p className="text-black/60 mb-8">
                Funkcja formularza kontaktowego będzie dostępna wkrótce. W międzyczasie
                prosimy o kontakt mailowy.
              </p>

              <div className="space-y-4 opacity-50 pointer-events-none">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Twój email
                  </label>
                  <input
                    type="email"
                    disabled
                    className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-[#FAF8F3]"
                    placeholder="twoj@email.pl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Temat
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-[#FAF8F3]"
                    placeholder="W czym możemy pomóc?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Wiadomość
                  </label>
                  <textarea
                    disabled
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-[#FAF8F3]"
                    placeholder="Opisz swój problem lub pytanie..."
                  />
                </div>
                <button
                  disabled
                  className="w-full md:w-auto px-8 py-3 rounded-full bg-[#C44E35] text-white font-medium"
                >
                  Wyślij wiadomość
                </button>
              </div>
            </CardContent>
          </Card>
      </main>

      <Footer />
      <MobileDock />
    </div>
  )
}
