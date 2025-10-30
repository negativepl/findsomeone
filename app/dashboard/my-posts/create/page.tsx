import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreatePostClient } from './CreatePostClient'

export default async function CreatePostPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .is('parent_id', null)
    .order('name')

  return <CreatePostClient categories={categories || []} />
}
