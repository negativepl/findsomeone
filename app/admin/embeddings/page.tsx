import { createClient } from '@/lib/supabase/server'
import { EmbeddingsManager } from '@/components/admin/EmbeddingsManager'
import { Metadata } from 'next'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: "AI Embeddings - Panel admina",
}

export default async function EmbeddingsPage() {
  const supabase = await createClient()

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
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">AI Embeddings & Semantic Search</h1>
        <p className="text-black/60">
          Zarządzaj wektorami embeddings dla wyszukiwania semantycznego
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 rounded-3xl bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">Wszystkie posty</p>
                <div className="text-3xl font-bold text-black">{totalPosts || 0}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-0 rounded-3xl bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">Z embeddingami</p>
                <div className="text-3xl font-bold text-black">{postsWithEmbeddings || 0}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-0 rounded-3xl bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">Bez embeddingów</p>
                <div className="text-3xl font-bold text-black">{postsWithoutEmbeddings || 0}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-0 rounded-3xl bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">Pokrycie</p>
                <div className="text-3xl font-bold text-black">{coveragePercent}%</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Manager Component */}
      <EmbeddingsManager />

      {/* Additional Info */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {/* Benefits Card */}
        <Card className="border-0 rounded-3xl bg-white shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-black/10 bg-gradient-to-r from-green-500/5 to-transparent">
            <h3 className="text-2xl font-bold text-black mb-1">
              Co to daje użytkownikom?
            </h3>
            <p className="text-sm text-black/60">Korzyści z wyszukiwania semantycznego</p>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-sm">
                <strong className="text-black">Lepsze wyniki:</strong>
                <span className="text-black/70"> System znajduje posty podobne znaczeniowo, nie tylko te z dokładnymi słowami</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-sm">
                <strong className="text-black">Odporność na błędy:</strong>
                <span className="text-black/70"> Działa nawet gdy użytkownik wpisze inaczej ("instalator" → "hydraulik")</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-sm">
                <strong className="text-black">Smart suggestions:</strong>
                <span className="text-black/70"> Personalizowane sugestie oparte na historii wyszukiwań</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-sm">
                <strong className="text-black">Hybrydowe ranking:</strong>
                <span className="text-black/70"> Łączy semantykę (60%) z full-text search (40%)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Usage & Technical Card */}
        <div className="space-y-6">
          {/* When to run */}
          <Card className="border-0 rounded-3xl bg-white shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-black/10 bg-gradient-to-r from-blue-500/5 to-transparent">
              <h3 className="text-2xl font-bold text-black mb-1">
                Kiedy uruchamiać?
              </h3>
              <p className="text-sm text-black/60">Najlepsze momenty na generowanie</p>
            </div>
            <div className="p-6 space-y-2">
              <div className="flex items-start gap-3 text-sm text-black/70">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Po dodaniu nowych postów (batch co kilka dni)
              </div>
              <div className="flex items-start gap-3 text-sm text-black/70">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Po zmianie treści postów
              </div>
              <div className="flex items-start gap-3 text-sm text-black/70">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Jednorazowo przy pierwszym uruchomieniu
              </div>
              <div className="flex items-start gap-3 text-sm text-black/70">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                System przetwarza tylko posty bez embeddingów (max 100 na raz)
              </div>
            </div>
          </Card>

          {/* Technical details */}
          <Card className="border-0 rounded-3xl bg-white shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-black/10 bg-gradient-to-r from-purple-500/5 to-transparent">
              <h3 className="text-2xl font-bold text-black mb-1">
                Techniczne szczegóły
              </h3>
              <p className="text-sm text-black/60">Specyfikacja modelu i infrastruktury</p>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <strong className="text-black/90 min-w-[80px]">Model:</strong>
                <span className="text-black/70">OpenAI text-embedding-3-small (1536 dims)</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <strong className="text-black/90 min-w-[80px]">Indeks:</strong>
                <span className="text-black/70">pgvector HNSW dla ultra-szybkiego wyszukiwania</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <strong className="text-black/90 min-w-[80px]">Metryka:</strong>
                <span className="text-black/70">Cosine similarity (1 = identyczne, 0 = niepodobne)</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <strong className="text-black/90 min-w-[80px]">Batch:</strong>
                <span className="text-black/70">Max 100 postów na raz, tylko bez embeddingów</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
