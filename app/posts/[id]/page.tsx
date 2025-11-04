import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
        name,
        parent_id,
        parent:parent_id (
          name
        )
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

  const priceText = post.price
    ? `${post.price} zł`
    : 'cena do negocjacji'

  const fullTitle = `${post.title} - ${post.city} | FindSomeone`
  const fullDescription = `${cleanDescription}. ${priceText}. Kontakt: ${post.profiles?.full_name || 'FindSomeone'}`

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: [
      post.title,
      post.categories?.name || '',
      post.city,
      post.district || '',
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
        banner_url,
        banner_position,
        banner_scale,
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
        slug,
        parent_id,
        parent:parent_id (
          name,
          slug
        )
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

    if (diffMinutes < 60) return `Aktywny ${diffMinutes} min temu`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `Aktywny ${diffHours} godz. temu`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Aktywny wczoraj'
    if (diffDays < 7) return `Aktywny ${diffDays} dni temu`
    if (diffDays < 30) return `Aktywny ${Math.floor(diffDays / 7)} tyg. temu`
    if (diffDays < 365) return `Aktywny ${Math.floor(diffDays / 30)} mies. temu`

    return `Aktywny ${Math.floor(diffDays / 365)} lat temu`
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
      city,
      district,
      price,
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
    '@type': 'Service',
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
    ...(post.price ? {
      offers: {
        '@type': 'Offer',
        priceCurrency: 'PLN',
        price: post.price,
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
    <div className="min-h-screen bg-background">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ViewCounter postId={post.id} userId={user?.id} postAuthorId={post.user_id} />

      <NavbarWithHide user={user} showAddButton={true} />

      <PostDetailClientWrapper postTitle={post.title}>
        {/* Main Content */}
        <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-2 md:pb-6 mb-[72px] md:mb-0">
        {/* Breadcrumbs */}
        <div className="mb-4 md:mb-8">
          <Breadcrumbs
            items={[
              { label: 'Strona główna', href: '/' },
              { label: 'Ogłoszenia', href: '/posts' },
              // Show parent category if exists (for subcategories)
              ...(post.categories?.parent_id && post.categories?.parent ? [{
                label: post.categories.parent.name,
                href: `/posts?category=${post.categories.parent.slug}`
              }] : []),
              // Show current category
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
            <Card className="border border-border rounded-2xl md:rounded-3xl bg-card shadow-sm">
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
                  <div className="text-sm text-muted-foreground">
                    Dodano {new Date(post.created_at).toLocaleDateString('pl-PL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>

                  {post.price ? (
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl font-bold text-foreground">
                        {post.price} zł{post.price_negotiable ? '*' : ''}
                      </span>
                      <span className="text-base text-muted-foreground">
                        {post.price_negotiable
                          ? '/ do negocjacji'
                          : post.price_type === 'hourly'
                          ? '/ za godzinę'
                          : '/ stała cena'}
                      </span>
                    </div>
                  ) : post.price_type === 'free' ? (
                    <div className="text-3xl font-bold text-green-600">Za darmo</div>
                  ) : null}
                </div>

                {/* Badges Section - Above Description */}
                {post.categories && (
                  <div className="px-4 md:px-8 pt-2 md:pt-0 pb-3 md:pb-4">
                    <Badge variant="outline" className="rounded-full border-border text-muted-foreground px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm">
                      {post.categories.name}
                    </Badge>
                  </div>
                )}

                {/* Description Section */}
                <div className="px-4 md:px-8 pb-4 md:pb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">Opis</h2>
                  <div
                    className="prose prose-base max-w-none text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.description }}
                  />
                </div>

                {/* Footer Section with Views, Post ID, and Report Button */}
                <div className="px-4 md:px-8 pb-4 md:pb-8">
                  <div className="border-t border-border pt-3 md:pt-6">
                    {/* Mobile: stacked layout */}
                    <div className="flex flex-col items-center gap-2 md:hidden">
                      <div className="text-muted-foreground text-xs">
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
                      <div className="text-muted-foreground text-sm">
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
            <Card className="hidden lg:block border border-border rounded-3xl bg-card shadow-sm">
              <CardContent className="p-6 space-y-4">
                {/* Date and Favorite Button */}
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
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
                  <p className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{post.title}</p>
                </div>

                {/* Budget */}
                {post.price ? (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl font-bold text-foreground">
                        {post.price} zł{post.price_negotiable ? '*' : ''}
                      </span>
                      <span className="text-base text-muted-foreground">
                        {post.price_negotiable
                          ? '/ do negocjacji'
                          : post.price_type === 'hourly'
                          ? '/ za godzinę'
                          : '/ stała cena'}
                      </span>
                    </div>
                  </div>
                ) : post.price_type === 'free' ? (
                  <div className="pt-4 border-t border-border">
                    <div className="text-3xl font-bold text-green-600">Za darmo</div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Author Card */}
            <Card className="border border-border rounded-2xl md:rounded-3xl bg-card shadow-sm overflow-hidden">
              {/* Banner */}
              {post.profiles?.banner_url && (
                <div className="relative w-full h-24 md:h-32 overflow-hidden bg-muted">
                  <Image
                    src={post.profiles.banner_url}
                    alt=""
                    fill
                    className="object-cover"
                    style={{
                      objectPosition: `center ${post.profiles.banner_position || 50}%`,
                      transform: `scale(${(post.profiles.banner_scale || 100) / 100})`
                    }}
                  />
                </div>
              )}
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                  <div className="relative flex-shrink-0">
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
                        <span className="text-xl md:text-2xl font-semibold text-foreground">
                          {post.profiles?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    {/* Online Status Indicator */}
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 border border-white rounded-full ${
                        isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                      title={isOnline ? 'Online' : 'Offline'}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-foreground">
                      {post.profiles?.full_name || 'Anonymous'}
                    </h2>
                    <RatingDisplay
                      userId={post.user_id}
                      rating={post.profiles?.rating || 0}
                      reviewCount={post.profiles?.total_reviews || 0}
                      clickable={post.profiles?.show_profile_link !== false}
                    />
                  </div>
                </div>

                {/* Member Since Info & Activity Status */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
                  <span>
                    {daysOnPlatform === 0
                      ? 'Dołączył dzisiaj'
                      : daysOnPlatform === 1
                      ? 'Na platformie od 1 dnia'
                      : daysOnPlatform < 31
                      ? `Na platformie od ${daysOnPlatform} dni`
                      : daysOnPlatform < 365
                      ? `Na platformie od ${Math.floor(daysOnPlatform / 30)} miesięcy`
                      : `Na platformie od ${Math.floor(daysOnPlatform / 365)} lat`}
                  </span>

                  <span className="text-foreground/30">•</span>

                  <span className={isOnline ? 'text-green-600' : 'text-muted-foreground'}>
                    {lastActiveText}
                  </span>
                </div>

                {post.profiles?.bio && (
                  <>
                    <div className="border-t border-border mb-4" />
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {post.profiles.bio}
                    </p>
                  </>
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
                    <Button className="w-full rounded-full bg-black hover:bg-black/80 text-white border border-border py-5 md:py-6 text-base md:text-lg">
                      Zaloguj się aby skontaktować
                    </Button>
                  </Link>
                ) : (
                  <div className="hidden md:block space-y-3">
                    <div className="bg-muted rounded-full py-3 text-center">
                      <p className="text-base text-muted-foreground">To Twoje ogłoszenie</p>
                    </div>
                    <Link href={`/dashboard/my-posts/${post.id}/edit`}>
                      <Button className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border border-border py-6 text-lg">
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
              <Card className="border border-border rounded-2xl md:rounded-3xl bg-card shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-base md:text-lg font-bold text-foreground mb-3 md:mb-4">
                    Inne ogłoszenia użytkownika
                  </h2>

                  {/* Mobile: Horizontal Carousel */}
                  <div className="md:hidden -mx-4">
                    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 px-[calc(50%-140px)]">
                      {otherPosts.map((otherPost: any) => (
                        <Link key={otherPost.id} href={`/posts/${otherPost.id}`} className="snap-center flex-shrink-0" style={{ width: '280px' }}>
                          <div className="border border-border rounded-3xl bg-card hover:bg-muted transition-all group overflow-hidden cursor-pointer h-full flex flex-col shadow-sm">
                            {/* Image */}
                            {otherPost.images && otherPost.images.length > 0 && (
                              <div className="relative w-full h-40 bg-muted">
                                <Image
                                  src={otherPost.images[0]}
                                  alt={otherPost.title}
                                  fill
                                  sizes="280px"
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}

                            <div className="p-4 flex flex-col flex-1">
                              {otherPost.categories && (
                                <div className="mb-2">
                                  <Badge variant="outline" className="rounded-full border-border text-muted-foreground text-xs">
                                    {otherPost.categories.name}
                                  </Badge>
                                </div>
                              )}
                              <h3 className="text-base font-bold text-foreground mb-3">{otherPost.title}</h3>

                              <div className="flex items-center justify-between gap-2 mt-auto">
                                {/* Location - Left */}
                                <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="truncate">{otherPost.city}</span>
                                </div>

                                {/* Price - Right */}
                                {otherPost.price && (
                                  <p className="text-sm font-bold text-foreground whitespace-nowrap">
                                    {otherPost.price} zł
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Desktop: Horizontal Carousel */}
                  <div className="hidden md:block -mx-6">
                    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 px-6">
                      {otherPosts.map((otherPost: any) => (
                        <Link key={otherPost.id} href={`/posts/${otherPost.id}`} className="snap-center flex-shrink-0" style={{ width: '280px' }}>
                          <div className="border border-border rounded-3xl bg-card hover:bg-muted transition-all group overflow-hidden cursor-pointer h-full flex flex-col shadow-sm">
                            {/* Image */}
                            {otherPost.images && otherPost.images.length > 0 && (
                              <div className="relative w-full h-40 bg-muted">
                                <Image
                                  src={otherPost.images[0]}
                                  alt={otherPost.title}
                                  fill
                                  sizes="280px"
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}

                            <div className="p-4 flex flex-col flex-1">
                              {otherPost.categories && (
                                <div className="mb-2">
                                  <Badge variant="outline" className="rounded-full border-border text-muted-foreground text-xs">
                                    {otherPost.categories.name}
                                  </Badge>
                                </div>
                              )}
                              <h3 className="text-base font-bold text-foreground mb-3">{otherPost.title}</h3>

                              <div className="flex items-center justify-between gap-2 mt-auto">
                                {/* Location - Left */}
                                <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="truncate">{otherPost.city}</span>
                                </div>

                                {/* Price - Right */}
                                {otherPost.price && (
                                  <p className="text-sm font-bold text-foreground whitespace-nowrap">
                                    {otherPost.price} zł
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
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

      <Footer />
      </PostDetailClientWrapper>
    </div>
  )
}
