import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Panel admina",
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = await isAdmin()
  if (!admin) {
    redirect('/dashboard')
  }

  // Get statistics for badges
  const { count: bannedUsersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('banned', true)

  const { count: reportsCount } = await supabase
    .from('message_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: synonymsCount } = await supabase
    .from('search_synonyms')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <NavbarWithHide user={user} showAddButton={false} />

      <main className="container mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-black mb-3">Panel administracyjny</h1>
          <p className="text-lg text-black/60">
            Zarządzaj platformą FindSomeone
          </p>
        </div>

        {/* Admin Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/categories">
            <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">Kategorie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/60">
                  Zarządzaj kategoriami ogłoszeń - dodawaj, edytuj i usuwaj kategorie
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/reports">
            <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Zgłoszenia wiadomości
                  {reportsCount && reportsCount > 0 ? (
                    <span className="text-xs font-semibold bg-[#C44E35]/10 text-[#C44E35] px-2 py-1 rounded-full">
                      {reportsCount}
                    </span>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/60">
                  Przeglądaj i moderuj zgłoszone przez użytkowników wiadomości
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/banned-users">
            <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Zbanowani użytkownicy
                  {bannedUsersCount && bannedUsersCount > 0 ? (
                    <span className="text-xs font-semibold bg-[#C44E35]/10 text-[#C44E35] px-2 py-1 rounded-full">
                      {bannedUsersCount}
                    </span>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/60">
                  Zarządzaj zbanowanymi użytkownikami - przeglądaj i odblokuj dostęp
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/audit-logs">
            <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">Audit Logs (RODO)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/60">
                  Historia dostępów administratorów do wiadomości użytkowników
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/synonyms">
            <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Synonymy wyszukiwania
                  {synonymsCount && synonymsCount > 0 ? (
                    <span className="text-xs font-semibold bg-[#C44E35]/10 text-[#C44E35] px-2 py-1 rounded-full">
                      {synonymsCount}
                    </span>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/60">
                  Zarządzaj synonymami dla wyszukiwarki - popraw jakość wyników
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/embeddings">
            <Card className="border-2 border-[#C44E35]/20 rounded-3xl bg-gradient-to-br from-[#C44E35]/5 to-white hover:bg-[#F5F1E8] transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  AI Embeddings
                  <span className="text-xs font-semibold bg-[#C44E35]/10 text-[#C44E35] px-2 py-1 rounded-full">
                    Nowe!
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/60">
                  Semantyczne wyszukiwanie i smart suggestions oparte na AI
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/ai-settings">
            <Card className="border-2 border-[#C44E35]/20 rounded-3xl bg-gradient-to-br from-[#C44E35]/5 to-white hover:bg-[#F5F1E8] transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Ustawienia AI
                  <span className="text-xs font-semibold bg-[#C44E35]/10 text-[#C44E35] px-2 py-1 rounded-full">
                    GPT-5
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/60">
                  Zarządzaj promptami, modelami i parametrami AI
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-0 rounded-3xl bg-white opacity-50">
            <CardHeader>
              <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <CardTitle className="text-xl">Użytkownicy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black/60">
                Zarządzaj użytkownikami platformy (wkrótce)
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 rounded-3xl bg-white opacity-50">
            <CardHeader>
              <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <CardTitle className="text-xl">Statystyki</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black/60">
                Zobacz szczegółowe statystyki platformy (wkrótce)
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
