import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { FavoriteButton } from '@/components/FavoriteButton'
import { ViewCounter } from './ViewCounter'
import { SendMessageModal } from '@/components/SendMessageModal'
import { ReviewModalWrapper } from './ReviewModalWrapper'
import { PhoneNumber } from './PhoneNumber'

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch post details
  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        avatar_url,
        rating,
        total_reviews,
        city,
        bio,
        phone,
        created_at
      ),
      categories (
        name,
        slug
      )
    `)
    .eq('id', id)
    .single()

  if (!post) {
    notFound()
  }

  // Check if user is online (last_seen within 5 minutes)
  const { data: userPresence } = await supabase
    .from('user_presence')
    .select('status, last_seen')
    .eq('user_id', post.user_id)
    .single()

  // Calculate if user is online based on last_seen time
  const lastSeenTime = userPresence?.last_seen ? new Date(userPresence.last_seen).getTime() : null
  const isOnline = lastSeenTime !== null && lastSeenTime > Date.now() - 5 * 60 * 1000

  // Calculate time since last activity
  const getLastActiveText = (lastSeen: string | null, online: boolean) => {
    if (!lastSeen) return 'Nigdy nie był aktywny'
    if (online) return 'Aktywny teraz'

    const now = Date.now()
    const lastSeenTime = new Date(lastSeen).getTime()
    const diffMinutes = Math.floor((now - lastSeenTime) / (1000 * 60))

    if (diffMinutes < 60) return `${diffMinutes} min temu`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} godz. temu`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Wczoraj'
    if (diffDays < 7) return `${diffDays} dni temu`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tyg. temu`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mies. temu`

    return `${Math.floor(diffDays / 365)} lat temu`
  }

  const lastActiveText = getLastActiveText(userPresence?.last_seen || null, isOnline)

  // Calculate days on platform
  const daysOnPlatform = post.profiles?.created_at
    ? Math.floor((Date.now() - new Date(post.profiles.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Check if current user already reviewed this post's author
  let hasReviewed = false
  if (user && user.id !== post.user_id) {
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', user.id)
      .eq('reviewed_id', post.user_id)
      .eq('post_id', id)
      .single()

    hasReviewed = !!existingReview
  }

  // Check if this post is in user's favorites
  let isFavorite = false
  if (user) {
    const { data: favoriteData } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', id)
      .single()

    isFavorite = !!favoriteData
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <ViewCounter postId={post.id} userId={user?.id} postAuthorId={post.user_id} />
      <NavbarWithHide user={user} />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Post Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Card */}
            <Card className="border-0 rounded-3xl bg-white shadow-sm">
              <CardContent className="p-0">
                {/* Header Section with Badges and Title */}
                <div className="p-8 pb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className={`rounded-full px-4 py-1.5 ${
                          post.type === 'seeking'
                            ? 'bg-[#C44E35] text-white border-0'
                            : 'bg-black text-white border-0'
                        }`}
                      >
                        {post.type === 'seeking' ? 'Szukam' : 'Oferuję'}
                      </Badge>
                      {post.categories && (
                        <Badge variant="outline" className="rounded-full border-black/10 text-black/60 px-4 py-1.5">
                          {post.categories.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <FavoriteButton
                        postId={post.id}
                        initialIsFavorite={isFavorite}
                        showLabel={false}
                      />
                    </div>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-black mb-4 leading-tight">{post.title}</h1>

                  {/* Location & Meta in Header */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-black/60">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{post.city}{post.district && `, ${post.district}`}</span>
                    </div>
                    <span className="text-black/30">•</span>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{post.views || 0} wyświetleń</span>
                    </div>
                    <span className="text-black/30">•</span>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        {new Date(post.created_at).toLocaleDateString('pl-PL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })},{' '}
                        {new Date(post.created_at).toLocaleTimeString('pl-PL', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Images Gallery */}
                {post.images && post.images.length > 0 && (
                  <div className="px-8 pb-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {post.images.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden bg-black/5">
                          <Image
                            src={image}
                            alt={`${post.title} - zdjęcie ${index + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description Section */}
                <div className="px-8 pb-6">
                  <h3 className="text-lg font-semibold text-black mb-3">Opis</h3>
                  <div
                    className="prose prose-sm max-w-none text-black/70 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.description }}
                  />
                </div>

                {/* Budget Section */}
                {(post.price_min || post.price_max) && (
                  <div className="px-8 pb-8">
                    <div className="border-t border-black/5 pt-6">
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-sm font-semibold text-black/60 uppercase tracking-wide">Budżet</h3>
                        <div className="flex-1 flex items-baseline gap-2 flex-wrap">
                          <span className="text-2xl font-bold text-black">
                            {post.price_min && post.price_max
                              ? `${post.price_min} - ${post.price_max} zł`
                              : post.price_min
                              ? `od ${post.price_min} zł`
                              : `do ${post.price_max} zł`}
                          </span>
                          {post.price_type && (
                            <span className="text-sm text-black/50">
                              {post.price_type === 'hourly'
                                ? '/ za godzinę'
                                : post.price_type === 'fixed'
                                ? '/ stała cena'
                                : '/ do negocjacji'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Author Info & Contact */}
          <div className="space-y-6">
            {/* Author Card */}
            <Card className="border-0 rounded-3xl bg-white sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    {post.profiles?.avatar_url ? (
                      <Image
                        src={post.profiles.avatar_url}
                        alt={post.profiles.full_name || 'User'}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center">
                        <span className="text-2xl font-semibold text-black">
                          {post.profiles?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    {/* Online Status Indicator */}
                    <div
                      className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${
                        isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                      title={isOnline ? 'Online' : 'Offline'}
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-black">
                      {post.profiles?.full_name || 'Anonymous'}
                    </h4>
                    {post.profiles?.rating > 0 && post.profiles?.total_reviews > 0 && (
                      <div className="flex items-center gap-1 text-black/60">
                        <span className="text-[#C44E35]">★</span>
                        <span className="font-semibold">{post.profiles.rating.toFixed(1)}</span>
                        <span className="text-sm">({post.profiles.total_reviews} opinii)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Member Since Info */}
                <div className="mb-10 pb-6 border-b border-black/5">
                  <div className="flex items-center gap-2 text-sm text-black/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      Na platformie od{' '}
                      {daysOnPlatform === 0
                        ? 'dzisiaj'
                        : daysOnPlatform === 1
                        ? '1 dnia'
                        : daysOnPlatform < 31
                        ? `${daysOnPlatform} dni`
                        : daysOnPlatform < 365
                        ? `${Math.floor(daysOnPlatform / 30)} miesięcy`
                        : `${Math.floor(daysOnPlatform / 365)} lat`}
                    </span>
                  </div>
                  {/* Activity Status */}
                  <div className={`flex items-center gap-2 text-sm mt-2 ${
                    isOnline ? 'text-green-600' : 'text-black/50'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`} />
                    <span className="font-medium">{lastActiveText}</span>
                  </div>
                </div>

                {post.profiles?.bio && (
                  <p className="text-sm text-black/70 mb-4 leading-relaxed">
                    {post.profiles.bio}
                  </p>
                )}

                {/* Contact Buttons */}
                {user && user.id !== post.user_id ? (
                  <div className="space-y-3">
                    <SendMessageModal
                      postId={post.id}
                      receiverId={post.user_id}
                      receiverName={post.profiles?.full_name || 'użytkownika'}
                      postTitle={post.title}
                    />
                    {/* Phone number if available */}
                    {post.profiles?.phone && (
                      <PhoneNumber phone={post.profiles.phone} />
                    )}
                    {/* Show review button if post is completed and user hasn't reviewed yet */}
                    {post.status === 'completed' && !hasReviewed && (
                      <ReviewModalWrapper
                        reviewedUserId={post.user_id}
                        reviewedUserName={post.profiles?.full_name || 'użytkownika'}
                        postId={post.id}
                      />
                    )}
                  </div>
                ) : !user ? (
                  <Link href="/login">
                    <Button className="w-full rounded-full bg-black hover:bg-black/80 text-white border-0 py-6 text-lg">
                      Zaloguj się aby skontaktować
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="bg-black/5 rounded-2xl p-4 text-center">
                      <p className="text-sm text-black/60">To Twoje ogłoszenie</p>
                    </div>
                    <Link href={`/dashboard/posts/${post.id}/edit`}>
                      <Button className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 py-6 text-lg">
                        Edytuj ogłoszenie
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
