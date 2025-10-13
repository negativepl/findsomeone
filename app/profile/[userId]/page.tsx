import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const supabase = await createClient()
  const { userId } = params

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

  // Fetch user's active posts
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
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-20 md:pb-0">
      <NavbarWithHide user={user} />

      <div className="container mx-auto px-6 py-12">
        {/* Profile Header */}
        <Card className="border-0 rounded-3xl bg-white shadow-sm mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
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
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-black mb-2">
                      {profile.full_name || 'Anonim'}
                    </h1>
                    {profile.city && (
                      <div className="flex items-center gap-2 text-black/60 mb-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {profile.city}
                      </div>
                    )}
                  </div>
                  {profile.verified && (
                    <Badge className="rounded-full bg-green-100 text-green-700 border-0">
                      Zweryfikowany
                    </Badge>
                  )}
                </div>

                {/* Rating */}
                {profile.rating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1 text-2xl">
                      <span className="text-[#C44E35]">★</span>
                      <span className="font-bold text-black">{profile.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-black/60">
                      ({profile.total_reviews} {profile.total_reviews === 1 ? 'opinia' : 'opinii'})
                    </span>
                  </div>
                )}

                {/* Bio */}
                {profile.bio && (
                  <p className="text-black/70 leading-relaxed mb-4">
                    {profile.bio}
                  </p>
                )}

                {/* Contact Button */}
                {user && user.id !== userId && (
                  <Link href={`/dashboard/messages?user=${userId}`}>
                    <Button className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0">
                      Wyślij wiadomość
                    </Button>
                  </Link>
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

          {/* Active Posts Section */}
          <div>
            <h2 className="text-2xl font-bold text-black mb-6">
              Aktywne ogłoszenia ({userPosts?.length || 0})
            </h2>

            {userPosts && userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map((post: any) => (
                  <Link key={post.id} href={`/posts/${post.id}`}>
                    <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all shadow-sm cursor-pointer">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge
                            className={`rounded-full px-3 py-1 ${
                              post.type === 'seeking'
                                ? 'bg-[#C44E35] text-white border-0'
                                : 'bg-black text-white border-0'
                            }`}
                          >
                            {post.type === 'seeking' ? 'Szukam' : 'Oferuję'}
                          </Badge>
                          {post.categories && (
                            <Badge variant="outline" className="rounded-full border-black/10 text-black/60">
                              {post.categories.name}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg font-bold text-black">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-6">
                        <div className="flex items-center gap-1 text-sm text-black/60">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {post.city}{post.district && `, ${post.district}`}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-0 rounded-3xl bg-white shadow-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-black/60">Brak aktywnych ogłoszeń</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
