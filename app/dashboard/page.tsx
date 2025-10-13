import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'

export const metadata = {
  title: "Moje konto - Przegląd",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's posts count
  const { count: myPostsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active')

  // Fetch user's favorites count
  const { count: favoritesCount } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Fetch unread messages count
  const { count: unreadMessagesCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, rating, total_reviews')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-20 md:pb-0">
      <NavbarWithHide user={user} pageTitle={`Witaj, ${profile?.full_name || 'Użytkowniku'}!`} />

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="mb-8 hidden md:block">
          <h2 className="text-2xl md:text-4xl font-bold mb-3 text-black">
            Witaj, {profile?.full_name || 'Użytkowniku'}!
          </h2>
          <p className="text-base md:text-lg text-black/60">
            Zarządzaj swoimi ogłoszeniami i sprawdź aktywność
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/dashboard/posts">
            <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1 min-h-[80px] flex flex-col justify-between">
                    <p className="text-sm text-black/60 mb-2">Moje ogłoszenia</p>
                    <p className="text-3xl font-bold text-black leading-none">{myPostsCount || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0 ml-4">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/favorites">
            <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1 min-h-[80px] flex flex-col justify-between">
                    <p className="text-sm text-black/60 mb-2">Ulubione</p>
                    <p className="text-3xl font-bold text-black leading-none">{favoritesCount || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0 ml-4">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/messages">
            <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1 min-h-[80px] flex flex-col justify-between">
                    <p className="text-sm text-black/60 mb-2">Wiadomości</p>
                    <p className="text-3xl font-bold text-black leading-none">{unreadMessagesCount || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0 ml-4">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/profile">
            <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1 min-h-[80px] flex flex-col justify-between">
                    <p className="text-sm text-black/60 mb-2">Twoja ocena</p>
                    <div>
                      <p className="text-3xl font-bold text-black leading-none">
                        {profile?.rating && profile.rating > 0 ? profile.rating.toFixed(1) : '-'}
                      </p>
                      {profile?.total_reviews && profile.total_reviews > 0 && (
                        <p className="text-xs text-black/60 mt-1">
                          {profile.total_reviews} {profile.total_reviews === 1 ? 'opinia' : 'opinii'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0 ml-4">
                    <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 rounded-3xl bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-black">Szybkie akcje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/posts/new" className="block">
                <Button className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-14 text-base">
                  Dodaj nowe ogłoszenie
                </Button>
              </Link>
              <Link href="/posts" className="block">
                <Button variant="outline" className="w-full rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 h-14 text-base">
                  Przeglądaj ogłoszenia
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 rounded-3xl bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-black">Twoje konto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/profile" className="block">
                <Button variant="outline" className="w-full rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 h-14 text-base">
                  Edytuj profil
                </Button>
              </Link>
              <Link href="/dashboard/settings" className="block">
                <Button variant="outline" className="w-full rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 h-14 text-base">
                  Ustawienia
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
