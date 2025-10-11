import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { CategoryList } from '@/components/admin/CategoryList'
import { AddCategoryDialog } from '@/components/admin/AddCategoryDialog'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Zarządzanie kategoriami - Panel admina",
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  parent_id: string | null
  created_at: string
}

export default async function CategoriesAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = await isAdmin()
  if (!admin) {
    redirect('/dashboard')
  }

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <NavbarWithHide user={user} showAddButton={false} />

      <main className="container mx-auto px-6 py-10">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Panel admina', href: '/admin' },
            { label: 'Kategorie' },
          ]}
        />

        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-black mb-3">Zarządzanie kategoriami</h1>
              <p className="text-lg text-black/60">
                Dodawaj, edytuj i usuwaj kategorie ogłoszeń
              </p>
            </div>
            <AddCategoryDialog />
          </div>
        </div>

        {/* Categories List */}
        <Card className="border-0 rounded-3xl bg-white">
          <CardContent className="p-6">
            <CategoryList categories={categories as Category[] || []} />
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
