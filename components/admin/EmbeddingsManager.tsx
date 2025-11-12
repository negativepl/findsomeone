'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function EmbeddingsManager() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    processed: number
    failed: number
    total: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateEmbeddings = async () => {
    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/search/semantic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate embeddings')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="border bg-muted rounded-3xl flex-1 flex flex-col overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-1">
          Semantic Search (AI Embeddings)
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Generuj wektory embeddings dla postów używając OpenAI. To umożliwia wyszukiwanie semantyczne
          - znajdowanie podobnych znaczeń, nie tylko dokładnych słów.
        </p>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 bg-accent border rounded-2xl">
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Model</h4>
            <p className="text-lg font-bold text-foreground">text-embedding-3-small</p>
            <p className="text-xs text-muted-foreground mt-1">1536 wymiarów, $0.02/1M tokenów</p>
          </Card>

          <Card className="p-4 bg-accent border rounded-2xl">
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Funkcje</h4>
            <p className="text-lg font-bold text-foreground">Semantyczne wyszukiwanie</p>
            <p className="text-xs text-muted-foreground mt-1">Znajduje podobne znaczenia</p>
          </Card>

          <Card className="p-4 bg-accent border rounded-2xl">
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Koszt</h4>
            <p className="text-lg font-bold text-foreground">~$0.01-0.05</p>
            <p className="text-xs text-muted-foreground mt-1">za 100 postów</p>
          </Card>
        </div>
      </div>

      <div className="px-6 pb-6 pt-6">
        <div className="border-t border-border pt-6 flex justify-end">
          <Button
            onClick={generateEmbeddings}
            disabled={isGenerating}
            className="rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 gap-1"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin mr-1" />
                Generuję embeddingi...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Wygeneruj embeddingi dla postów
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="px-6 pb-6">
          <Card className="p-4 bg-accent border rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-semibold text-foreground">Sukces!</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Przetworzonych:</span>
                <span className="font-semibold text-foreground">{result.processed} / {result.total}</span>
              </div>
              {result.failed > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Błędów:</span>
                  <span className="font-semibold text-foreground">{result.failed}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                Embeddingi zostały wygenerowane i zapisane. Wyszukiwarka semantyczna jest teraz aktywna!
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-6 pb-6">
          <Card className="p-4 bg-accent border rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-semibold text-foreground">Błąd</h4>
            </div>
            <p className="text-sm text-foreground">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Sprawdź czy OPENAI_API_KEY jest poprawnie ustawiony w .env.local
            </p>
          </Card>
        </div>
      )}

    </Card>
  )
}
