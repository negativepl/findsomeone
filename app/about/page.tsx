import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "O nas | FindSomeone - Darmowa platforma lokalnej pomocy",
  description: "FindSomeone to darmowa polska platforma łącząca ludzi w okolicy. Pomoc przy zakupach, remoncie, sprzątaniu. Poznaj naszą misję budowania społeczności wzajemnej pomocy.",
  openGraph: {
    title: "O nas | FindSomeone",
    description: "Poznaj historię i misję FindSomeone - platformy łączącej ludzi lokalnie. Budujemy społeczność wzajemnej pomocy.",
    type: "website",
    locale: "pl_PL",
  },
}

export default async function AboutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <NavbarWithHide user={user} pageTitle="O nas" />
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <svg
              className="w-24 h-24 mx-auto text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Strona w budowie
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Pracujemy nad nową wersją strony "O nas". Wróć wkrótce, aby poznać naszą historię i misję!
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground font-medium transition-colors"
          >
            Wróć do strony głównej
          </a>
        </div>
      </main>
    </div>
  )
}
