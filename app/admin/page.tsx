import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Metadata } from 'next'
import { Check } from 'lucide-react'
import { getAdminAnalytics } from '@/lib/admin/analytics'
import { AdminAnalyticsChart } from '@/components/admin/AdminAnalyticsChart'

export const metadata: Metadata = {
  title: "Panel administracyjny",
}

export default async function AdminPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user?.id)
    .single()

  console.log('Admin page - User ID:', user?.id)
  console.log('Admin page - Profile data:', profile)

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

  // Get analytics data
  const analytics = await getAdminAnalytics()

  return (
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-xl border p-0 gap-0 flex-1 flex flex-col overflow-hidden bg-card">
        <CardHeader className="h-20 flex flex-row items-center justify-between space-y-0 px-8 border-b flex-shrink-0">
          <div>
            <CardTitle className="text-base font-bold">Panel administracyjny</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Witaj ponownie {profile?.full_name}!</p>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-1 overflow-y-auto flex flex-col gap-8 bg-background">

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        <Card className="border bg-card">
          <CardContent className="py-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Aktywne ogłoszenia</p>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground">{activePosts || 0}</div>
              <p className="text-xs text-muted-foreground">z {totalPosts || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardContent className="py-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Użytkownicy</p>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground">{totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">aktywnych</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardContent className="py-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Kategorie</p>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground">{totalCategories || 0}</div>
              <p className="text-xs text-muted-foreground">aktywnych</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardContent className="py-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Wiadomości</p>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground">{totalMessages || 0}</div>
              <p className="text-xs text-muted-foreground">wysłanych</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-shrink-0">
        <Card className="border bg-card">
          <CardContent className="p-0 h-[300px]">
            <AdminAnalyticsChart
              weeklyData={analytics.usersDaily}
              monthlyData={analytics.usersMonthly}
              totalWeeklyValue={analytics.totalUsersWeek}
              totalMonthlyValue={analytics.totalUsersMonth}
              title="Nowi użytkownicy"
              color="#3b82f6"
              tooltipSuffix="użytkowników"
            />
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardContent className="p-0 h-[300px]">
            <AdminAnalyticsChart
              weeklyData={analytics.postsDaily}
              monthlyData={analytics.postsMonthly}
              totalWeeklyValue={analytics.totalPostsWeek}
              totalMonthlyValue={analytics.totalPostsMonth}
              title="Nowe ogłoszenia"
              color="#f27361"
              tooltipSuffix="ogłoszeń"
            />
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardContent className="p-0 h-[300px]">
            <AdminAnalyticsChart
              weeklyData={analytics.messagesDaily}
              monthlyData={analytics.messagesMonthly}
              totalWeeklyValue={analytics.totalMessagesWeek}
              totalMonthlyValue={analytics.totalMessagesMonth}
              title="Nowe wiadomości"
              color="#10b981"
              tooltipSuffix="wiadomości"
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-xl font-bold text-foreground mb-4">Status zadań</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          {moderationCount && moderationCount > 0 ? (
            <Link href="/admin/moderation">
              <Card className="border bg-card hover:bg-accent/50 transition-all cursor-pointer">
                <CardContent className="py-6">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Moderacja</p>
                  <p className="text-3xl font-bold text-brand">{moderationCount}</p>
                </CardContent>
              </Card>
            </Link>
          ) : null}

          {reportsCount && reportsCount > 0 ? (
            <Link href="/admin/reports">
              <Card className="border bg-card hover:bg-accent/50 transition-all cursor-pointer">
                <CardContent className="py-6">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Zgłoszenia wiadomości</p>
                  <p className="text-3xl font-bold text-brand">{reportsCount}</p>
                </CardContent>
              </Card>
            </Link>
          ) : null}

          {postReportsCount && postReportsCount > 0 ? (
            <Link href="/admin/post-reports">
              <Card className="border bg-card hover:bg-accent/50 transition-all cursor-pointer">
                <CardContent className="py-6">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Zgłoszenia ogłoszeń</p>
                  <p className="text-3xl font-bold text-brand">{postReportsCount}</p>
                </CardContent>
              </Card>
            </Link>
          ) : null}

          {bannedUsersCount && bannedUsersCount > 0 ? (
            <Link href="/admin/banned-users">
              <Card className="border bg-card hover:bg-accent/50 transition-all cursor-pointer">
                <CardContent className="py-6">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Zbanowani</p>
                  <p className="text-3xl font-bold text-brand">{bannedUsersCount}</p>
                </CardContent>
              </Card>
            </Link>
          ) : null}

          {!moderationCount && !reportsCount && !postReportsCount && !bannedUsersCount && (
            <Card className="sm:col-span-3 border bg-card flex items-center justify-center">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <Check className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Wszystko wygląda dobrze!
                  </h2>
                  <p className="text-muted-foreground">
                    Brak zadań wymagających uwagi
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
        </CardContent>
      </Card>
    </div>
  )
}
