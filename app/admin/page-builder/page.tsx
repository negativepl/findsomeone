import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageBuilderClient } from '@/components/admin/PageBuilderClient'

export const metadata: Metadata = {
  title: 'Page Builder - Admin Panel',
  description: 'Zarządzaj sekcjami strony głównej',
}

export default async function PageBuilderPage() {
  const supabase = await createClient()

  // Check if user is authenticated and is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin/page-builder')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // Fetch all homepage sections
  const { data: sections } = await supabase
    .from('homepage_sections')
    .select('*')
    .order('sort_order', { ascending: true })

  // Fetch categories for filters
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .is('parent_id', null)
    .order('name')

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Page Builder</h1>
        <p className="text-muted-foreground">
          Zarządzaj sekcjami strony głównej - przeciągaj, edytuj i dodawaj nowe
        </p>
      </div>

      <PageBuilderClient
        initialSections={sections || []}
        categories={categories || []}
      />
    </>
  )
}
