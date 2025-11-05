import { createClient } from '@/lib/supabase/server'
import { EmbeddingsManager } from '@/components/admin/EmbeddingsManager'
import { Metadata } from 'next'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: "Wyszukiwanie semantyczne - Panel administracyjny",
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Wyszukiwanie semantyczne AI</h1>
        <p className="text-muted-foreground">
          Generuj i zarządzaj indeksem wyszukiwania AI dla ogłoszeń
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 rounded-3xl bg-card shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Wszystkie posty</p>
                <div className="text-3xl font-bold text-foreground">{totalPosts || 0}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-0 rounded-3xl bg-card shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Z embeddingami</p>
                <div className="text-3xl font-bold text-foreground">{postsWithEmbeddings || 0}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-0 rounded-3xl bg-card shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Bez embeddingów</p>
                <div className="text-3xl font-bold text-foreground">{postsWithoutEmbeddings || 0}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-0 rounded-3xl bg-card shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Pokrycie</p>
                <div className="text-3xl font-bold text-foreground">{coveragePercent}%</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Manager Component */}
      <EmbeddingsManager />
    </>
  )
}
