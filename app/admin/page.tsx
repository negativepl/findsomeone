import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Panel administracyjny",
}

export default async function AdminPage() {
  const supabase = await createClient()

  // Get comprehensive statistics
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: activePosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('moderation_status', 'approved')

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalCategories } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })

  const { count: bannedUsersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('banned', true)

  const { count: reportsCount } = await supabase
    .from('message_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: postReportsCount } = await supabase
    .from('post_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: moderationCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('moderation_status', 'flagged')

  const { count: totalMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Panel administracyjny</h1>
        <p className="text-black/60">
          Witaj ponownie! Zarządzaj platformą FindSomeone
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 rounded-3xl bg-white shadow-sm">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">Aktywne ogłoszenia</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-black">{activePosts || 0}</div>
                  <p className="text-xs text-black/50">z {totalPosts || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-3xl bg-white shadow-sm">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">Użytkownicy</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-black">{totalUsers || 0}</div>
                  <p className="text-xs text-black/50">aktywnych</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-3xl bg-white shadow-sm">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">Kategorie</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-black">{totalCategories || 0}</div>
                  <p className="text-xs text-black/50">aktywnych</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-3xl bg-white shadow-sm">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">Wiadomości</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-black">{totalMessages || 0}</div>
                  <p className="text-xs text-black/50">wysłanych</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-black mb-4">Wymagają uwagi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {moderationCount && moderationCount > 0 ? (
            <Link href="/admin/moderation">
              <Card className="border-0 rounded-3xl bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-7 h-7 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black/70 mb-1">Moderacja</p>
                      <p className="text-3xl font-bold text-[#C44E35]">{moderationCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : null}

          {reportsCount && reportsCount > 0 ? (
            <Link href="/admin/reports">
              <Card className="border-0 rounded-3xl bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-7 h-7 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black/70 mb-1">Zgłoszenia wiadomości</p>
                      <p className="text-3xl font-bold text-[#C44E35]">{reportsCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : null}

          {postReportsCount && postReportsCount > 0 ? (
            <Link href="/admin/post-reports">
              <Card className="border-0 rounded-3xl bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-7 h-7 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black/70 mb-1">Zgłoszenia ogłoszeń</p>
                      <p className="text-3xl font-bold text-[#C44E35]">{postReportsCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : null}

          {bannedUsersCount && bannedUsersCount > 0 ? (
            <Link href="/admin/banned-users">
              <Card className="border-0 rounded-3xl bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-7 h-7 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black/70 mb-1">Zbanowani</p>
                      <p className="text-3xl font-bold text-[#C44E35]">{bannedUsersCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : null}

          {!moderationCount && !reportsCount && !postReportsCount && !bannedUsersCount && (
            <Card className="sm:col-span-3 border-0 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-black/70 font-medium">Wszystko wygląda dobrze! Brak zadań wymagających uwagi.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Management Sections */}
      <div>
        <h2 className="text-xl font-bold text-black mb-4">Zarządzanie</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/users">
            <Card className="border-0 rounded-3xl bg-white hover:shadow-lg transition-all cursor-pointer shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Użytkownicy</h3>
                    <p className="text-sm text-black/60">Weryfikacja i badges</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/categories">
            <Card className="border-0 rounded-3xl bg-white hover:shadow-lg transition-all cursor-pointer shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Kategorie</h3>
                    <p className="text-sm text-black/60">Zarządzaj kategoriami</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/posts">
            <Card className="border-0 rounded-3xl bg-white hover:shadow-lg transition-all cursor-pointer shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Ogłoszenia</h3>
                    <p className="text-sm text-black/60">Wszystkie ogłoszenia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/moderation">
            <Card className="border-0 rounded-3xl bg-white hover:shadow-lg transition-all cursor-pointer shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Moderacja</h3>
                    <p className="text-sm text-black/60">Weryfikacja ogłoszeń</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/banned-users">
            <Card className="border-0 rounded-3xl bg-white hover:shadow-lg transition-all cursor-pointer shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Zbanowani</h3>
                    <p className="text-sm text-black/60">Zbanowani użytkownicy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/synonyms">
            <Card className="border-0 rounded-3xl bg-white hover:shadow-lg transition-all cursor-pointer shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Synonymy</h3>
                    <p className="text-sm text-black/60">Wyszukiwanie</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/embeddings">
            <Card className="border-0 rounded-3xl bg-white hover:shadow-lg transition-all cursor-pointer shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">AI Embeddings</h3>
                    <p className="text-sm text-black/60">Wyszukiwanie AI</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/ai-settings">
            <Card className="border-0 rounded-3xl bg-white hover:shadow-lg transition-all cursor-pointer shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Ustawienia AI</h3>
                    <p className="text-sm text-black/60">Konfiguracja AI</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/audit-logs">
            <Card className="border-0 rounded-3xl bg-white hover:shadow-lg transition-all cursor-pointer shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Audit Logs</h3>
                    <p className="text-sm text-black/60">RODO & Dostęp</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/reports">
            <Card className="border-0 rounded-3xl bg-white hover:shadow-lg transition-all cursor-pointer shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Zgłoszenia wiadomości</h3>
                    <p className="text-sm text-black/60">Moderacja wiadomości</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/post-reports">
            <Card className="border-0 rounded-3xl bg-white hover:shadow-lg transition-all cursor-pointer shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Zgłoszenia ogłoszeń</h3>
                    <p className="text-sm text-black/60">Moderacja ogłoszeń</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/chat-assistant">
            <Card className="border-0 rounded-3xl bg-white hover:shadow-lg transition-all cursor-pointer shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Asystent czatu</h3>
                    <p className="text-sm text-black/60">AI Chat Helper</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/content-bot">
            <Card className="border-0 rounded-3xl bg-white hover:shadow-lg transition-all cursor-pointer shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Wypełniaczek</h3>
                    <p className="text-sm text-black/60">Generator ogłoszeń AI</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/page-builder">
            <Card className="border-0 rounded-3xl bg-white hover:shadow-lg transition-all cursor-pointer shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Page Builder</h3>
                    <p className="text-sm text-black/60">Kreator stron</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </>
  )
}
