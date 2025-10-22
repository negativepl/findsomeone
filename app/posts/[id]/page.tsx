import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Footer } from '@/components/Footer'
import { FavoriteButton } from '@/components/FavoriteButton'
import { RatingDisplay } from '@/components/RatingDisplay'
import { ViewCounter } from './ViewCounter'
import { SendMessageModal } from '@/components/SendMessageModal'
import { ReviewModalWrapper } from './ReviewModalWrapper'
import { PhoneNumber } from './PhoneNumber'
import { DistanceCard } from './DistanceCard'
import { ReportPostDialog } from '@/components/ReportPostDialog'
import { reportPost } from '@/lib/actions/report-post'
import { CopyablePostId } from './CopyablePostId'
import { ImageGallery } from './ImageGallery'
import { PostDetailClientWrapper } from './PostDetailClient'
import { MobileActionDock } from './MobileActionDock'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Metadata } from 'next'
import { AI_BOT_USER_ID } from '@/lib/constants'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        full_name
      ),
      categories (
        name
      )
    `)
    .eq('id', id)
    .single()

  if (!post) {
    return {
      title: 'Ogłoszenie nie znalezione',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findsomeone.app'
  const postUrl = `${baseUrl}/posts/${id}`

  // Create description from post content (strip HTML and limit length)
  const cleanDescription = post.description
    ?.replace(/<[^>]*>/g, '')
    .substring(0, 155) || post.title

  const priceText = post.price_min && post.price_max
    ? `${post.price_min}-${post.price_max} zł`
    : post.price_min
    ? `od ${post.price_min} zł`
    : post.price_max
    ? `do ${post.price_max} zł`
    : 'cena do uzgodnienia'

  const fullTitle = `${post.title} - ${post.city} | FindSomeone`
  const fullDescription = `${post.type === 'seeking' ? 'Szukam' : 'Oferuję'}: ${cleanDescription}. ${priceText}. Kontakt: ${post.profiles?.full_name || 'FindSomeone'}`

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: [
      post.title,
      post.categories?.name || '',
      post.city,
      post.district || '',
      post.type === 'seeking' ? 'szukam' : 'oferuję',
      'usługi lokalne',
      'ogłoszenia',
    ].filter(Boolean),
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: postUrl,
      siteName: 'FindSomeone',
      locale: 'pl_PL',
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      images: post.images && post.images.length > 0 ? [
        {
          url: post.images[0],
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: post.images && post.images.length > 0 ? [post.images[0]] : [],
    },
    alternates: {
      canonical: postUrl,
    },
  }
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    isAdmin = profile?.is_admin || false
  }

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
        created_at,
        show_phone,
        show_messages,
        show_profile_link
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

  // Fetch other posts from the same author
  const { data: otherPosts } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      type,
      city,
      district,
      price_min,
      price_max,
      price_type,
      images,
      views,
      created_at,
      categories (
        name
      )
    `)
    .eq('user_id', post.user_id)
    .eq('status', 'active')
    .eq('is_deleted', false)
    .neq('id', id)
    .order('created_at', { ascending: false })
    .limit(3)

  // Prepare JSON-LD structured data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findsomeone.app'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': post.type === 'offering' ? 'Service' : 'Demand',
    name: post.title,
    description: post.description?.replace(/<[^>]*>/g, '').substring(0, 200),
    provider: {
      '@type': 'Person',
      name: post.profiles?.full_name || 'Anonymous',
      ...(post.profiles?.rating && post.profiles.rating > 0 ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: post.profiles.rating.toString(),
          reviewCount: post.profiles.total_reviews || 0,
        }
      } : {}),
    },
    areaServed: {
      '@type': 'City',
      name: post.city,
      ...(post.district ? { containedInPlace: post.district } : {}),
    },
    ...(post.price_min || post.price_max ? {
      offers: {
        '@type': 'Offer',
        priceCurrency: 'PLN',
        ...(post.price_min && post.price_max ? {
          price: `${post.price_min}-${post.price_max}`,
        } : post.price_min ? {
          price: post.price_min,
        } : {
          price: post.price_max,
        }),
      }
    } : {}),
    ...(post.images && post.images.length > 0 ? {
      image: post.images,
    } : {}),
    url: `${baseUrl}/posts/${post.id}`,
    datePosted: post.created_at,
    ...(post.updated_at ? { dateModified: post.updated_at } : {}),
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ViewCounter postId={post.id} userId={user?.id} postAuthorId={post.user_id} />

      <NavbarWithHide user={user} showAddButton={true} />

      <PostDetailClientWrapper postTitle={post.title}>
        {/* Main Content */}
        <main className="container mx-auto px-4 md:px-6 py-4 md:py-16 mb-[72px] md:mb-0">
        {/* Breadcrumbs */}
        <div className="hidden md:block">
          <Breadcrumbs
            items={[
              { label: 'Strona główna', href: '/' },
              { label: 'Ogłoszenia', href: '/posts' },
              {
                label: post.categories?.name || 'Kategoria',
                href: post.categories?.slug ? `/posts?category=${post.categories.slug}` : undefined
              },
              { label: post.title }
            ]}
          />
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column - Post Details */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Main Card */}
            <Card className="border-0 rounded-2xl md:rounded-3xl bg-white shadow-sm">
              <CardContent className="p-0">
                {/* Images Gallery */}
                {post.images && post.images.length > 0 && (
                  <div className="px-4 md:px-8 pt-4 md:pt-6 pb-0 md:pb-6">
                    <ImageGallery
                      images={post.images}
                      title={post.title}
                      favoriteButton={
                        <FavoriteButton
                          postId={post.id}
                          initialIsFavorite={isFavorite}
                          showLabel={false}
                        />
                      }
                    />
                  </div>
                )}

                {/* Date and Price - Mobile Only */}
                <div className="lg:hidden px-4 pt-4 pb-2 space-y-2">
                  <div className="text-xs text-black/60">
                    Dodano {new Date(post.created_at).toLocaleDateString('pl-PL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>

                  {(post.price_min || post.price_max) && (
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl font-bold text-black">
                        {post.price_min && post.price_max
                          ? `${post.price_min} - ${post.price_max} zł`
                          : post.price_min
                          ? `od ${post.price_min} zł`
                          : `do ${post.price_max} zł`}
                      </span>
                      {post.price_type && (
                        <span className="text-sm text-black/60">
                          {post.price_type === 'hourly'
                            ? '/ za godzinę'
                            : post.price_type === 'fixed'
                            ? '/ stała cena'
                            : '/ do negocjacji'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Badges Section - Above Description */}
                <div className="px-4 md:px-8 pt-2 md:pt-0 pb-3 md:pb-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      className={`rounded-full px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm ${
                        post.type === 'seeking'
                          ? 'bg-[#C44E35] text-white border-0'
                          : 'bg-black text-white border-0'
                      }`}
                    >
                      {post.type === 'seeking' ? 'Szukam' : 'Oferuję'}
                    </Badge>
                    {post.categories && (
                      <Badge variant="outline" className="rounded-full border-black/10 text-black/60 px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm">
                        {post.categories.name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Description Section */}
                <div className="px-4 md:px-8 pb-4 md:pb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">Opis</h2>
                  <div
                    className="prose prose-sm max-w-none text-black/70 leading-relaxed text-sm md:text-base"
                    dangerouslySetInnerHTML={{ __html: post.description }}
                  />
                </div>

                {/* Footer Section with Views, Post ID, and Report Button */}
                <div className="px-4 md:px-8 pb-4 md:pb-8">
                  <div className="border-t border-black/5 pt-3 md:pt-6">
                    {/* Mobile: stacked layout */}
                    <div className="flex flex-col items-center gap-2 md:hidden">
                      <div className="text-black/50 text-[10px]">
                        <span>{post.views || 0} wyświetleń</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <CopyablePostId postId={post.id} />
                        {user && user.id !== post.user_id && (
                          <ReportPostDialog postId={post.id} onReport={reportPost} />
                        )}
                      </div>
                    </div>

                    {/* Desktop: single row with buttons left, views right */}
                    <div className="hidden md:flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CopyablePostId postId={post.id} />
                        {user && user.id !== post.user_id && (
                          <ReportPostDialog postId={post.id} onReport={reportPost} />
                        )}
                      </div>
                      <div className="text-black/50 text-sm">
                        <span>{post.views || 0} wyświetleń</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Author Info & Contact */}
          <div className="space-y-4 md:space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Title and Budget Section - Desktop Only */}
            <Card className="hidden lg:block border-0 rounded-3xl bg-white shadow-sm">
              <CardContent className="p-6 space-y-4">
                {/* Date and Favorite Button */}
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-black/60">
                    Dodano {new Date(post.created_at).toLocaleDateString('pl-PL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  <FavoriteButton
                    postId={post.id}
                    initialIsFavorite={isFavorite}
                    showLabel={false}
                  />
                </div>

                {/* Title */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-black leading-tight">{post.title}</h1>
                </div>

                {/* Budget */}
                {(post.price_min || post.price_max) && (
                  <div className="pt-4 border-t border-black/5">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl font-bold text-black">
                        {post.price_min && post.price_max
                          ? `${post.price_min} - ${post.price_max} zł`
                          : post.price_min
                          ? `od ${post.price_min} zł`
                          : `do ${post.price_max} zł`}
                      </span>
                      {post.price_type && (
                        <span className="text-base text-black/60">
                          {post.price_type === 'hourly'
                            ? '/ za godzinę'
                            : post.price_type === 'fixed'
                            ? '/ stała cena'
                            : '/ do negocjacji'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Author Card */}
            <Card className="border-0 rounded-2xl md:rounded-3xl bg-white shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 mb-4 md:mb-6">
                  <div className="relative">
                    {post.profiles?.avatar_url ? (
                      <Image
                        src={post.profiles.avatar_url}
                        alt={post.profiles.full_name || 'User'}
                        width={56}
                        height={56}
                        className="rounded-full md:w-16 md:h-16"
                      />
                    ) : (
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-black/10 flex items-center justify-center">
                        <span className="text-xl md:text-2xl font-semibold text-black">
                          {post.profiles?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    {/* Online Status Indicator */}
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 border-2 border-white rounded-full ${
                        isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                      title={isOnline ? 'Online' : 'Offline'}
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <h4 className="text-lg md:text-xl font-bold text-black">
                      {post.profiles?.full_name || 'Anonymous'}
                    </h4>
                    {post.profiles?.rating > 0 && post.profiles?.total_reviews > 0 && (
                      <div className="flex justify-center md:justify-start">
                        <RatingDisplay
                          userId={post.user_id}
                          rating={post.profiles.rating}
                          reviewCount={post.profiles.total_reviews}
                          clickable={post.profiles.show_profile_link !== false}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Member Since Info */}
                <div className="md:mb-6 md:pb-6 md:border-b md:border-black/5">
                  <div className="flex flex-col gap-2 text-xs md:text-sm text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-black/60">
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className={`flex items-center justify-center md:justify-start gap-2 ${
                      isOnline ? 'text-green-600' : 'text-black/50'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      }`} />
                      <span className="font-medium">{lastActiveText}</span>
                    </div>
                  </div>
                </div>

                {post.profiles?.bio && (
                  <p className="text-xs md:text-sm text-black/70 mb-4 leading-relaxed">
                    {post.profiles.bio}
                  </p>
                )}

                {/* Contact Buttons */}
                {user && user.id !== post.user_id ? (
                  <div className="space-y-2 md:space-y-3">
                    {/* Desktop only: Show message button and phone */}
                    <div className="hidden md:block space-y-2 md:space-y-3">
                      {/* Show message button only if user allows it and it's not AI bot */}
                      {post.profiles?.show_messages !== false && post.user_id !== AI_BOT_USER_ID && (
                        <SendMessageModal
                          postId={post.id}
                          receiverId={post.user_id}
                          receiverName={post.profiles?.full_name || 'użytkownika'}
                          postTitle={post.title}
                        />
                      )}
                      {/* Phone number if available and user allows showing it */}
                      {post.profiles?.phone && post.profiles?.show_phone !== false && (
                        <PhoneNumber phone={post.profiles.phone} postId={post.id} />
                      )}
                    </div>
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
                    <Button className="w-full rounded-full bg-black hover:bg-black/80 text-white border-0 py-5 md:py-6 text-base md:text-lg">
                      Zaloguj się aby skontaktować
                    </Button>
                  </Link>
                ) : (
                  <div className="hidden md:block space-y-3">
                    <div className="bg-black/5 rounded-full py-3 text-center">
                      <p className="text-base text-black/60">To Twoje ogłoszenie</p>
                    </div>
                    <Link href={`/dashboard/my-posts/${post.id}/edit`}>
                      <Button className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 py-6 text-lg">
                        Edytuj ogłoszenie
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distance Card - Only for logged in users */}
            {user && user.id !== post.user_id && (
              <DistanceCard postCity={post.city} postDistrict={post.district} />
            )}

            {/* Other Posts from Author */}
            {otherPosts && otherPosts.length > 0 && (
              <Card className="border-0 rounded-2xl md:rounded-3xl bg-white shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <h4 className="text-base md:text-lg font-bold text-black mb-3 md:mb-4">
                    Inne ogłoszenia użytkownika
                  </h4>

                  {/* Mobile: Horizontal Carousel */}
                  <div className="md:hidden -mx-4">
                    <div className="horizontal-scroll-padding-mobile flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
                      {otherPosts.map((otherPost: any) => (
                        <Link key={otherPost.id} href={`/posts/${otherPost.id}`} className="snap-center flex-shrink-0" style={{ width: '320px' }}>
                          <div className="group p-3 rounded-xl bg-black/5 hover:bg-black/10 transition-all cursor-pointer h-full">
                            <div className="flex flex-col gap-3">
                              {/* Thumbnail */}
                              {otherPost.images && otherPost.images.length > 0 && (
                                <div className="relative w-full h-36 rounded-lg overflow-hidden bg-black/10">
                                  <Image
                                    src={otherPost.images[0]}
                                    alt={otherPost.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                </div>
                              )}

                              {/* Content */}
                              <div className="flex flex-col gap-2">
                                <div className="flex items-start gap-2">
                                  <Badge
                                    className={`rounded-full px-2 py-0.5 text-xs ${
                                      otherPost.type === 'seeking'
                                        ? 'bg-[#C44E35] text-white border-0'
                                        : 'bg-black text-white border-0'
                                    }`}
                                  >
                                    {otherPost.type === 'seeking' ? 'Szukam' : 'Oferuję'}
                                  </Badge>
                                </div>
                                <h5 className="text-sm font-semibold text-black line-clamp-2 group-hover:text-[#C44E35] transition-colors leading-snug">
                                  {otherPost.title}
                                </h5>
                                <div className="flex items-center gap-1.5 text-xs text-black/60">
                                  <span>{otherPost.city}</span>
                                  {(otherPost.price_min || otherPost.price_max) && (
                                    <>
                                      <span>•</span>
                                      <span className="font-semibold text-black">
                                        {otherPost.price_min && otherPost.price_max
                                          ? `${otherPost.price_min}-${otherPost.price_max} zł`
                                          : otherPost.price_min
                                          ? `${otherPost.price_min} zł`
                                          : `${otherPost.price_max} zł`}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Desktop: Vertical List */}
                  <div className="hidden md:block space-y-4">
                    {otherPosts.map((otherPost: any, index: number) => (
                      <div key={otherPost.id}>
                        {index > 0 && <div className="h-px bg-black/10 my-4" />}
                        <Link href={`/posts/${otherPost.id}`}>
                          <div className="group p-4 rounded-2xl bg-black/5 hover:bg-black/10 transition-all cursor-pointer min-h-[90px]">
                          <div className="flex gap-3">
                            {/* Thumbnail */}
                            {otherPost.images && otherPost.images.length > 0 && (
                              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black/10 flex-shrink-0">
                                <Image
                                  src={otherPost.images[0]}
                                  alt={otherPost.title}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start gap-2 mb-2">
                                  <Badge
                                    className={`rounded-full px-2 py-0.5 text-xs ${
                                      otherPost.type === 'seeking'
                                        ? 'bg-[#C44E35] text-white border-0'
                                        : 'bg-black text-white border-0'
                                    }`}
                                  >
                                    {otherPost.type === 'seeking' ? 'Szukam' : 'Oferuję'}
                                  </Badge>
                                </div>
                                <h5 className="text-sm font-semibold text-black mb-2 line-clamp-2 group-hover:text-[#C44E35] transition-colors leading-snug">
                                  {otherPost.title}
                                </h5>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-black/60">
                                <span>{otherPost.city}</span>
                                {(otherPost.price_min || otherPost.price_max) && (
                                  <>
                                    <span>•</span>
                                    <span className="font-semibold text-black">
                                      {otherPost.price_min && otherPost.price_max
                                        ? `${otherPost.price_min}-${otherPost.price_max} zł`
                                        : otherPost.price_min
                                        ? `${otherPost.price_min} zł`
                                        : `${otherPost.price_max} zł`}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Action Dock - Only for logged-in users who are not the post author */}
      {user && (
        <MobileActionDock
          postId={post.id}
          receiverId={post.user_id}
          receiverName={post.profiles?.full_name || 'użytkownika'}
          postTitle={post.title}
          phone={post.profiles?.phone}
          showMessages={post.profiles?.show_messages !== false}
          showPhone={post.profiles?.show_phone !== false}
          isOwnPost={user.id === post.user_id}
        />
      )}

      <div className="hidden md:block">
        <Footer />
      </div>
      </PostDetailClientWrapper>
    </div>
  )
}
