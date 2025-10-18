import { createClient } from '@/lib/supabase/server'
import { SynonymsManager } from '@/components/admin/SynonymsManager'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Synonimy wyszukiwania - Panel admina",
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
    .order('name')

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Zarządzanie synonimami</h1>
        <p className="text-black/60">
          Dodawaj synonimy do terminów i kategorii aby poprawić wyszukiwanie
        </p>
      </div>

      <SynonymsManager
        initialSynonyms={synonyms || []}
        initialCategories={categories || []}
      />
    </>
  )
}
