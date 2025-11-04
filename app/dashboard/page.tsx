import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { DashboardStatsCard } from '@/components/DashboardStatsCard'

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

  // Extract first name only for mobile
  const firstName = profile?.full_name?.split(' ')[0] || 'Użytkowniku'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavbarWithHide user={user} pageTitle={`Witaj, ${firstName}!`} />

      <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8 flex-1">
        {/* Header - Desktop only */}
        <div className="mb-8 hidden md:block">
          <h2 className="text-4xl font-bold mb-3 text-foreground">
            Witaj, {profile?.full_name || 'Użytkowniku'}!
          </h2>
          <p className="text-lg text-muted-foreground">
            Zarządzaj swoimi ogłoszeniami i sprawdź aktywność
          </p>
        </div>

        {/* Mobile: flat design */}
        <div className="md:hidden space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <DashboardStatsCard
              href="/dashboard/my-posts"
              title="Moje ogłoszenia"
              count={myPostsCount || 0}
              iconType="megaphone"
            />

            <DashboardStatsCard
              href="/dashboard/favorites"
              title="Ulubione"
              count={favoritesCount || 0}
              iconType="heart"
            />

            <DashboardStatsCard
              href="/dashboard/messages"
              title="Wiadomości"
              count={unreadMessagesCount || 0}
              iconType="messages"
            />

            <DashboardStatsCard
              href="/dashboard/profile"
              title="Twoja ocena"
              count={profile?.rating && profile.rating > 0 ? profile.rating.toFixed(1) : '-'}
              subtitle={
                profile?.total_reviews && profile.total_reviews > 0
                  ? `${profile.total_reviews} ${profile.total_reviews === 1 ? 'opinia' : 'opinii'}`
                  : undefined
              }
              iconType="review"
            />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">Szybkie akcje</h2>
            <div className="space-y-3">
              <Link href="/dashboard/my-posts/new" className="block">
                <Button className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-12 text-base">
                  Dodaj nowe ogłoszenie
                </Button>
              </Link>
              <Link href="/posts" className="block">
                <Button variant="outline" className="w-full rounded-full border border-border hover:bg-muted h-12 text-base bg-card text-foreground">
                  Przeglądaj ogłoszenia
                </Button>
              </Link>
            </div>
          </div>

          {/* Account Actions */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">Twoje konto</h2>
            <div className="space-y-3">
              <Link href="/dashboard/profile" className="block">
                <Button variant="outline" className="w-full rounded-full border border-border hover:bg-muted h-12 text-base bg-card text-foreground">
                  Edytuj profil
                </Button>
              </Link>
              <Link href="/dashboard/settings" className="block">
                <Button variant="outline" className="w-full rounded-full border border-border hover:bg-muted h-12 text-base bg-card text-foreground">
                  Ustawienia
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop: card design */}
        <div className="hidden md:block">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardStatsCard
              href="/dashboard/my-posts"
              title="Moje ogłoszenia"
              count={myPostsCount || 0}
              iconType="megaphone"
            />

            <DashboardStatsCard
              href="/dashboard/favorites"
              title="Ulubione"
              count={favoritesCount || 0}
              iconType="heart"
            />

            <DashboardStatsCard
              href="/dashboard/messages"
              title="Wiadomości"
              count={unreadMessagesCount || 0}
              iconType="messages"
            />

            <DashboardStatsCard
              href="/dashboard/profile"
              title="Twoja ocena"
              count={profile?.rating && profile.rating > 0 ? profile.rating.toFixed(1) : '-'}
              subtitle={
                profile?.total_reviews && profile.total_reviews > 0
                  ? `${profile.total_reviews} ${profile.total_reviews === 1 ? 'opinia' : 'opinii'}`
                  : undefined
              }
              iconType="review"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card className="border border-border rounded-3xl bg-card flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-foreground">Szybkie akcje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 mt-auto">
                <Link href="/dashboard/my-posts/new" className="block">
                  <Button className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-14 text-base">
                    Dodaj nowe ogłoszenie
                  </Button>
                </Link>
                <Link href="/posts" className="block">
                  <Button variant="outline" className="w-full rounded-full border border-border hover:bg-muted h-14 text-base bg-card text-foreground">
                    Przeglądaj ogłoszenia
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-3xl bg-card flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-foreground">Twoje konto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 mt-auto">
                <Link href="/dashboard/profile" className="block">
                  <Button variant="outline" className="w-full rounded-full border border-border hover:bg-muted h-14 text-base bg-card text-foreground">
                    Edytuj profil
                  </Button>
                </Link>
                <Link href="/dashboard/settings" className="block">
                  <Button variant="outline" className="w-full rounded-full border border-border hover:bg-muted h-14 text-base bg-card text-foreground">
                    Ustawienia
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
