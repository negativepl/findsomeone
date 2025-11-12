import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageBuilderClient } from '@/components/admin/PageBuilderClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-xl border bg-card p-0 gap-0 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="h-20 flex flex-row items-center justify-between space-y-0 px-8 border-b flex-shrink-0">
          <div>
            <CardTitle className="text-base font-bold">Page Builder</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Zarządzaj sekcjami strony głównej - przeciągaj, edytuj i dodawaj nowe
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-1 overflow-y-auto flex flex-col">
          <PageBuilderClient
            initialSections={sections || []}
            categories={categories || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
