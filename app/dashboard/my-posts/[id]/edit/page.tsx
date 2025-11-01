import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { EditPostClient } from './EditPostClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Edytuj ogłoszenie",
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the post
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories (
        id,
        slug,
        name
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id) // Only allow editing own posts
    .single()

  if (error || !post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
      <NavbarWithHide user={user} />
      <div className="flex-1">
        <EditPostClient post={post} />
      </div>
      <Footer />
    </div>
  )
}
