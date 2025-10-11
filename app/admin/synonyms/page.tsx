import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/admin'
import { SynonymsManager } from '@/components/admin/SynonymsManager'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Synonymy wyszukiwania - Panel admina",
}

export default async function AdminSynonymsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userRole = await getUserRole()
  if (userRole !== 'admin') {
    redirect('/dashboard')
  }

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
    <div className="min-h-screen bg-[#FAF8F3]">
      <NavbarWithHide user={user} showAddButton={false} />

      <main className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Zarządzanie synonimami</h1>
          <p className="text-black/60">
            Dodawaj synonymy do terminów i kategorii aby poprawić wyszukiwanie
          </p>
        </div>

        <SynonymsManager
          initialSynonyms={synonyms || []}
          initialCategories={categories || []}
        />
      </main>

      <Footer />
    </div>
  )
}
