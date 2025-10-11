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
    <Card className="p-6 border-2 border-black/10 rounded-3xl">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-black mb-2">
          Semantic Search (AI Embeddings)
        </h3>
        <p className="text-black/60">
          Generuj wektory embeddings dla postów używając OpenAI. To umożliwia wyszukiwanie semantyczne
          - znajdowanie podobnych znaczeń, nie tylko dokładnych słów.
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-[#C44E35]/5 border-[#C44E35]/20">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h4 className="font-semibold text-sm">Model</h4>
          </div>
          <p className="text-lg font-bold">text-embedding-3-small</p>
          <p className="text-xs text-black/60 mt-1">1536 wymiarów, $0.02/1M tokenów</p>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-semibold text-sm">Funkcje</h4>
          </div>
          <p className="text-sm">Semantyczne wyszukiwanie</p>
          <p className="text-xs text-black/60 mt-1">Znajduje podobne znaczenia</p>
        </Card>

        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-semibold text-sm">Koszt</h4>
          </div>
          <p className="text-lg font-bold">~$0.01-0.05</p>
          <p className="text-xs text-black/60 mt-1">za 100 postów</p>
        </Card>
      </div>

      {/* How it works */}
      <Card className="p-4 bg-black/5 border-black/10 mb-6">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Jak to działa?
        </h4>
        <ol className="space-y-2 text-sm text-black/70">
          <li className="flex gap-2">
            <Badge className="rounded-full bg-[#C44E35] text-white border-0 px-2 py-0 h-5">1</Badge>
            <span>System pobiera wszystkie posty bez embeddingów</span>
          </li>
          <li className="flex gap-2">
            <Badge className="rounded-full bg-[#C44E35] text-white border-0 px-2 py-0 h-5">2</Badge>
            <span>Dla każdego posta generuje wektor 1536-wymiarowy używając OpenAI</span>
          </li>
          <li className="flex gap-2">
            <Badge className="rounded-full bg-[#C44E35] text-white border-0 px-2 py-0 h-5">3</Badge>
            <span>Zapisuje wektory w bazie danych (kolumna embedding w posts)</span>
          </li>
          <li className="flex gap-2">
            <Badge className="rounded-full bg-[#C44E35] text-white border-0 px-2 py-0 h-5">4</Badge>
            <span>Wyszukiwarka używa podobieństwa kosinusowego do znalezienia trafnych wyników</span>
          </li>
        </ol>
      </Card>

      {/* Generate Button */}
      <Button
        onClick={generateEmbeddings}
        disabled={isGenerating}
        className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 py-6 text-lg font-semibold"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
            Generuję embeddingi...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Wygeneruj embeddingi dla postów
          </>
        )}
      </Button>

      {/* Results */}
      {result && (
        <Card className="mt-6 p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-semibold">Sukces!</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-black/60">Przetworzonych:</span>
              <span className="font-semibold text-green-700">{result.processed} / {result.total}</span>
            </div>
            {result.failed > 0 && (
              <div className="flex justify-between">
                <span className="text-black/60">Błędów:</span>
                <span className="font-semibold text-red-600">{result.failed}</span>
              </div>
            )}
            <p className="text-xs text-black/60 mt-3 pt-3 border-t border-green-200">
              Embeddingi zostały wygenerowane i zapisane. Wyszukiwarka semantyczna jest teraz aktywna!
            </p>
          </div>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="mt-6 p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-semibold text-red-900">Błąd</h4>
          </div>
          <p className="text-sm text-red-700">{error}</p>
          <p className="text-xs text-red-600 mt-2">
            Sprawdź czy OPENAI_API_KEY jest poprawnie ustawiony w .env.local
          </p>
        </Card>
      )}

      {/* Info box */}
      <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">💡 Kiedy uruchamiać?</p>
            <ul className="space-y-1 text-xs">
              <li>• Po dodaniu nowych postów (batch co kilka dni)</li>
              <li>• Po zmianie treści postów</li>
              <li>• Jednorazowo przy pierwszym uruchomieniu</li>
              <li>• System przetwarza tylko posty bez embeddingów (max 100 na raz)</li>
            </ul>
          </div>
        </div>
      </Card>
    </Card>
  )
}
