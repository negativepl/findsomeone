import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { Metadata } from 'next'
import { ReviewsClient } from './ReviewsClient'

export const metadata: Metadata = {
  title: "Moje oceny",
}

export default async function ReviewsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch reviews received by the user
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(
        id,
        full_name,
        avatar_url
      ),
      post:posts(
        id,
        title
      )
    `)
    .eq('reviewed_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch user's rating stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('rating, total_reviews')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavbarWithHide user={user} pageTitle="Moje oceny" />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-20 md:pb-10">
        {/* Header */}
        <div className="mb-8 hidden md:block">
          <h2 className="text-4xl font-bold text-foreground mb-3">Moje oceny</h2>
          <p className="text-lg text-muted-foreground">
            Zarządzaj opiniami i odpowiadaj na recenzje
          </p>
        </div>

        {/* Client Component with Reviews */}
        <ReviewsClient
          reviews={reviews || []}
          rating={profile?.rating || 0}
          totalReviews={profile?.total_reviews || 0}
          userId={user.id}
        />
      </main>

      <Footer />
    </div>
  )
}
