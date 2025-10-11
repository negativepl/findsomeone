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
  const [activeTab, setActiveTab] = useState<'search' | 'categories'>('search')

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
