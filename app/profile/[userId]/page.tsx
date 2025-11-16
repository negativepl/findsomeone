import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PhoneNumber } from '@/app/posts/[id]/PhoneNumber'
import { UserPostsList } from './UserPostsList'
import { UserBadge } from '@/components/ui/user-badge'
import { BannerSection } from './BannerSection'
import { StructuredData } from '@/components/StructuredData'
import { AI_BOT_USER_ID } from '@/lib/constants'

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const supabase = await createClient()
  const { userId } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Fetch reviews for this user
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:reviewer_id (
        full_name,
        avatar_url
      ),
      post:post_id (
        title
      )
    `)
    .eq('reviewed_id', userId)
    .order('created_at', { ascending: false })

  // Fetch user's active posts count
  const { count: totalActivePosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active').eq('moderation_status', 'approved')
    .eq('is_deleted', false)

  // Fetch user's active posts (limited to 6 for display)
  const { data: userPosts } = await supabase
    .from('posts')
    .select(`
      *,
      categories (
        name
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active').eq('moderation_status', 'approved')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch user presence data
  const { data: userPresence } = await supabase
    .from('user_presence')
    .select('status, last_seen')
    .eq('user_id', userId)
    .single()

  // Calculate if user is online based on last_seen time
  const lastSeenTime = userPresence?.last_seen ? new Date(userPresence.last_seen).getTime() : null
  const isOnline = lastSeenTime !== null && lastSeenTime > Date.now() - 5 * 60 * 1000

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Structured Data for SEO */}
      <StructuredData
        type="profile-with-reviews"
        personName={profile.full_name || undefined}
        personImage={profile.avatar_url || undefined}
        rating={profile.rating}
        totalReviews={profile.total_reviews}
        reviews={reviews || []}
      />

      <NavbarWithHide user={user} pageTitle={profile.full_name || 'Profil'} />

      <div className="container mx-auto px-6 pt-20 md:pt-24 pb-8 flex-1">
        {/* Profile Header */}
        <Card className="border border-border rounded-3xl bg-card shadow-sm mb-8 overflow-hidden">
          {/* Banner with Profile Info Overlay */}
          <div className="relative">
            {/* Banner Background */}
            {profile.banner_url && (
              <BannerSection
                bannerUrl={profile.banner_url}
                initialPosition={profile.banner_position ?? 50}
                initialScale={profile.banner_scale ?? 100}
                userId={userId}
                isOwnProfile={user?.id === userId}
              />
            )}

            {/* Blur layer - subtle, stronger at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none backdrop-blur-sm"
                 style={{
                   maskImage: 'linear-gradient(to top, black, transparent)',
                   WebkitMaskImage: 'linear-gradient(to top, black, transparent)'
                 }}
            />

            {/* Profile Info - Positioned at bottom of banner */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-3 md:p-6">
              <div className="flex flex-col md:flex-row gap-3 md:gap-6 items-center md:items-end">
                {/* Avatar */}
                <div className="flex-shrink-0 relative">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name || 'User'}
                      width={120}
                      height={120}
                      className="w-20 h-20 md:w-[120px] md:h-[120px] rounded-full border-4 border-white shadow-lg"
                      priority
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-[120px] md:h-[120px] rounded-full bg-muted flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-2xl md:text-4xl font-semibold text-foreground">
                        {profile.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}

                  {/* Online Status Indicator */}
                  <div
                    className={`absolute bottom-0 right-0 w-4 h-4 md:w-6 md:h-6 border-4 border-white rounded-full ${
                      isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    title={isOnline ? 'Online' : 'Offline'}
                  />

                  {/* Badges - stacked vertically on top right of avatar */}
                  <div className="absolute -top-1 -right-1 flex flex-col gap-1 z-10 scale-75 md:scale-100 origin-top-right">
                    {profile.verified && <UserBadge type="verified" />}
                    {profile.is_company && <UserBadge type="company" />}
                    {profile.is_ai_bot && <UserBadge type="ai_bot" />}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 w-full md:w-auto text-center md:text-left">
                  {/* Row 1: Name */}
                  <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 mb-1 md:mb-2">
                    <h1 className="text-xl md:text-3xl font-bold text-white leading-none drop-shadow-lg">
                      {profile.full_name || 'Anonim'}
                    </h1>
                  </div>

                  {/* Row 2: City */}
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2 md:mb-3">
                    {profile.city && (
                      <div className="flex items-center gap-1.5 text-white/90">
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs md:text-base">{profile.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Rating and Contact Buttons */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    {/* Rating */}
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      {profile.rating > 0 ? (
                        <>
                          <div className="flex items-center gap-1 text-lg md:text-2xl">
                            <span className="text-brand">★</span>
                            <span className="font-bold text-white">{profile.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-xs md:text-base text-white/80">
                            ({profile.total_reviews} {profile.total_reviews === 1 ? 'opinia' : 'opinii'})
                          </span>
                        </>
                      ) : (
                        <span className="text-xs md:text-base text-white/70 italic">Brak opinii</span>
                      )}
                    </div>

                    {/* Contact Buttons */}
                    {user && (
                      <div className="flex flex-row gap-2 w-full md:w-auto md:ml-auto">
                        {profile.phone && profile.show_phone !== false && (
                          <div className="flex-1 md:flex-initial md:w-auto [&_button]:!h-9 [&_button]:!py-0 [&_button]:!px-3 md:[&_button]:!px-4 [&_button]:!text-xs md:[&_button]:!text-sm [&_button]:!leading-normal [&_button]:!min-h-0 [&_button]:w-full md:[&_button]:w-auto [&_button]:!bg-muted [&_button]:hover:!bg-accent [&_button]:!text-foreground [&_button]:!border-border">
                            <PhoneNumber phone={profile.phone} postId={userId} disabled={user.id === userId} />
                          </div>
                        )}
                        {profile.show_messages !== false && userId !== AI_BOT_USER_ID && (
                          user.id === userId ? (
                            <Button
                              disabled
                              className="flex-1 md:flex-initial md:w-auto rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-9 py-0 px-3 md:px-4 text-xs md:text-sm leading-normal min-h-0 opacity-50 cursor-not-allowed"
                            >
                              Wyślij wiadomość
                            </Button>
                          ) : (
                            <Link href={`/dashboard/messages/${userId}`} className="flex-1 md:flex-initial md:w-auto">
                              <Button className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-9 py-0 px-3 md:px-4 text-xs md:text-sm leading-normal min-h-0">
                                Wyślij wiadomość
                              </Button>
                            </Link>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio - tylko jeśli istnieje */}
          {profile.bio && (
            <CardContent className="p-4 md:p-6">
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {profile.bio}
              </p>
            </CardContent>
          )}
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Reviews Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Opinie ({profile.total_reviews})
            </h2>

            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <Card key={review.id} className="border border-border rounded-3xl bg-card shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {review.reviewer?.avatar_url ? (
                            <Image
                              src={review.reviewer.avatar_url}
                              alt={review.reviewer.full_name || 'User'}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-sm font-semibold text-foreground">
                                {review.reviewer?.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground">
                              {review.reviewer?.full_name || 'Anonim'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString('pl-PL')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-brand">★</span>
                          <span className="font-semibold text-foreground">{review.rating}</span>
                        </div>
                      </div>

                      {review.post && (
                        <div className="mb-2">
                          <Link
                            href={`/posts/${review.post_id}`}
                            className="text-sm text-muted-foreground hover:text-foreground"
                          >
                            Dotyczy: {review.post.title}
                          </Link>
                        </div>
                      )}

                      {review.comment && (
                        <p className="text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-border rounded-3xl bg-card shadow-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Brak opinii</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Active Posts Section with Infinite Scroll */}
          <UserPostsList
            userId={userId}
            initialPosts={userPosts || []}
            totalCount={totalActivePosts || 0}
          />
        </div>
      </div>

      <Footer />
    </div>
  )
}
