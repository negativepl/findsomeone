import { createClient } from '@/lib/supabase/server'
import { SynonymsManager } from '@/components/admin/SynonymsManager'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: "Synonimy wyszukiwania - Panel administracyjny",
}

export default async function AdminSynonymsPage() {
  const supabase = await createClient()

  // Fetch all synonyms
  const { data: synonyms } = await supabase
    .from('search_synonyms')
    .select('*')
    .order('term')

  // Fetch all categories with their synonyms
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug,
      category_synonyms (
        id,
        synonym,
        created_at
      )
    `)
    .order('display_order')

  return (
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-xl border bg-card p-0 gap-0 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="h-20 flex flex-row items-center justify-between space-y-0 px-8 border-b flex-shrink-0">
          <div>
            <CardTitle className="text-base font-bold">Zarządzanie synonimami</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Dodawaj synonimy do terminów i kategorii aby poprawić wyszukiwanie
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-1 overflow-y-auto flex flex-col bg-background">
          <SynonymsManager
            initialSynonyms={synonyms || []}
            initialCategories={categories || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
