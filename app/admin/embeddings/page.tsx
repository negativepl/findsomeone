import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { EmbeddingsManager } from '@/components/admin/EmbeddingsManager'
import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: "AI Embeddings - Panel admina",
}

export default async function EmbeddingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = await isAdmin()
  if (!admin) {
    redirect('/dashboard')
  }

  // Get stats about embeddings
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: postsWithEmbeddings } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .not('embedding', 'is', null)

  const { count: postsWithoutEmbeddings } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .is('embedding', null)

  const coveragePercent = totalPosts ? Math.round((postsWithEmbeddings || 0) / totalPosts * 100) : 0

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <NavbarWithHide user={user} showAddButton={false} />

      <main className="container mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-black mb-3">AI Embeddings & Semantic Search</h1>
          <p className="text-lg text-black/60">
            Zarządzaj wektorami embeddings dla wyszukiwania semantycznego
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-2 border-black/10 rounded-2xl">
            <p className="text-xs font-semibold text-black/40 uppercase mb-1">Wszystkie posty</p>
            <p className="text-3xl font-bold text-black">{totalPosts || 0}</p>
          </Card>

          <Card className="p-4 border-2 border-green-200 bg-green-50 rounded-2xl">
            <p className="text-xs font-semibold text-green-600 uppercase mb-1">Z embeddingami</p>
            <p className="text-3xl font-bold text-green-700">{postsWithEmbeddings || 0}</p>
          </Card>

          <Card className="p-4 border-2 border-orange-200 bg-orange-50 rounded-2xl">
            <p className="text-xs font-semibold text-orange-600 uppercase mb-1">Bez embeddingów</p>
            <p className="text-3xl font-bold text-orange-700">{postsWithoutEmbeddings || 0}</p>
          </Card>

          <Card className="p-4 border-2 border-[#C44E35]/20 bg-[#C44E35]/5 rounded-2xl">
            <p className="text-xs font-semibold text-[#C44E35] uppercase mb-1">Pokrycie</p>
            <p className="text-3xl font-bold text-[#C44E35]">{coveragePercent}%</p>
          </Card>
        </div>

        {/* Main Manager Component */}
        <EmbeddingsManager />

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6 border-2 border-black/10 rounded-3xl">
            <h3 className="text-xl font-bold text-black mb-4">
              Co to daje użytkownikom?
            </h3>
            <ul className="space-y-3 text-sm text-black/70">
              <li className="flex gap-2">
                <span className="text-[#C44E35] font-bold">•</span>
                <span><strong>Lepsze wyniki:</strong> System znajduje posty podobne znaczeniowo, nie tylko te z dokładnymi słowami</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#C44E35] font-bold">•</span>
                <span><strong>Odporność na błędy:</strong> Działa nawet gdy użytkownik wpisze inaczej ("instalator" → "hydraulik")</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#C44E35] font-bold">•</span>
                <span><strong>Smart suggestions:</strong> Personalizowane sugestie oparte na historii wyszukiwań</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#C44E35] font-bold">•</span>
                <span><strong>Hybrydowe ranking:</strong> Łączy semantykę (60%) z full-text search (40%)</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 border-2 border-black/10 rounded-3xl">
            <h3 className="text-xl font-bold text-black mb-4">
              Techniczne szczegóły
            </h3>
            <ul className="space-y-3 text-sm text-black/70">
              <li className="flex gap-2">
                <span className="text-[#C44E35] font-bold">•</span>
                <span><strong>Model:</strong> OpenAI text-embedding-3-small (1536 dims)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#C44E35] font-bold">•</span>
                <span><strong>Indeks:</strong> pgvector HNSW dla ultra-szybkiego wyszukiwania</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#C44E35] font-bold">•</span>
                <span><strong>Metryka:</strong> Cosine similarity (1 = identyczne, 0 = niepodobne)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#C44E35] font-bold">•</span>
                <span><strong>Batch:</strong> Max 100 postów na raz, tylko bez embeddingów</span>
              </li>
            </ul>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
