import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { BookingCalendar } from '../BookingCalendar'
import { X } from 'lucide-react'
import Link from 'next/link'

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect if not logged in
  if (!user) {
    redirect(`/login?redirect=/posts/${id}/booking`)
  }

  // Fetch post details
  const { data: post } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      user_id,
      is_service,
      profiles:user_id (
        full_name
      )
    `)
    .eq('id', id)
    .single()

  if (!post || !post.is_service) {
    notFound()
  }

  // Can't book your own service
  if (user.id === post.user_id) {
    redirect(`/posts/${id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex-1">
            <h1 className="text-lg font-semibold line-clamp-1">Rezerwacja terminu</h1>
            <p className="text-sm text-muted-foreground line-clamp-1">{post.title}</p>
          </div>
          <Link href={`/posts/${id}`} className="p-2 -mr-2 hover:bg-accent rounded-full transition-colors">
            <X className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 pb-20">
        <BookingCalendar
          providerId={post.user_id}
          providerName={post.profiles?.full_name || 'użytkownika'}
          postId={post.id}
          postTitle={post.title}
          isMobilePage={true}
        />
      </div>
    </div>
  )
}
