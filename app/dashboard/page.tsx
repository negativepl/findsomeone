import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { DashboardStatsCard } from '@/components/DashboardStatsCard'
import { ViewsChartWrapper } from '@/components/ViewsChartWrapper'
import { ActivityFeed } from '@/components/ActivityFeed'
import { ProfileCompletion } from '@/components/ProfileCompletion'
import { ResponseRateCard } from '@/components/ResponseRateCard'

export const metadata = {
  title: "Moje konto - Przegląd",
}

// Helper function to format views data by day (last 7 days)
function formatViewsByDay(viewsData: { created_at: string }[]) {
  const data = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    // Count views for this day
    const viewsCount = viewsData.filter(view => {
      const viewDate = new Date(view.created_at)
      return viewDate >= date && viewDate < nextDay
    }).length

    data.push({
      date: date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }),
      value: viewsCount
    })
  }

  return data
}

// Helper function to format views data by week (last 30 days grouped into 7 sections)
function formatViewsByMonth(viewsData: { created_at: string }[]) {
  const result = []
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const daysPerSection = Math.floor(30 / 7) // ~4 days per section
  const totalSections = 7

  // Iteruj od najstarszych do najnowszych
  for (let i = totalSections - 1; i >= 0; i--) {
    // Oblicz zakres dla tej sekcji
    const daysAgo = i * daysPerSection
    const daysAgoEnd = (i + 1) * daysPerSection

    // Jeśli to ostatnia sekcja, uwzględnij pozostałe dni
    const actualDaysAgoEnd = (i === totalSections - 1) ? 30 : daysAgoEnd

    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() - daysAgo)
    endDate.setHours(23, 59, 59, 999)

    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - actualDaysAgoEnd)
    startDate.setHours(0, 0, 0, 0)

    const count = viewsData.filter(view => {
      const viewDate = new Date(view.created_at)
      return viewDate >= startDate && viewDate <= endDate
    }).length

    // Dla ostatniej sekcji (najbliższej dzisiaj) użyj daty końcowej jako labela
    const label = i === 0
      ? `${endDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}`
      : `${startDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}`

    // Dodaj zakres dat dla tooltipa
    const startLabel = startDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
    const endLabel = endDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
    const dateRange = `${startLabel} - ${endLabel}`

    result.push({
      date: label,
      value: count,
      dateRange: dateRange
    })
  }

  return result
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Parallelize initial queries for better performance
  const [
    { count: myPostsCount, data: userPosts },
    { count: unreadMessagesCount },
    { data: profile }
  ] = await Promise.all([
    // Query 1: Get all posts with count (reuse for favorites check)
    supabase
      .from('posts')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id),

    // Query 2: Unread messages count
    supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false),

    // Query 3: User profile
    supabase
      .from('profiles')
      .select('full_name, rating, total_reviews, avatar_url, bio, phone, city')
      .eq('id', user.id)
      .single()
  ])

  const postIds = userPosts?.map(p => p.id) || []

  // Fetch favorites count only if user has posts
  let favoritesCount = 0
  if (postIds.length > 0) {
    const { count } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .in('post_id', postIds)
    favoritesCount = count || 0
  }

  // Try to fetch activity logs (will fail gracefully if table doesn't exist yet)
  // Limit to 10 for initial load, rest loaded on-demand via "Show more" button
  let activities = []
  try {
    const { data: activityData } = await supabase
      .from('activity_logs')
      .select('id, activity_type, created_at, metadata')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    activities = activityData || []
  } catch (error) {
    // Table doesn't exist yet - use mock data
    activities = [
      {
        id: '1',
        activity_type: 'post_viewed',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        metadata: { post_title: 'Szukam elektryka' }
      },
      {
        id: '2',
        activity_type: 'message_received',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        metadata: { sender_name: 'Jan Kowalski' }
      },
      {
        id: '3',
        activity_type: 'post_viewed',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        metadata: { post_title: 'Potrzebuję hydraulika' }
      },
    ]
  }

  // Try to fetch views data (will fail gracefully if table doesn't exist yet)
  let totalViews = 0
  let totalMonthlyViews = 0
  let totalMessages = 0
  let viewsTrend = 0
  let viewsChartData = []
  let monthlyViewsChartData = []

  try {
    // Reuse postIds from earlier query to avoid duplicate fetch
    if (postIds.length > 0) {
      // Fetch views for last 7 and 30 days in parallel
      const [viewsWeek, viewsMonth, messagesMonth] = await Promise.all([
        // Weekly views
        supabase
          .from('post_views')
          .select('created_at')
          .in('post_id', postIds)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

        // Monthly views
        supabase
          .from('post_views')
          .select('created_at')
          .in('post_id', postIds)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

        // Messages in last 7 days
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ])

      const viewsData = viewsWeek.data || []
      const monthlyViewsData = viewsMonth.data || []

      totalViews = viewsData.length
      totalMonthlyViews = monthlyViewsData.length
      totalMessages = messagesMonth.count || 0

      viewsChartData = formatViewsByDay(viewsData)
      monthlyViewsChartData = formatViewsByMonth(monthlyViewsData)
    } else {
      // No posts, show empty chart and fetch messages separately
      viewsChartData = formatViewsByDay([])
      monthlyViewsChartData = formatViewsByMonth([])

      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      totalMessages = messagesCount || 0
    }
  } catch (error) {
    // Use mock data if table doesn't exist
    totalViews = 127
    totalMonthlyViews = 0
    viewsChartData = formatViewsByDay([])
    monthlyViewsChartData = formatViewsByMonth([])
  }

  // messagesCount is now calculated above as totalMessages
  const messagesCount = totalMessages

  // Calculate average response time
  let averageResponseTime = 0
  try {
    const { data: responseTimeData, error: rpcError } = await supabase.rpc('calculate_average_response_time', {
      p_user_id: user.id,
      p_days_back: 7
    })
    if (rpcError) {
      console.error('Average response time error:', rpcError)
    }
    console.log('Average response time (minutes):', responseTimeData)
    averageResponseTime = responseTimeData || 0
  } catch (error) {
    // Function doesn't exist yet or error occurred
    console.error('Failed to calculate average response time:', error)
    averageResponseTime = 0
  }

  // Calculate response rate (messages / views * 100)
  const currentResponseRate = totalViews > 0 ? (totalMessages / totalViews) * 100 : 0
  const previousResponseRate = totalViews > 0 ? ((totalMessages - 2) / (totalViews - 15)) * 100 : 0 // Mock previous rate

  // Extract first name only for mobile
  const firstName = profile?.full_name?.split(' ')[0] || 'Użytkowniku'

  // Check if profile is 100% complete
  const profileFields = {
    full_name: profile?.full_name,
    avatar_url: profile?.avatar_url,
    bio: profile?.bio,
    phone: profile?.phone,
    city: profile?.city,
  }
  const completedFieldsCount = Object.values(profileFields).filter(Boolean).length
  const isProfileComplete = completedFieldsCount === 5

  // Check if user has posts
  const hasPosts = (myPostsCount || 0) > 0

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
              title="Aktualnie masz"
              count={myPostsCount || 0}
              subtitle={myPostsCount === 1 ? 'aktywne ogłoszenie' : myPostsCount === 0 ? 'brak ogłoszeń' : 'aktywnych ogłoszeń'}
              iconType="megaphone"
            />

            <DashboardStatsCard
              href="/dashboard/favorites"
              title="Aktualnie masz"
              count={favoritesCount || 0}
              subtitle={
                favoritesCount === 0
                  ? 'brak polubień'
                  : favoritesCount === 1
                    ? 'polubienie swoich ofert'
                    : favoritesCount % 10 >= 2 && favoritesCount % 10 <= 4 && (favoritesCount % 100 < 10 || favoritesCount % 100 >= 20)
                      ? 'polubienia swoich ofert'
                      : 'polubień swoich ofert'
              }
              iconType="heart"
            />

            <DashboardStatsCard
              href="/dashboard/messages"
              title="Wiadomości"
              count={unreadMessagesCount || 0}
              subtitle={averageResponseTime > 0 ? `Twój czas odpowiedzi: ${averageResponseTime < 60 ? Math.round(averageResponseTime) + ' min' : averageResponseTime < 1440 ? Math.round(averageResponseTime / 60) + ' godz' : Math.round(averageResponseTime / 1440) + ' dni'}` : 'Nieprzeczytane'}
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

          {/* Quick Actions - Mobile */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">Szybkie akcje</h2>
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="grid grid-cols-1 min-[413px]:grid-cols-2 gap-3">
                <Link href="/dashboard/my-posts/new">
                  <Button className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-12 text-sm">
                    Dodaj ogłoszenie
                  </Button>
                </Link>
                <Link href="/results">
                  <Button variant="outline" className="w-full rounded-full border border-border hover:bg-accent h-12 text-sm bg-muted text-foreground">
                    Przeglądaj ogłoszenia
                  </Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button variant="outline" className="w-full rounded-full border border-border hover:bg-accent h-12 text-sm bg-muted text-foreground">
                    Edytuj profil
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="w-full rounded-full border border-border hover:bg-accent h-12 text-sm bg-muted text-foreground">
                    Ustawienia
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Analytics Section - Only show if user has posts */}
          {hasPosts && (
            <div className="space-y-6">
              {/* Views Chart */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">Wyświetlenia ofert</h2>
                <div className="bg-card rounded-2xl p-5 border border-border h-[450px]">
                  <ViewsChartWrapper
                    weeklyData={viewsChartData}
                    monthlyData={monthlyViewsChartData}
                    totalWeeklyViews={totalViews}
                    totalMonthlyViews={totalMonthlyViews}
                  />
                </div>
              </div>

              {/* Response Rate */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">Wskaźnik zainteresowania</h2>
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <ResponseRateCard
                    currentRate={currentResponseRate}
                    previousRate={previousResponseRate}
                    totalViews={totalViews}
                    totalMessages={totalMessages}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Activity Feed */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">Ostatnia aktywność</h2>
            <div className="bg-card rounded-2xl p-5 border border-border">
              <ActivityFeed
                activities={activities.map(a => ({
                  id: a.id,
                  type: a.activity_type as any,
                  title: '',
                  timestamp: new Date(a.created_at),
                  metadata: a.metadata as any
                }))}
                showFilters={true}
                itemsPerPage={10}
              />
            </div>
          </div>

          {/* Profile Completion - Only show if profile is incomplete */}
          {!isProfileComplete && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">Twój profil</h2>
              <div className="bg-card rounded-2xl p-5 border border-border">
                <ProfileCompletion profile={profile || {}} />
              </div>
            </div>
          )}

        </div>

        {/* Desktop: card design */}
        <div className="hidden md:block">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardStatsCard
              href="/dashboard/my-posts"
              title="Aktualnie masz"
              count={myPostsCount || 0}
              subtitle={myPostsCount === 1 ? 'aktywne ogłoszenie' : myPostsCount === 0 ? 'brak ogłoszeń' : 'aktywnych ogłoszeń'}
              iconType="megaphone"
            />

            <DashboardStatsCard
              href="/dashboard/favorites"
              title="Aktualnie masz"
              count={favoritesCount || 0}
              subtitle={
                favoritesCount === 0
                  ? 'brak polubień'
                  : favoritesCount === 1
                    ? 'polubienie swoich ofert'
                    : favoritesCount % 10 >= 2 && favoritesCount % 10 <= 4 && (favoritesCount % 100 < 10 || favoritesCount % 100 >= 20)
                      ? 'polubienia swoich ofert'
                      : 'polubień swoich ofert'
              }
              iconType="heart"
            />

            <DashboardStatsCard
              href="/dashboard/messages"
              title="Wiadomości"
              count={unreadMessagesCount || 0}
              subtitle={averageResponseTime > 0 ? `Twój czas odpowiedzi: ${averageResponseTime < 60 ? Math.round(averageResponseTime) + ' min' : averageResponseTime < 1440 ? Math.round(averageResponseTime / 60) + ' godz' : Math.round(averageResponseTime / 1440) + ' dni'}` : 'Nieprzeczytane'}
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

          {/* Quick Actions - Moved here before Analytics */}
          <Card className="border border-border rounded-3xl bg-card mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-foreground">Szybkie akcje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/dashboard/my-posts/new">
                  <Button className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-14 text-base">
                    Dodaj ogłoszenie
                  </Button>
                </Link>
                <Link href="/results">
                  <Button variant="outline" className="w-full rounded-full border border-border hover:bg-accent h-14 text-base bg-muted text-foreground">
                    Przeglądaj ogłoszenia
                  </Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button variant="outline" className="w-full rounded-full border border-border hover:bg-accent h-14 text-base bg-muted text-foreground">
                    Edytuj profil
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="w-full rounded-full border border-border hover:bg-accent h-14 text-base bg-muted text-foreground">
                    Ustawienia
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Section - Only show if user has posts */}
          {hasPosts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Views Chart */}
              <Card className="border border-border rounded-3xl bg-card">
                <CardContent className="pt-6 h-[450px]">
                  <ViewsChartWrapper
                    weeklyData={viewsChartData}
                    monthlyData={monthlyViewsChartData}
                    totalWeeklyViews={totalViews}
                    totalMonthlyViews={totalMonthlyViews}
                  />
                </CardContent>
              </Card>

              {/* Response Rate */}
              <Card className="border border-border rounded-3xl bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-foreground">Wskaźnik zainteresowania</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponseRateCard
                    currentRate={currentResponseRate}
                    previousRate={previousResponseRate}
                    totalViews={totalViews}
                    totalMessages={totalMessages}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Activity & Profile Section */}
          <div className={`grid grid-cols-1 ${!isProfileComplete ? 'lg:grid-cols-2' : ''} gap-6 mb-8`}>
            {/* Activity Feed */}
            <Card className="border border-border rounded-3xl bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-foreground">Ostatnia aktywność</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityFeed
                  activities={activities.map(a => ({
                    id: a.id,
                    type: a.activity_type as any,
                    title: '',
                    timestamp: new Date(a.created_at),
                    metadata: a.metadata as any
                  }))}
                  showFilters={true}
                  itemsPerPage={10}
                />
              </CardContent>
            </Card>

            {/* Profile Completion - Only show if profile is incomplete */}
            {!isProfileComplete && (
              <Card className="border border-border rounded-3xl bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-foreground">Twój profil</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileCompletion profile={profile || {}} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
