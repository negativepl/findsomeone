import { createClient } from '@/lib/supabase/server'
import { EmbeddingsManager } from '@/components/admin/EmbeddingsManager'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-xl border bg-card p-0 gap-0 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="h-20 flex flex-row items-center justify-between space-y-0 px-8 border-b flex-shrink-0">
          <div>
            <CardTitle className="text-base font-bold">Wyszukiwanie semantyczne AI</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Generuj i zarządzaj indeksem wyszukiwania AI dla ogłoszeń
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-1 overflow-y-auto flex flex-col">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border bg-muted">
              <div className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">Wszystkie posty</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-foreground">{totalPosts || 0}</div>
                </div>
              </div>
            </Card>

            <Card className="border bg-muted">
              <div className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">Z embeddingami</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-foreground">{postsWithEmbeddings || 0}</div>
                </div>
              </div>
            </Card>

            <Card className="border bg-muted">
              <div className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">Bez embeddingów</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-foreground">{postsWithoutEmbeddings || 0}</div>
                </div>
              </div>
            </Card>

            <Card className="border bg-muted">
              <div className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">Pokrycie</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-foreground">{coveragePercent}%</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Manager Component */}
          <EmbeddingsManager />
        </CardContent>
      </Card>
    </div>
  )
}
