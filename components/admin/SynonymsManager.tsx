'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface Synonym {
  id: string
  term: string
  synonym: string
  created_at: string
}

interface AISuggestion {
  term: string
  synonyms: string[]
  context: string
}

interface CategoryAISuggestion {
  categoryName: string
  categoryId: string
  synonyms: string[]
  context: string
}

interface Category {
  id: string
  name: string
  slug: string
  category_synonyms: Array<{
    id: string
    synonym: string
    created_at: string
  }>
}

interface SynonymsManagerProps {
  initialSynonyms: Synonym[]
  initialCategories: Category[]
}

export function SynonymsManager({ initialSynonyms, initialCategories }: SynonymsManagerProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'categories'>('terms')
  const [synonyms, setSynonyms] = useState<Synonym[]>(initialSynonyms)
  const [newTerm, setNewTerm] = useState('')
  const [newSynonym, setNewSynonym] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set())
  const [generationMode, setGenerationMode] = useState<'trending' | 'popular' | 'custom'>('trending')
  const [customTerm, setCustomTerm] = useState('')
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set())
  const [expandingTerm, setExpandingTerm] = useState<string | null>(null)
  const [termSuggestions, setTermSuggestions] = useState<Record<string, AISuggestion[]>>({})

  // Category AI states
  const [categoryAiSuggestions, setCategoryAiSuggestions] = useState<CategoryAISuggestion[]>([])
  const [isGeneratingCategories, setIsGeneratingCategories] = useState(false)
  const [selectedCategorySuggestions, setSelectedCategorySuggestions] = useState<Set<string>>(new Set())
  const [showCategoryAIPanel, setShowCategoryAIPanel] = useState(false)
  const [expandingCategory, setExpandingCategory] = useState<string | null>(null)
  const [categorySuggestions, setCategorySuggestions] = useState<Record<string, CategoryAISuggestion[]>>({})

  const handleAdd = async () => {
    if (!newTerm.trim() || !newSynonym.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/synonyms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: newTerm.trim(), synonym: newSynonym.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setSynonyms([...synonyms, data.synonym])
        setNewTerm('')
        setNewSynonym('')
      }
    } catch (error) {
      console.error('Failed to add synonym:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/synonyms?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setSynonyms(synonyms.filter(s => s.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete synonym:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateAI = async () => {
    setIsGenerating(true)
    setAiSuggestions([])
    try {
      const res = await fetch('/api/admin/synonyms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: generationMode,
          customTerm: generationMode === 'custom' ? customTerm : undefined
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.suggestions && data.suggestions.length > 0) {
          setAiSuggestions(data.suggestions)
          setShowAIPanel(true)
        } else {
          toast.info('Brak terminów do przetworzenia', {
            description: 'Spróbuj trybu "Własny termin" lub dodaj dane do wyszukiwarki.'
          })
        }
      } else {
        const error = await res.json()
        toast.error('Nie udało się wygenerować synonimów', {
          description: error.message || error.error || 'Spróbuj ponownie'
        })
      }
    } catch (error) {
      console.error('Failed to generate AI synonyms:', error)
      toast.error('Błąd podczas generowania synonimów', {
        description: 'Wystąpił problem z połączeniem'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApplySelected = async () => {
    const selected = aiSuggestions.filter(s => selectedSuggestions.has(s.term))
    if (selected.length === 0) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/synonyms/generate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestions: selected }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Synonimy zostały zapisane!', {
          description: 'Strona zostanie odświeżona'
        })
        // Refresh synonyms list
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to apply synonyms:', error)
      toast.error('Błąd podczas zapisywania synonimów', {
        description: 'Spróbuj ponownie'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSuggestion = (term: string) => {
    const newSelected = new Set(selectedSuggestions)
    if (newSelected.has(term)) {
      newSelected.delete(term)
    } else {
      newSelected.add(term)
    }
    setSelectedSuggestions(newSelected)
  }

  const toggleExpanded = (term: string) => {
    const newExpanded = new Set(expandedTerms)
    if (newExpanded.has(term)) {
      newExpanded.delete(term)
    } else {
      newExpanded.add(term)
    }
    setExpandedTerms(newExpanded)
  }

  // Category AI handlers
  const handleGenerateCategoryAI = async () => {
    setIsGeneratingCategories(true)
    setCategoryAiSuggestions([])
    try {
      const res = await fetch('/api/admin/category-synonyms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'all' }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.suggestions && data.suggestions.length > 0) {
          setCategoryAiSuggestions(data.suggestions)
          setShowCategoryAIPanel(true)
        } else {
          toast.info('Brak kategorii do przetworzenia', {
            description: 'Wszystkie kategorie mogą już mieć synonimy'
          })
        }
      } else {
        const error = await res.json()
        toast.error('Nie udało się wygenerować synonimów', {
          description: error.message || error.error || 'Spróbuj ponownie'
        })
      }
    } catch (error) {
      console.error('Failed to generate category synonyms:', error)
      toast.error('Błąd podczas generowania synonimów', {
        description: 'Wystąpił problem z połączeniem'
      })
    } finally {
      setIsGeneratingCategories(false)
    }
  }

  const handleApplyCategorySelected = async () => {
    const selected = categoryAiSuggestions.filter(s => selectedCategorySuggestions.has(s.categoryId))
    if (selected.length === 0) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/category-synonyms/generate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestions: selected }),
      })

      if (res.ok) {
        toast.success('Synonimy kategorii zostały zapisane!', {
          description: 'Strona zostanie odświeżona'
        })
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to apply category synonyms:', error)
      toast.error('Błąd podczas zapisywania synonimów', {
        description: 'Spróbuj ponownie'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCategorySuggestion = (categoryId: string) => {
    const newSelected = new Set(selectedCategorySuggestions)
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId)
    } else {
      newSelected.add(categoryId)
    }
    setSelectedCategorySuggestions(newSelected)
  }

  // Group synonyms by term
  const groupedSynonyms = synonyms.reduce((acc, syn) => {
    if (!acc[syn.term]) acc[syn.term] = []
    acc[syn.term].push(syn)
    return acc
  }, {} as Record<string, Synonym[]>)

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'terms'
              ? 'text-[#C44E35]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Terminy wyszukiwania
          {activeTab === 'terms' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'categories'
              ? 'text-[#C44E35]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Kategorie
          {activeTab === 'categories' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
          )}
        </button>
      </div>

      {activeTab === 'terms' && (
        <>
      {/* AI Synonym Generator */}
      <Card className="border border-[#C44E35]/20 rounded-3xl bg-gradient-to-br from-[#C44E35]/5 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C44E35]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl">Generator synonimów AI</CardTitle>
                <p className="text-sm text-muted-foreground mt-1 mb-2">Wykorzystuje GPT-5 nano do inteligentnego generowania synonimów</p>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full border-[#C44E35]/20 bg-[#C44E35]/5 text-[#C44E35]">
              GPT-5 nano
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={generationMode === 'trending' ? 'default' : 'outline'}
              onClick={() => setGenerationMode('trending')}
              className={generationMode === 'trending' ? 'rounded-full bg-[#C44E35] hover:bg-[#B33D2A]' : 'rounded-full'}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Trendy (7 dni)
            </Button>
            <Button
              variant={generationMode === 'popular' ? 'default' : 'outline'}
              onClick={() => setGenerationMode('popular')}
              className={generationMode === 'popular' ? 'rounded-full bg-[#C44E35] hover:bg-[#B33D2A]' : 'rounded-full'}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Popularne (30 dni)
            </Button>
            <Button
              variant={generationMode === 'custom' ? 'default' : 'outline'}
              onClick={() => setGenerationMode('custom')}
              className={generationMode === 'custom' ? 'rounded-full bg-[#C44E35] hover:bg-[#B33D2A]' : 'rounded-full'}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Własny termin
            </Button>
          </div>

          {generationMode === 'custom' && (
            <div>
              <Label htmlFor="customTerm">Własny termin do analizy</Label>
              <Input
                id="customTerm"
                value={customTerm}
                onChange={(e) => setCustomTerm(e.target.value)}
                placeholder="np. sprzątanie mieszkań"
                className="mt-2"
              />
            </div>
          )}

          <Button
            onClick={handleGenerateAI}
            disabled={isGenerating || (generationMode === 'custom' && !customTerm.trim())}
            className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A]"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Generowanie synonimów...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Wygeneruj synonimy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Suggestions Panel */}
      {showAIPanel && aiSuggestions.length > 0 && (
        <Card data-ai-panel className="border border-green-500/20 rounded-3xl bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Propozycje AI ({aiSuggestions.length})</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSuggestions(new Set(aiSuggestions.map(s => s.term)))}
                  className="rounded-full"
                  size="sm"
                >
                  Zaznacz wszystkie
                </Button>
                <Button
                  onClick={handleApplySelected}
                  disabled={selectedSuggestions.size === 0 || isLoading}
                  className="rounded-full bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  Zastosuj wybrane ({selectedSuggestions.size})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedSuggestions.has(suggestion.term)
                      ? 'border-green-500 bg-green-50'
                      : 'border-border hover:border-border'
                  }`}
                  onClick={() => toggleSuggestion(suggestion.term)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSuggestions.has(suggestion.term)}
                      onChange={() => toggleSuggestion(suggestion.term)}
                      className="mt-1 w-5 h-5 rounded border border-border text-green-600 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-foreground mb-1">{suggestion.term}</div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {suggestion.synonyms && Array.isArray(suggestion.synonyms) ? (
                          suggestion.synonyms.map((syn, i) => (
                            <Badge key={i} variant="secondary" className="rounded-full">
                              {syn}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Brak synonimów</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground italic">{suggestion.context || 'Brak kontekstu'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Synonym Manually */}
      <Card className="border-0 rounded-3xl bg-card shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-1">Dodaj synonym ręcznie</h2>
          <p className="text-sm text-muted-foreground mb-6">Wprowadź termin główny i jego synonim</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="term">Termin główny</Label>
              <Input
                id="term"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                placeholder="np. hydraulik"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="synonym">Synonim</Label>
              <Input
                id="synonym"
                value={newSynonym}
                onChange={(e) => setNewSynonym(e.target.value)}
                placeholder="np. instalator"
                className="mt-2"
              />
            </div>
          </div>
          <Button
            onClick={handleAdd}
            disabled={isLoading || !newTerm.trim() || !newSynonym.trim()}
            className="mt-4 rounded-full bg-[#C44E35] hover:bg-[#B33D2A]"
          >
            Dodaj synonim
          </Button>
        </CardContent>
      </Card>

      {/* Existing Synonyms */}
      <Card className="border-0 rounded-3xl bg-card shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-1">Istniejące synonimy ({synonyms.length})</h2>
          <p className="text-sm text-muted-foreground mb-6">Lista wszystkich aktywnych synonimów terminów</p>
          <div className="space-y-3">
            {Object.entries(groupedSynonyms).map(([term, syns]) => {
              const isExpanded = expandedTerms.has(term)
              const displayedSyns = isExpanded ? syns : syns.slice(0, 3)
              const hasMore = syns.length > 3

              return (
                <div key={term} className="border border-border rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{term}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          setExpandingTerm(term)
                          try {
                            const res = await fetch('/api/admin/synonyms/generate', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                mode: 'custom',
                                customTerm: term,
                                forceGenerate: true
                              }),
                            })
                            if (res.ok) {
                              const data = await res.json()
                              if (data.suggestions && data.suggestions.length > 0) {
                                // Filter out synonyms that already exist for this term
                                const existingSynonyms = new Set(
                                  syns.map(s => s.synonym.toLowerCase().trim())
                                )

                                const filteredSuggestions = data.suggestions.map((suggestion: AISuggestion) => ({
                                  ...suggestion,
                                  synonyms: suggestion.synonyms.filter(
                                    syn => !existingSynonyms.has(syn.toLowerCase().trim())
                                  )
                                })).filter((suggestion: AISuggestion) => suggestion.synonyms.length > 0)

                                if (filteredSuggestions.length > 0) {
                                  setTermSuggestions(prev => ({
                                    ...prev,
                                    [term]: filteredSuggestions
                                  }))
                                } else {
                                  toast.info('AI wygenerowało tylko synonimy które już istnieją', {
                                    description: 'Spróbuj dodać ręcznie inne warianty'
                                  })
                                }
                              } else {
                                toast.info('AI wygenerowało takie same synonimy', {
                                  description: data.message || 'Brak nowych sugestii'
                                })
                              }
                            }
                          } catch (error) {
                            console.error('Failed to expand:', error)
                            toast.error('Błąd podczas generowania synonimów', {
                              description: 'Spróbuj ponownie'
                            })
                          } finally {
                            setExpandingTerm(null)
                          }
                        }}
                        disabled={expandingTerm === term}
                        className="text-xs text-[#C44E35] hover:text-[#B33D2A] font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#C44E35]/5 transition-colors disabled:opacity-50"
                      >
                        {expandingTerm === term ? (
                          <div className="w-3 h-3 border border-[#C44E35]/20 border-t-[#C44E35] rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        )}
                        {expandingTerm === term ? 'Generowanie...' : 'Rozszerz AI'}
                      </button>
                      <span className="text-xs text-muted-foreground">{syns.length} {syns.length === 1 ? 'synonim' : 'synonimów'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayedSyns.map((syn) => (
                      <div
                        key={syn.id}
                        className="inline-flex items-center gap-2 bg-black/5 rounded-full px-4 py-2"
                      >
                        <span className="text-sm text-foreground">{syn.synonym}</span>
                        <button
                          onClick={() => handleDelete(syn.id)}
                          disabled={isLoading}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  {hasMore && (
                    <button
                      onClick={() => toggleExpanded(term)}
                      className="mt-3 text-sm text-[#C44E35] hover:text-[#B33D2A] font-medium flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          Zwiń
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          Pokaż więcej ({syns.length - 3})
                        </>
                      )}
                    </button>
                  )}

                  {/* AI Suggestions for this term */}
                  {termSuggestions[term] && termSuggestions[term].length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-green-800 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          Propozycje AI
                        </div>
                        <button
                          onClick={() => {
                            setTermSuggestions(prev => {
                              const newSuggestions = { ...prev }
                              delete newSuggestions[term]
                              return newSuggestions
                            })
                          }}
                          className="text-xs text-muted-foreground hover:text-muted-foreground"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {termSuggestions[term].map((suggestion, idx) => (
                        <div key={idx} className="mb-3 last:mb-0">
                          <div className="flex flex-wrap gap-2 mb-1">
                            {suggestion.synonyms && Array.isArray(suggestion.synonyms) ? (
                              suggestion.synonyms.map((syn, i) => (
                                <Badge key={i} variant="secondary" className="rounded-full bg-green-100 text-green-800 border-green-200">
                                  {syn}
                                </Badge>
                              ))
                            ) : null}
                          </div>
                          <p className="text-xs text-green-700 italic">{suggestion.context}</p>
                          <button
                            onClick={async () => {
                              setIsLoading(true)
                              try {
                                const res = await fetch('/api/admin/synonyms/generate', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ suggestions: [suggestion] }),
                                })
                                if (res.ok) {
                                  window.location.reload()
                                }
                              } catch (error) {
                                console.error('Failed to apply:', error)
                              } finally {
                                setIsLoading(false)
                              }
                            }}
                            disabled={isLoading}
                            className="mt-2 text-xs text-green-700 hover:text-green-900 font-medium px-3 py-1 bg-green-100 hover:bg-green-200 rounded-full transition-colors"
                          >
                            Dodaj te synonimy
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {synonyms.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                Brak synonimów. Dodaj pierwszy powyżej!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
        </>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* AI Category Synonym Generator */}
          <Card className="border border-[#C44E35]/20 rounded-3xl bg-gradient-to-br from-[#C44E35]/5 to-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C44E35]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl">Generator synonimów kategorii AI</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 mb-2">Automatycznie generuj synonimy dla wszystkich kategorii</p>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-full border-[#C44E35]/20 bg-[#C44E35]/5 text-[#C44E35]">
                  GPT-5 nano
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGenerateCategoryAI}
                disabled={isGeneratingCategories || initialCategories.length === 0}
                className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A]"
              >
                {isGeneratingCategories ? (
                  <>
                    <div className="w-4 h-4 border border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Generowanie synonimów dla kategorii...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Wygeneruj synonimy dla wszystkich kategorii
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* AI Category Suggestions Panel */}
          {showCategoryAIPanel && categoryAiSuggestions.length > 0 && (
            <Card data-ai-panel className="border border-green-500/20 rounded-3xl bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Propozycje AI dla kategorii ({categoryAiSuggestions.length})</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCategorySuggestions(new Set(categoryAiSuggestions.map(s => s.categoryId)))}
                      className="rounded-full"
                      size="sm"
                    >
                      Zaznacz wszystkie
                    </Button>
                    <Button
                      onClick={handleApplyCategorySelected}
                      disabled={selectedCategorySuggestions.size === 0 || isLoading}
                      className="rounded-full bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Zastosuj wybrane ({selectedCategorySuggestions.size})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryAiSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedCategorySuggestions.has(suggestion.categoryId)
                          ? 'border-green-500 bg-green-50'
                          : 'border-border hover:border-border'
                      }`}
                      onClick={() => toggleCategorySuggestion(suggestion.categoryId)}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCategorySuggestions.has(suggestion.categoryId)}
                          onChange={() => toggleCategorySuggestion(suggestion.categoryId)}
                          className="mt-1 w-5 h-5 rounded border border-border text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-foreground mb-1">{suggestion.categoryName}</div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {suggestion.synonyms && Array.isArray(suggestion.synonyms) ? (
                              suggestion.synonyms.map((syn, i) => (
                                <Badge key={i} variant="secondary" className="rounded-full">
                                  {syn}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">Brak synonimów</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground italic">{suggestion.context || 'Brak kontekstu'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 rounded-3xl bg-card shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">Synonimy kategorii ({initialCategories.length})</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Dodaj synonimy do kategorii aby użytkownicy łatwiej je znajdowali. Np. dla kategorii "Hydraulik" dodaj: "instalator", "monter"
              </p>
              <div className="space-y-3">
                {initialCategories.map((category) => (
                  <div key={category.id} className="border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            setExpandingCategory(category.id)
                            try {
                              const res = await fetch('/api/admin/category-synonyms/generate', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  mode: 'single',
                                  categoryId: category.id,
                                  forceGenerate: true
                                }),
                              })
                              if (res.ok) {
                                const data = await res.json()
                                if (data.suggestions && data.suggestions.length > 0) {
                                  // Filter out synonyms that already exist for this category
                                  const existingSynonyms = new Set(
                                    (category.category_synonyms || []).map(s => s.synonym.toLowerCase().trim())
                                  )

                                  const filteredSuggestions = data.suggestions.map((suggestion: CategoryAISuggestion) => ({
                                    ...suggestion,
                                    synonyms: suggestion.synonyms.filter(
                                      syn => !existingSynonyms.has(syn.toLowerCase().trim())
                                    )
                                  })).filter((suggestion: CategoryAISuggestion) => suggestion.synonyms.length > 0)

                                  if (filteredSuggestions.length > 0) {
                                    setCategorySuggestions(prev => ({
                                      ...prev,
                                      [category.id]: filteredSuggestions
                                    }))
                                  } else {
                                    toast.info('AI wygenerowało tylko synonimy które już istnieją', {
                                      description: 'Spróbuj dodać ręcznie inne warianty'
                                    })
                                  }
                                } else {
                                  toast.info('AI nie wygenerowało nowych synonimów', {
                                    description: data.message || 'Brak nowych sugestii'
                                  })
                                }
                              }
                            } catch (error) {
                              console.error('Failed to expand category:', error)
                              toast.error('Błąd podczas generowania synonimów', {
                                description: 'Spróbuj ponownie'
                              })
                            } finally {
                              setExpandingCategory(null)
                            }
                          }}
                          disabled={expandingCategory === category.id}
                          className="text-xs text-[#C44E35] hover:text-[#B33D2A] font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#C44E35]/5 transition-colors disabled:opacity-50"
                        >
                          {expandingCategory === category.id ? (
                            <div className="w-3 h-3 border border-[#C44E35]/20 border-t-[#C44E35] rounded-full animate-spin" />
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          )}
                          {expandingCategory === category.id ? 'Generowanie...' : 'Rozszerz AI'}
                        </button>
                        <span className="text-xs text-muted-foreground">
                          {category.category_synonyms?.length || 0} {(category.category_synonyms?.length || 0) === 1 ? 'synonim' : 'synonimów'}
                        </span>
                      </div>
                    </div>
                    {category.category_synonyms && category.category_synonyms.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {category.category_synonyms.map((syn) => (
                          <div
                            key={syn.id}
                            className="inline-flex items-center gap-2 bg-black/5 rounded-full px-4 py-2"
                          >
                            <span className="text-sm text-foreground">{syn.synonym}</span>
                            <button
                              onClick={async () => {
                                if (!confirm('Czy na pewno chcesz usunąć ten synonim?')) return
                                try {
                                  const res = await fetch(`/api/admin/category-synonyms?id=${syn.id}`, {
                                    method: 'DELETE'
                                  })
                                  if (res.ok) {
                                    toast.success('Synonim usunięty!')
                                    window.location.reload()
                                  } else {
                                    toast.error('Błąd podczas usuwania synonimu', {
                                      description: 'Spróbuj ponownie'
                                    })
                                  }
                                } catch (error) {
                                  console.error('Failed to delete:', error)
                                  toast.error('Błąd podczas usuwania synonimu', {
                                    description: 'Wystąpił problem z połączeniem'
                                  })
                                }
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* AI Suggestions for this category */}
                    {categorySuggestions[category.id] && categorySuggestions[category.id].length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold text-green-800 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            Propozycje AI
                          </div>
                          <button
                            onClick={() => {
                              setCategorySuggestions(prev => {
                                const newSuggestions = { ...prev }
                                delete newSuggestions[category.id]
                                return newSuggestions
                              })
                            }}
                            className="text-xs text-muted-foreground hover:text-muted-foreground"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        {categorySuggestions[category.id].map((suggestion, idx) => (
                          <div key={idx} className="mb-3 last:mb-0">
                            <div className="flex flex-wrap gap-2 mb-1">
                              {suggestion.synonyms && Array.isArray(suggestion.synonyms) ? (
                                suggestion.synonyms.map((syn, i) => (
                                  <Badge key={i} variant="secondary" className="rounded-full bg-green-100 text-green-800 border-green-200">
                                    {syn}
                                  </Badge>
                                ))
                              ) : null}
                            </div>
                            <p className="text-xs text-green-700 italic">{suggestion.context}</p>
                            <button
                              onClick={async () => {
                                setIsLoading(true)
                                try {
                                  const res = await fetch('/api/admin/category-synonyms/generate', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ suggestions: [suggestion] }),
                                  })
                                  if (res.ok) {
                                    window.location.reload()
                                  }
                                } catch (error) {
                                  console.error('Failed to apply category synonym:', error)
                                } finally {
                                  setIsLoading(false)
                                }
                              }}
                              disabled={isLoading}
                              className="mt-2 text-xs text-green-700 hover:text-green-900 font-medium px-3 py-1 bg-green-100 hover:bg-green-200 rounded-full transition-colors"
                            >
                              Dodaj te synonimy
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={async () => {
                        const synonym = prompt('Wprowadź synonim dla kategorii "' + category.name + '":')
                        if (!synonym || !synonym.trim()) return

                        try {
                          const res = await fetch('/api/admin/category-synonyms', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              categoryId: category.id,
                              synonym: synonym.trim()
                            })
                          })
                          if (res.ok) {
                            toast.success('Synonim dodany!')
                            window.location.reload()
                          } else {
                            const error = await res.json()
                            toast.error('Błąd podczas dodawania synonimu', {
                              description: error.error || 'Spróbuj ponownie'
                            })
                          }
                        } catch (error) {
                          console.error('Failed to add category synonym:', error)
                          toast.error('Błąd podczas dodawania synonimu', {
                            description: 'Wystąpił problem z połączeniem'
                          })
                        }
                      }}
                      className="text-sm text-[#C44E35] hover:text-[#B33D2A] font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Dodaj synonim
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
