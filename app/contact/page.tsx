import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { ContactForm } from '@/components/ContactForm'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, LifeBuoy, Shield, AlertCircle, Lock, User } from 'lucide-react'
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
    <div className="min-h-screen bg-background">
      <NavbarWithHide user={user} pageTitle="Kontakt" />

      <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8">
        {/* Header - Desktop only */}
        <div className="mb-8 hidden md:block">
          <h1 className="text-4xl font-bold text-foreground mb-3">Kontakt</h1>
          <p className="text-lg text-muted-foreground">
            Masz pytania? Chętnie pomożemy!
          </p>
        </div>

        {/* Email Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-8">
          {/* Kontakt ogólny */}
          <a href="mailto:kontakt@findsomeone.app" className="block">
            <Card className="border border-border rounded-3xl bg-card hover:bg-muted/50 transition-all cursor-pointer h-full">
              <CardContent className="p-4 md:p-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 md:w-6 md:h-6 text-brand" />
                    </div>
                    <p className="text-base md:text-lg font-semibold text-foreground">Kontakt ogólny</p>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground break-all">
                    kontakt@findsomeone.app
                  </p>
                </div>
              </CardContent>
            </Card>
          </a>

          {/* Pomoc techniczna */}
          <a href="mailto:pomoc@findsomeone.app" className="block">
            <Card className="border border-border rounded-3xl bg-card hover:bg-muted/50 transition-all cursor-pointer h-full">
              <CardContent className="p-4 md:p-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <LifeBuoy className="w-5 h-5 md:w-6 md:h-6 text-brand" />
                    </div>
                    <p className="text-base md:text-lg font-semibold text-foreground">Pomoc techniczna</p>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground break-all">
                    pomoc@findsomeone.app
                  </p>
                </div>
              </CardContent>
            </Card>
          </a>

          {/* Sprawy moderacyjne */}
          <a href="mailto:moderacja@findsomeone.app" className="block">
            <Card className="border border-border rounded-3xl bg-card hover:bg-muted/50 transition-all cursor-pointer h-full">
              <CardContent className="p-4 md:p-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 md:w-6 md:h-6 text-brand" />
                    </div>
                    <p className="text-base md:text-lg font-semibold text-foreground">Sprawy moderacyjne</p>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground break-all">
                    moderacja@findsomeone.app
                  </p>
                </div>
              </CardContent>
            </Card>
          </a>

          {/* Reklamacje */}
          <a href="mailto:reklamacje@findsomeone.app" className="block">
            <Card className="border border-border rounded-3xl bg-card hover:bg-muted/50 transition-all cursor-pointer h-full">
              <CardContent className="p-4 md:p-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-brand" />
                    </div>
                    <p className="text-base md:text-lg font-semibold text-foreground">Reklamacje</p>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground break-all">
                    reklamacje@findsomeone.app
                  </p>
                </div>
              </CardContent>
            </Card>
          </a>

          {/* Sprawy RODO */}
          <a href="mailto:rodo@findsomeone.app" className="block">
            <Card className="border border-border rounded-3xl bg-card hover:bg-muted/50 transition-all cursor-pointer h-full">
              <CardContent className="p-4 md:p-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 md:w-6 md:h-6 text-brand" />
                    </div>
                    <p className="text-base md:text-lg font-semibold text-foreground">Sprawy RODO</p>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground break-all">
                    rodo@findsomeone.app
                  </p>
                </div>
              </CardContent>
            </Card>
          </a>

          {/* Kontakt bezpośredni */}
          <a href="mailto:mbaszewski@findsomeone.app" className="block">
            <Card className="border border-border rounded-3xl bg-card hover:bg-muted/50 transition-all cursor-pointer h-full">
              <CardContent className="p-4 md:p-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 md:w-6 md:h-6 text-brand" />
                    </div>
                    <p className="text-base md:text-lg font-semibold text-foreground">Kontakt bezpośredni</p>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground break-all">
                    mbaszewski@findsomeone.app
                  </p>
                </div>
              </CardContent>
            </Card>
          </a>
        </div>

        <ContactForm userEmail={user?.email} />
      </main>

      <Footer />
    </div>
  )
}
