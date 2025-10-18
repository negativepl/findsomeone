'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MODELS } from '@/lib/ai-models'

interface AISettings {
  id: string
  synonym_prompt: string
  synonym_system_message: string
  synonym_model: string
  synonym_max_synonyms: number
  synonym_min_synonyms: number
  category_synonym_prompt?: string
  category_synonym_system_message?: string
  category_synonym_model?: string
  category_synonym_max_synonyms?: number
  category_synonym_min_synonyms?: number
  category_seo_prompt?: string
  category_seo_system_message?: string
  category_seo_model?: string
  category_seo_max_length?: number
  category_seo_min_length?: number
  query_expansion_enabled: boolean
  query_expansion_prompt: string | null
  semantic_search_enabled: boolean
  semantic_search_model: string | null
  created_at: string
  updated_at: string
}

interface AISettingsManagerProps {
  initialSettings: AISettings | null
}

const DEFAULT_SETTINGS = {
  synonym_prompt: `You are an expert in Polish language and semantics. Your task is to generate synonyms for search queries in a local services classified ads platform (e.g., hydraulik/plumber, sprzątanie/cleaning, elektryk/electrician).

For the given terms, generate a list of synonyms that:
1. Are in Polish language
2. Have the same or very similar meaning
3. Can be used interchangeably in search engines
4. Include different forms (e.g., singular/plural, different job title variations)
5. Include local names and slang/jargon

Terms to analyze:
{terms}

Return the response in JSON format as an object with a "results" key containing an array:
{
  "results": [
    {
      "term": "original term",
      "synonyms": ["synonym1", "synonym2", "synonym3"],
      "context": "brief explanation of context (1-2 sentences in Polish)"
    }
  ]
}

IMPORTANT:
- Return ONLY valid JSON in object format (not array)
- Minimum 3, maximum 6 synonyms per term
- Synonyms should be in base form (e.g., "hydraulik", not "hydraulika")
- All synonyms and context must be in Polish language`,
  synonym_system_message: 'You are a Polish language expert. You return ONLY clean JSON without any additional comments or markdown formatting.',
  synonym_model: 'gpt-5-nano',
  synonym_max_synonyms: 6,
  synonym_min_synonyms: 3,
  category_synonym_prompt: `You are an expert in Polish language and service categorization. Your task is to generate synonyms for service categories in a local services classified ads platform.

For the given categories, generate a list of synonyms that:
1. Are in Polish language
2. Represent alternative names users might use when searching for this service
3. Include both formal and colloquial names
4. Include different grammatical forms and variations
5. Are in base form (nominative case, singular)

Categories to analyze:
{categories}

Return the response in JSON format as an object with a "suggestions" key containing an array:
{
  "suggestions": [
    {
      "categoryName": "category name",
      "categoryId": "category_id",
      "synonyms": ["synonym1", "synonym2", "synonym3"],
      "context": "brief explanation in Polish (1-2 sentences)"
    }
  ]
}

IMPORTANT:
- Return ONLY valid JSON in object format
- Minimum 3, maximum 7 synonyms per category
- All synonyms must be in Polish language
- Context should explain why these synonyms fit (in Polish)`,
  category_synonym_system_message: 'You are a Polish language and service categorization expert. You return ONLY clean JSON without any additional comments or markdown formatting.',
  category_synonym_model: 'gpt-5-nano',
  category_synonym_max_synonyms: 7,
  category_synonym_min_synonyms: 3,
}

export function AISettingsManager({ initialSettings }: AISettingsManagerProps) {
  const [settings, setSettings] = useState<AISettings | null>(initialSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<{
    current: number
    total: number
    categoryName: string
    status: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'search' | 'categories' | 'seo'>('search')

  // Form state - Search terms
  const [synonymPrompt, setSynonymPrompt] = useState(
    initialSettings?.synonym_prompt || DEFAULT_SETTINGS.synonym_prompt
  )
  const [synonymSystemMessage, setSynonymSystemMessage] = useState(
    initialSettings?.synonym_system_message || DEFAULT_SETTINGS.synonym_system_message
  )
  const [synonymModel, setSynonymModel] = useState(
    initialSettings?.synonym_model || DEFAULT_SETTINGS.synonym_model
  )
  const [synonymMaxSynonyms, setSynonymMaxSynonyms] = useState(
    initialSettings?.synonym_max_synonyms || DEFAULT_SETTINGS.synonym_max_synonyms
  )
  const [synonymMinSynonyms, setSynonymMinSynonyms] = useState(
    initialSettings?.synonym_min_synonyms || DEFAULT_SETTINGS.synonym_min_synonyms
  )

  // Form state - Categories
  const [categorySynonymPrompt, setCategorySynonymPrompt] = useState(
    initialSettings?.category_synonym_prompt || DEFAULT_SETTINGS.category_synonym_prompt
  )
  const [categorySynonymSystemMessage, setCategorySynonymSystemMessage] = useState(
    initialSettings?.category_synonym_system_message || DEFAULT_SETTINGS.category_synonym_system_message
  )
  const [categorySynonymModel, setCategorySynonymModel] = useState(
    initialSettings?.category_synonym_model || DEFAULT_SETTINGS.category_synonym_model
  )
  const [categorySynonymMaxSynonyms, setCategorySynonymMaxSynonyms] = useState(
    initialSettings?.category_synonym_max_synonyms || DEFAULT_SETTINGS.category_synonym_max_synonyms
  )
  const [categorySynonymMinSynonyms, setCategorySynonymMinSynonyms] = useState(
    initialSettings?.category_synonym_min_synonyms || DEFAULT_SETTINGS.category_synonym_min_synonyms
  )

  // Form state - SEO Descriptions
  const [seoPrompt, setSeoPrompt] = useState(
    initialSettings?.category_seo_prompt || ''
  )
  const [seoSystemMessage, setSeoSystemMessage] = useState(
    initialSettings?.category_seo_system_message || ''
  )
  const [seoModel, setSeoModel] = useState(
    initialSettings?.category_seo_model || 'gpt-5-nano'
  )
  const [seoMaxLength, setSeoMaxLength] = useState(
    initialSettings?.category_seo_max_length || 160
  )
  const [seoMinLength, setSeoMinLength] = useState(
    initialSettings?.category_seo_min_length || 120
  )

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/ai-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          synonym_prompt: synonymPrompt,
          synonym_system_message: synonymSystemMessage,
          synonym_model: synonymModel,
          synonym_max_synonyms: synonymMaxSynonyms,
          synonym_min_synonyms: synonymMinSynonyms,
          category_synonym_prompt: categorySynonymPrompt,
          category_synonym_system_message: categorySynonymSystemMessage,
          category_synonym_model: categorySynonymModel,
          category_synonym_max_synonyms: categorySynonymMaxSynonyms,
          category_synonym_min_synonyms: categorySynonymMinSynonyms,
          category_seo_prompt: seoPrompt,
          category_seo_system_message: seoSystemMessage,
          category_seo_model: seoModel,
          category_seo_max_length: seoMaxLength,
          category_seo_min_length: seoMinLength,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
        alert('✅ Ustawienia zostały zapisane!')
      } else {
        const error = await res.json()
        alert(error.error || 'Nie udało się zapisać ustawień')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Błąd podczas zapisywania ustawień')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateDescriptions = async () => {
    if (!confirm('Czy na pewno chcesz wygenerować/REGENEROWAĆ opisy dla WSZYSTKICH kategorii? To może potrwać kilka minut i zużyć tokeny AI.')) {
      return
    }

    setIsGenerating(true)
    setGenerationProgress({ current: 0, total: 0, categoryName: 'Inicjalizacja...', status: 'starting' })

    try {
      const res = await fetch('/api/admin/categories/generate-descriptions-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'all' }),
      })

      if (!res.ok) {
        throw new Error('Failed to start generation')
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No reader available')
      }

      let generated = 0
      let failed = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n\n')

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue

          try {
            const data = JSON.parse(line.substring(6))

            if (data.type === 'start') {
              setGenerationProgress({
                current: 0,
                total: data.total,
                categoryName: 'Rozpoczynam...',
                status: 'started'
              })
            } else if (data.type === 'progress') {
              setGenerationProgress({
                current: data.current,
                total: data.total,
                categoryName: data.categoryName,
                status: `Generuję (${data.categoryType})`
              })
            } else if (data.type === 'success') {
              generated++
            } else if (data.type === 'error') {
              failed++
            } else if (data.type === 'complete') {
              setGenerationProgress({
                current: data.generated + data.failed,
                total: data.generated + data.failed,
                categoryName: 'Zakończono!',
                status: 'complete'
              })

              setTimeout(() => {
                const errorMessage = data.errors?.length > 0 ? '\n\nBłędy:\n' + data.errors.slice(0, 3).join('\n') : ''
                alert(`✅ Wygenerowano ${data.generated} opisów!\nNie udało się: ${data.failed}${errorMessage}`)

                if (data.generated > 0) {
                  window.location.reload()
                }
              }, 500)
            }
          } catch (e) {
            console.error('Failed to parse SSE message:', e)
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate descriptions:', error)
      alert('Błąd podczas generowania opisów')
    } finally {
      setIsGenerating(false)
      setTimeout(() => setGenerationProgress(null), 2000)
    }
  }

  const handleReset = async () => {
    if (!confirm('Czy na pewno chcesz przywrócić ustawienia domyślne? Ta operacja jest nieodwracalna.')) {
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/ai-settings', {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
        setSynonymPrompt(data.settings.synonym_prompt)
        setSynonymSystemMessage(data.settings.synonym_system_message)
        setSynonymModel(data.settings.synonym_model)
        setSynonymMaxSynonyms(data.settings.synonym_max_synonyms)
        setSynonymMinSynonyms(data.settings.synonym_min_synonyms)
        setCategorySynonymPrompt(data.settings.category_synonym_prompt)
        setCategorySynonymSystemMessage(data.settings.category_synonym_system_message)
        setCategorySynonymModel(data.settings.category_synonym_model)
        setCategorySynonymMaxSynonyms(data.settings.category_synonym_max_synonyms)
        setCategorySynonymMinSynonyms(data.settings.category_synonym_min_synonyms)
        alert('✅ Przywrócono ustawienia domyślne!')
      } else {
        const error = await res.json()
        alert(error.error || 'Nie udało się przywrócić ustawień')
      }
    } catch (error) {
      console.error('Failed to reset settings:', error)
      alert('Błąd podczas przywracania ustawień')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-black/10">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'search'
              ? 'text-[#C44E35]'
              : 'text-black/60 hover:text-black'
          }`}
        >
          Terminy wyszukiwania
          {activeTab === 'search' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'categories'
              ? 'text-[#C44E35]'
              : 'text-black/60 hover:text-black'
          }`}
        >
          Synonimy kategorii
          {activeTab === 'categories' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'seo'
              ? 'text-[#C44E35]'
              : 'text-black/60 hover:text-black'
          }`}
        >
          Opisy SEO
          {activeTab === 'seo' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
          )}
        </button>
      </div>

      {activeTab === 'search' && (
        <>
      {/* Synonym Generation Settings */}
      <Card className="border-2 border-[#C44E35]/20 rounded-3xl bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C44E35]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl">Generowanie synonimów</CardTitle>
                <p className="text-sm text-black/60 mt-1">Konfiguracja promptu i modelu AI dla terminów wyszukiwania</p>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full border-[#C44E35]/20 bg-[#C44E35]/5 text-[#C44E35]">
              {synonymModel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Model selection */}
          <div>
            <Label htmlFor="model">Model AI</Label>
            <select
              id="model"
              value={synonymModel}
              onChange={(e) => setSynonymModel(e.target.value)}
              className="mt-2 w-full px-4 py-2 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C44E35]/20"
            >
              <option value={MODELS.GPT_5_NANO}>GPT-5 Nano (ultra-tani, szybki)</option>
              <option value={MODELS.GPT_5_MINI}>GPT-5 Mini (balans)</option>
              <option value={MODELS.GPT_5}>GPT-5 (najlepszy, najdroższy)</option>
            </select>
            <p className="text-xs text-black/40 mt-1">
              Wybierz model - GPT-5 nano jest wystarczający dla synonimów
            </p>
          </div>

          {/* Min/Max synonyms */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minSynonyms">Minimum synonimów</Label>
              <Input
                id="minSynonyms"
                type="number"
                value={synonymMinSynonyms}
                onChange={(e) => setSynonymMinSynonyms(parseInt(e.target.value))}
                min={1}
                max={10}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="maxSynonyms">Maksimum synonimów</Label>
              <Input
                id="maxSynonyms"
                type="number"
                value={synonymMaxSynonyms}
                onChange={(e) => setSynonymMaxSynonyms(parseInt(e.target.value))}
                min={1}
                max={15}
                className="mt-2"
              />
            </div>
          </div>

          {/* System message */}
          <div>
            <Label htmlFor="systemMessage">System Message</Label>
            <Textarea
              id="systemMessage"
              value={synonymSystemMessage}
              onChange={(e) => setSynonymSystemMessage(e.target.value)}
              rows={3}
              className="mt-2 font-mono text-sm"
            />
            <p className="text-xs text-black/40 mt-1">
              Instrukcja systemowa dla AI - określa zachowanie modelu
            </p>
          </div>

          {/* Prompt */}
          <div>
            <Label htmlFor="prompt">Prompt główny</Label>
            <Textarea
              id="prompt"
              value={synonymPrompt}
              onChange={(e) => setSynonymPrompt(e.target.value)}
              rows={20}
              className="mt-2 font-mono text-sm"
            />
            <p className="text-xs text-black/40 mt-1">
              Użyj <code className="bg-black/5 px-1 rounded">{'{terms}'}</code> jako placeholder dla terminów
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
            <Button
              onClick={handleReset}
              disabled={isLoading}
              variant="outline"
              className="rounded-full"
            >
              Przywróć domyślne
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A]"
            >
              {isSaving ? 'Zapisywanie...' : 'Zapisz ustawienia'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Future features placeholder */}
      <Card className="border-0 rounded-3xl bg-white opacity-50">
        <CardHeader>
          <CardTitle>Przyszłe funkcje AI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-black/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-black/20"></div>
              <span>Query Expansion - rozszerzanie zapytań</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-black/20"></div>
              <span>Semantic Search - wyszukiwanie semantyczne</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-black/20"></div>
              <span>Query Rewriting - poprawianie zapytań</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-black/20"></div>
              <span>Intent Recognition - rozpoznawanie intencji</span>
            </div>
          </div>
        </CardContent>
      </Card>

        </>
      )}

      {activeTab === 'categories' && (
        <>
      {/* Category Synonym Generation Settings */}
      <Card className="border-2 border-[#C44E35]/20 rounded-3xl bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C44E35]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl">Synonimy kategorii</CardTitle>
                <p className="text-sm text-black/60 mt-1">Konfiguracja promptu i modelu AI dla kategorii usług</p>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full border-[#C44E35]/20 bg-[#C44E35]/5 text-[#C44E35]">
              {categorySynonymModel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Model selection */}
          <div>
            <Label htmlFor="categoryModel">Model AI</Label>
            <select
              id="categoryModel"
              value={categorySynonymModel}
              onChange={(e) => setCategorySynonymModel(e.target.value)}
              className="mt-2 w-full px-4 py-2 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C44E35]/20"
            >
              <option value={MODELS.GPT_5_NANO}>GPT-5 Nano (ultra-tani, szybki)</option>
              <option value={MODELS.GPT_5_MINI}>GPT-5 Mini (balans)</option>
              <option value={MODELS.GPT_5}>GPT-5 (najlepszy, najdroższy)</option>
            </select>
            <p className="text-xs text-black/40 mt-1">
              Wybierz model - GPT-5 nano jest wystarczający dla synonimów kategorii
            </p>
          </div>

          {/* Min/Max synonyms */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryMinSynonyms">Minimum synonimów</Label>
              <Input
                id="categoryMinSynonyms"
                type="number"
                value={categorySynonymMinSynonyms}
                onChange={(e) => setCategorySynonymMinSynonyms(parseInt(e.target.value))}
                min={1}
                max={10}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="categoryMaxSynonyms">Maksimum synonimów</Label>
              <Input
                id="categoryMaxSynonyms"
                type="number"
                value={categorySynonymMaxSynonyms}
                onChange={(e) => setCategorySynonymMaxSynonyms(parseInt(e.target.value))}
                min={1}
                max={15}
                className="mt-2"
              />
            </div>
          </div>

          {/* System message */}
          <div>
            <Label htmlFor="categorySynonymSystemMessage">System Message</Label>
            <Textarea
              id="categorySynonymSystemMessage"
              value={categorySynonymSystemMessage}
              onChange={(e) => setCategorySynonymSystemMessage(e.target.value)}
              rows={3}
              className="mt-2 font-mono text-sm"
            />
            <p className="text-xs text-black/40 mt-1">
              Instrukcja systemowa dla AI - określa zachowanie modelu przy generowaniu synonimów kategorii
            </p>
          </div>

          {/* Prompt */}
          <div>
            <Label htmlFor="categoryPrompt">Prompt główny dla kategorii</Label>
            <Textarea
              id="categoryPrompt"
              value={categorySynonymPrompt}
              onChange={(e) => setCategorySynonymPrompt(e.target.value)}
              rows={20}
              className="mt-2 font-mono text-sm"
            />
            <p className="text-xs text-black/40 mt-1">
              Użyj <code className="bg-black/5 px-1 rounded">{'{categories}'}</code> jako placeholder dla listy kategorii
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
            <Button
              onClick={handleReset}
              disabled={isLoading}
              variant="outline"
              className="rounded-full"
            >
              Przywróć domyślne
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A]"
            >
              {isSaving ? 'Zapisywanie...' : 'Zapisz ustawienia'}
            </Button>
          </div>
        </CardContent>
      </Card>
        </>
      )}

      {activeTab === 'seo' && (
        <>
      {/* SEO Description Generation Settings */}
      <Card className="border-2 border-[#C44E35]/20 rounded-3xl bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C44E35]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl">Generowanie opisów SEO</CardTitle>
                <p className="text-sm text-black/60 mt-1">Automatyczne tworzenie opisów dla kategorii i podkategorii</p>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full border-[#C44E35]/20 bg-[#C44E35]/5 text-[#C44E35]">
              {seoModel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bulk Generate Button */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#C44E35]/5 to-[#C44E35]/10 border-2 border-[#C44E35]/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2">Generuj/Regeneruj opisy masowo</h4>
                <p className="text-sm text-black/70 mb-4">
                  Automatycznie wygeneruj lub regeneruj opisy SEO dla <strong>wszystkich</strong> kategorii i podkategorii.
                  AI stworzy unikalne, zoptymalizowane pod SEO opisy (120-160 znaków).
                </p>

                {/* Progress Bar */}
                {generationProgress && (
                  <div className="mb-4 p-4 rounded-xl bg-white border border-[#C44E35]/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-black">
                        {generationProgress.current} / {generationProgress.total}
                      </span>
                      <span className="text-xs text-black/60">{generationProgress.status}</span>
                    </div>
                    <div className="w-full bg-black/5 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-[#C44E35] h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-black/60 truncate">
                      <span className="font-medium">{generationProgress.categoryName}</span>
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-black/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Proces może potrwać kilka minut. Koszt: ~$0.001 per kategoria (GPT-5 Nano)</span>
                </div>
              </div>
              <Button
                onClick={handleGenerateDescriptions}
                disabled={isGenerating}
                className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white font-semibold ml-4"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generowanie...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Generuj wszystkie opisy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Model selection */}
          <div>
            <Label htmlFor="seoModel">Model AI</Label>
            <select
              id="seoModel"
              value={seoModel}
              onChange={(e) => setSeoModel(e.target.value)}
              className="mt-2 w-full px-4 py-2 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C44E35]/20"
            >
              <option value={MODELS.GPT_5_NANO}>GPT-5 Nano (ultra-tani, wystarczający)</option>
              <option value={MODELS.GPT_5_MINI}>GPT-5 Mini (lepsza jakość)</option>
              <option value={MODELS.GPT_5}>GPT-5 (najlepszy, najdroższy)</option>
            </select>
            <p className="text-xs text-black/40 mt-1">
              GPT-5 Nano jest wystarczający dla krótkich opisów SEO
            </p>
          </div>

          {/* Min/Max length */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seoMinLength">Minimalna długość (znaków)</Label>
              <Input
                id="seoMinLength"
                type="number"
                value={seoMinLength}
                onChange={(e) => setSeoMinLength(parseInt(e.target.value))}
                min={50}
                max={200}
                className="mt-2"
              />
              <p className="text-xs text-black/40 mt-1">Rekomendowane: 120</p>
            </div>
            <div>
              <Label htmlFor="seoMaxLength">Maksymalna długość (znaków)</Label>
              <Input
                id="seoMaxLength"
                type="number"
                value={seoMaxLength}
                onChange={(e) => setSeoMaxLength(parseInt(e.target.value))}
                min={50}
                max={300}
                className="mt-2"
              />
              <p className="text-xs text-black/40 mt-1">Rekomendowane: 160 (limit Google)</p>
            </div>
          </div>

          {/* System message */}
          <div>
            <Label htmlFor="seoSystemMessage">System Message</Label>
            <Textarea
              id="seoSystemMessage"
              value={seoSystemMessage}
              onChange={(e) => setSeoSystemMessage(e.target.value)}
              rows={3}
              className="mt-2 font-mono text-sm"
            />
            <p className="text-xs text-black/40 mt-1">
              Instrukcja systemowa dla AI
            </p>
          </div>

          {/* Prompt */}
          <div>
            <Label htmlFor="seoPrompt">Prompt główny dla opisów SEO</Label>
            <Textarea
              id="seoPrompt"
              value={seoPrompt}
              onChange={(e) => setSeoPrompt(e.target.value)}
              rows={20}
              className="mt-2 font-mono text-sm"
            />
            <p className="text-xs text-black/40 mt-1">
              Użyj <code className="bg-black/5 px-1 rounded">{'{categoryName}'}</code> i <code className="bg-black/5 px-1 rounded">{'{categoryType}'}</code> jako placeholders
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
            <Button
              onClick={handleReset}
              disabled={isLoading}
              variant="outline"
              className="rounded-full"
            >
              Przywróć domyślne
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A]"
            >
              {isSaving ? 'Zapisywanie...' : 'Zapisz ustawienia'}
            </Button>
          </div>
        </CardContent>
      </Card>
        </>
      )}

      {/* Debug info */}
      {settings && (
        <Card className="border-0 rounded-3xl bg-black/5">
          <CardHeader>
            <CardTitle className="text-sm">Informacje debugowania</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-black/60 font-mono space-y-1">
            <div>ID: {settings.id}</div>
            <div>Utworzono: {new Date(settings.created_at).toLocaleString('pl-PL')}</div>
            <div>Ostatnia aktualizacja: {new Date(settings.updated_at).toLocaleString('pl-PL')}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
