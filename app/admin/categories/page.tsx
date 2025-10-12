import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { CategoryList } from '@/components/admin/CategoryList'
import { AddCategoryDialog } from '@/components/admin/AddCategoryDialog'
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

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Zarządzanie kategoriami</h1>
            <p className="text-black/60">
              Dodawaj, edytuj i usuwaj kategorie ogłoszeń
            </p>
          </div>
          <AddCategoryDialog />
        </div>
      </div>

      {/* Categories List */}
      <Card className="border border-black/5 shadow-sm">
        <CardContent className="p-6">
          <CategoryList categories={categories as Category[] || []} />
        </CardContent>
      </Card>
    </>
  )
}
