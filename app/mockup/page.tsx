import { CategoriesMegaMenuMockup } from '@/components/mockups/CategoriesMegaMenuMockup'
import { createClient } from '@/lib/supabase/server'

export default async function MockupPage() {
  const supabase = await createClient()

  // Fetch all main categories with subcategories
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug,
      icon,
      subcategories:categories!parent_id(id, name, slug)
    `)
    .is('parent_id', null)
    .order('name')

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <CategoriesMegaMenuMockup categories={categories || []} />

      {/* Content area to show how it looks with content */}
      <div className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl p-8">
          <h1 className="text-4xl font-bold mb-4">Mockup: Mega Menu w Navbarze</h1>
          <p className="text-lg text-black/60 mb-6">
            Kliknij przycisk "Kategorie" w navbarze aby zobaczyć mega menu dropdown.
          </p>

          <div className="space-y-4">
            <div className="p-6 bg-[#FAF8F3] rounded-2xl">
              <h3 className="font-bold mb-2">Desktop:</h3>
              <p className="text-black/60">
                • Przycisk "Kategorie" obok search bara<br/>
                • Duży dropdown panel z siatką kategorii<br/>
                • Hover na kategorie pokazuje podkategorie po prawej<br/>
                • Zamyka się po kliknięciu poza lub na kategorie
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F3] rounded-2xl">
              <h3 className="font-bold mb-2">Mobile:</h3>
              <p className="text-black/60">
                • Przycisk z ikoną hamburgera<br/>
                • Bottom sheet/drawer wysuwający się z dołu<br/>
                • Scrollowalna lista z możliwością rozwijania<br/>
                • Zamyka się po kliknięciu X lub backdrop
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
            <h3 className="font-bold mb-2 text-blue-900">Zalety tego rozwiązania:</h3>
            <ul className="text-blue-800 space-y-1">
              <li>✅ Kategorie zawsze dostępne (1 kliknięcie)</li>
              <li>✅ Nie zajmuje miejsca gdy nieużywane</li>
              <li>✅ Pokazuje wszystkie kategorie naraz</li>
              <li>✅ Łatwe discovery dla nowych użytkowników</li>
              <li>✅ Standard używany przez największe platformy</li>
              <li>✅ Działa świetnie na mobile i desktop</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
