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
    .eq('status', 'active')
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
    .eq('status', 'active')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
      <NavbarWithHide user={user} pageTitle={profile.full_name || 'Profil'} />

      <div className="container mx-auto px-6 pt-20 md:pt-24 pb-8 flex-1">
        {/* Profile Header */}
        <Card className="border-0 rounded-3xl bg-white shadow-sm mb-8 overflow-hidden">
          {/* Banner */}
          {profile.banner_url && (
            <BannerSection
              bannerUrl={profile.banner_url}
              initialPosition={profile.banner_position || 50}
              initialScale={profile.banner_scale || 100}
              userId={userId}
              isOwnProfile={user?.id === userId}
            />
          )}
          <CardContent className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
              {/* Avatar */}
              <div className="flex-shrink-0 relative">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User'}
                    width={120}
                    height={120}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] rounded-full bg-black/10 flex items-center justify-center">
                    <span className="text-4xl font-semibold text-black">
                      {profile.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}

                {/* Badges - stacked vertically on top right of avatar */}
                <div className="absolute -top-1 -right-1 flex flex-col gap-1 z-10">
                  {profile.verified && <UserBadge type="verified" />}
                  {profile.is_company && <UserBadge type="company" />}
                  {profile.is_ai_bot && <UserBadge type="ai_bot" />}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 w-full md:w-auto text-center md:text-left">
                {/* Row 1: Name */}
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-black leading-none">
                    {profile.full_name || 'Anonim'}
                  </h1>
                </div>

                {/* Row 2: City */}
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  {profile.city && (
                    <div className="flex items-center gap-2 text-black/60">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.city}
                    </div>
                  )}
                </div>

                {/* Row 3: Rating left, Contact Buttons right */}
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4">
                  {/* Rating */}
                  <div className="flex items-center justify-center gap-2">
                    {profile.rating > 0 ? (
                      <>
                        <div className="flex items-center gap-1 text-xl md:text-2xl">
                          <span className="text-[#C44E35]">★</span>
                          <span className="font-bold text-black">{profile.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm md:text-base text-black/60">
                          ({profile.total_reviews} {profile.total_reviews === 1 ? 'opinia' : 'opinii'})
                        </span>
                      </>
                    ) : (
                      <span className="text-sm md:text-base text-black/60 italic">Brak opinii</span>
                    )}
                  </div>

                  {/* Contact Buttons */}
                  {user && (
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto md:ml-auto">
                      {profile.phone && profile.show_phone !== false && (
                        <div className="w-full sm:w-auto [&_button]:!h-10 [&_button]:!py-0 [&_button]:!px-4 [&_button]:!text-sm [&_button]:!leading-normal [&_button]:!min-h-0 [&_button]:w-full [&_button]:sm:w-auto">
                          <PhoneNumber phone={profile.phone} postId={userId} disabled={user.id === userId} />
                        </div>
                      )}
                      {profile.show_messages !== false && userId !== AI_BOT_USER_ID && (
                        user.id === userId ? (
                          <Button
                            disabled
                            className="w-full sm:w-auto rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-10 py-0 px-4 text-sm leading-normal min-h-0 opacity-50 cursor-not-allowed"
                          >
                            Wyślij wiadomość
                          </Button>
                        ) : (
                          <Link href={`/dashboard/messages/${userId}`} className="w-full sm:w-auto">
                            <Button className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-10 py-0 px-4 text-sm leading-normal min-h-0">
                              Wyślij wiadomość
                            </Button>
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-black/70 leading-relaxed mt-4 text-sm md:text-base">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Reviews Section */}
          <div>
            <h2 className="text-2xl font-bold text-black mb-6">
              Opinie ({profile.total_reviews})
            </h2>

            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <Card key={review.id} className="border-0 rounded-3xl bg-white shadow-sm">
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
                            <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-black">
                                {review.reviewer?.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-black">
                              {review.reviewer?.full_name || 'Anonim'}
                            </p>
                            <p className="text-xs text-black/60">
                              {new Date(review.created_at).toLocaleDateString('pl-PL')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[#C44E35]">★</span>
                          <span className="font-semibold text-black">{review.rating}</span>
                        </div>
                      </div>

                      {review.post && (
                        <div className="mb-2">
                          <Link
                            href={`/posts/${review.post_id}`}
                            className="text-sm text-black/60 hover:text-black"
                          >
                            Dotyczy: {review.post.title}
                          </Link>
                        </div>
                      )}

                      {review.comment && (
                        <p className="text-black/70 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 rounded-3xl bg-white shadow-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-black/60">Brak opinii</p>
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
