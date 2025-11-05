'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, Trash2, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface GenerationProgress {
  current: number
  total: number
  categoryName: string
  postType: string
  postNumber: number
  totalForCategory: number
}

interface Category {
  id: string
  name: string
  parent_id: string | null
  totalPosts: number
  aiPosts: number
  humanPosts: number
  subcategories?: Category[]
}

export default function ContentBotPanel() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoadingCount, setIsLoadingCount] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [aiPostsCount, setAiPostsCount] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null)
  const [generationStats, setGenerationStats] = useState<{
    generated: number
    failed: number
    errors: string[]
  } | null>(null)

  // Fetch data on mount
  useEffect(() => {
    fetchAiPostsCount()
    fetchCategories()
  }, [])

  const fetchAiPostsCount = async () => {
    setIsLoadingCount(true)
    try {
      const response = await fetch('/api/admin/content-bot/delete-all')
      const data = await response.json()

      if (data.success) {
        setAiPostsCount(data.count)
      }
    } catch (error) {
      console.error('Error fetching AI posts count:', error)
    } finally {
      setIsLoadingCount(false)
    }
  }

  const fetchCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const response = await fetch('/api/admin/content-bot/categories')
      const data = await response.json()

      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId)
    } else {
      newSelected.add(categoryId)
    }
    setSelectedCategories(newSelected)
  }

  const toggleCategoryExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const selectAll = () => {
    const allIds = new Set<string>()
    categories.forEach(cat => {
      allIds.add(cat.id)
      cat.subcategories?.forEach(sub => {
        allIds.add(sub.id)
        sub.subcategories?.forEach(sub3 => allIds.add(sub3.id))
      })
    })
    setSelectedCategories(allIds)
  }

  const deselectAll = () => {
    setSelectedCategories(new Set())
  }

  const handleGenerate = async () => {
    if (isGenerating) return

    const mode = selectedCategories.size === 0 ? 'all' : 'selected'
    const categoryIds = Array.from(selectedCategories)

    const confirmMessage = mode === 'all'
      ? 'Czy na pewno chcesz wygenerować ogłoszenia dla WSZYSTKICH kategorii?\n\nTo może zająć kilka minut.'
      : `Czy na pewno chcesz wygenerować ogłoszenia dla ${categoryIds.length} wybranych kategorii?\n\nTo może zająć kilka minut.`

    if (!confirm(confirmMessage)) {
      return
    }

    setIsGenerating(true)
    setGenerationProgress(null)
    setGenerationStats(null)

    try {
      const response = await fetch('/api/admin/content-bot/generate-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          categoryIds: mode === 'selected' ? categoryIds : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start generation')
      }

      // Read SSE stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'start') {
              setGenerationProgress({
                current: 0,
                total: data.total,
                categoryName: '',
                postType: '',
                postNumber: 0,
                totalForCategory: data.postsPerCategory,
              })
            } else if (data.type === 'progress') {
              setGenerationProgress({
                current: data.current,
                total: data.total,
                categoryName: data.categoryName,
                postType: data.postType,
                postNumber: data.postNumber,
                totalForCategory: data.totalForCategory,
              })
            } else if (data.type === 'complete') {
              setGenerationStats({
                generated: data.generated,
                failed: data.failed,
                errors: data.errors || [],
              })
              setGenerationProgress(null)
            }
          }
        }
      }

      // Refresh counts after generation
      await fetchAiPostsCount()
      await fetchCategories()
    } catch (error) {
      console.error('Error generating posts:', error)
      toast.error('Wystąpił błąd podczas generowania ogłoszeń', {
        description: 'Sprawdź połączenie i spróbuj ponownie'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteAll = async () => {
    if (aiPostsCount === 0) {
      toast.info('Brak postów AI do usunięcia', {
        description: 'Nie ma żadnych wygenerowanych ogłoszeń'
      })
      return
    }

    if (!confirm(`Czy na pewno chcesz usunąć wszystkie ${aiPostsCount} ogłoszeń wygenerowanych przez AI?\n\nTej operacji nie można cofnąć!`)) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch('/api/admin/content-bot/delete-all', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete AI posts')
      }

      toast.success(`Usunięto ${data.deleted} ogłoszeń AI`, {
        description: 'Ogłoszenia zostały trwale usunięte'
      })
      await fetchAiPostsCount()
      await fetchCategories()
      setGenerationStats(null)
    } catch (error) {
      console.error('Error deleting AI posts:', error)
      toast.error('Wystąpił błąd podczas usuwania ogłoszeń', {
        description: 'Spróbuj ponownie'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteByCategory = async () => {
    if (selectedCategories.size === 0) {
      toast.info('Wybierz kategorie', {
        description: 'Zaznacz kategorie, z których chcesz usunąć posty AI'
      })
      return
    }

    const categoryIds = Array.from(selectedCategories)

    if (!confirm(`Czy na pewno chcesz usunąć posty AI z ${categoryIds.length} wybranych kategorii?\n\nTej operacji nie można cofnąć!`)) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch('/api/admin/content-bot/delete-by-category', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryIds }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete AI posts')
      }

      toast.success(`Usunięto ${data.deleted} ogłoszeń AI`, {
        description: 'Ogłoszenia zostały usunięte z wybranych kategorii'
      })
      await fetchAiPostsCount()
      await fetchCategories()
      setSelectedCategories(new Set()) // Clear selection
    } catch (error) {
      console.error('Error deleting AI posts by category:', error)
      toast.error('Wystąpił błąd podczas usuwania ogłoszeń', {
        description: 'Spróbuj ponownie'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getTotalSelectedPosts = () => {
    if (selectedCategories.size === 0) {
      return categories.reduce((sum, cat) => {
        const catTotal = cat.totalPosts
        const sub2Total = cat.subcategories?.reduce((s, sub) => {
          const sub3Total = sub.subcategories?.reduce((s3, sub3) => s3 + sub3.totalPosts, 0) || 0
          return s + sub.totalPosts + sub3Total
        }, 0) || 0
        return sum + catTotal + sub2Total
      }, 0)
    }

    let total = 0
    categories.forEach(cat => {
      if (selectedCategories.has(cat.id)) {
        total += cat.totalPosts
      }
      cat.subcategories?.forEach(sub => {
        if (selectedCategories.has(sub.id)) {
          total += sub.totalPosts
        }
        sub.subcategories?.forEach(sub3 => {
          if (selectedCategories.has(sub3.id)) {
            total += sub3.totalPosts
          }
        })
      })
    })
    return total
  }

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Statystyki</h2>
              <p className="text-sm text-muted-foreground">Ogłoszenia wygenerowane przez AI</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                fetchAiPostsCount()
                fetchCategories()
              }}
              disabled={isLoadingCount || isLoadingCategories}
              className="rounded-full hover:bg-black/5"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingCount || isLoadingCategories ? 'animate-spin' : ''}`} />
            </Button>
          </div>


          <div className="text-5xl font-bold text-[#C44E35] mb-2">
            {isLoadingCount ? '...' : aiPostsCount.toLocaleString()}
          </div>
          <p className="text-sm text-black/60">aktywnych ogłoszeń AI</p>
        </div>
      </div>

      {/* Category Selection */}
      <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Wybierz kategorie</h2>
              <p className="text-sm text-muted-foreground">
                {selectedCategories.size === 0
                  ? 'Brak wyboru = wszystkie kategorie'
                  : `Wybrano: ${selectedCategories.size}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                disabled={isLoadingCategories}
                className="rounded-full text-xs border-black/20 hover:bg-black/5"
              >
                Zaznacz wszystkie
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deselectAll}
                disabled={isLoadingCategories}
                className="rounded-full text-xs border-black/20 hover:bg-black/5"
              >
                Odznacz wszystkie
              </Button>
            </div>
          </div>

          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="border border-border rounded-lg">
                {/* Parent Category */}
                <div className="flex items-center gap-3 p-3 hover:bg-muted transition-colors">
                  <Checkbox
                    checked={selectedCategories.has(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <button
                    onClick={() => toggleCategoryExpand(category.id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    {category.subcategories && category.subcategories.length > 0 && (
                      expandedCategories.has(category.id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )
                    )}
                    <span className="font-semibold text-foreground">{category.name}</span>
                  </button>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="px-2.5 py-1.5 bg-muted rounded-full">
                      <span className="text-foreground font-semibold">{category.totalPosts}</span>
                      <span className="text-muted-foreground ml-1">razem</span>
                    </div>
                    <div className="px-2.5 py-1.5 bg-purple-50 border border-purple-200 rounded-full">
                      <span className="text-purple-700 font-semibold">{category.aiPosts}</span>
                      <span className="text-purple-600 ml-1">AI</span>
                    </div>
                    <div className="px-2.5 py-1.5 bg-green-50 border border-green-200 rounded-full">
                      <span className="text-green-700 font-semibold">{category.humanPosts}</span>
                      <span className="text-green-600 ml-1">ludzie</span>
                    </div>
                  </div>
                </div>

                {/* Subcategories Level 2 */}
                {category.subcategories && category.subcategories.length > 0 && expandedCategories.has(category.id) && (
                  <div className="border-t border-border bg-muted/50">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id}>
                        {/* Level 2 Category */}
                        <div className="flex items-center gap-3 p-3 pl-8 hover:bg-black/5 transition-colors">
                          <Checkbox
                            checked={selectedCategories.has(subcategory.id)}
                            onCheckedChange={() => toggleCategory(subcategory.id)}
                          />
                          <button
                            onClick={() => toggleCategoryExpand(subcategory.id)}
                            className="flex items-center gap-2 flex-1 text-left"
                          >
                            {subcategory.subcategories && subcategory.subcategories.length > 0 && (
                              expandedCategories.has(subcategory.id) ? (
                                <ChevronDown className="h-4 w-4 text-black/60" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-black/60" />
                              )
                            )}
                            <span className="text-sm text-foreground">{subcategory.name}</span>
                          </button>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="px-2.5 py-1.5 bg-muted rounded-full">
                              <span className="text-foreground font-semibold">{subcategory.totalPosts}</span>
                              <span className="text-muted-foreground ml-1">razem</span>
                            </div>
                            <div className="px-2.5 py-1.5 bg-purple-50 border border-purple-200 rounded-full">
                              <span className="text-purple-700 font-semibold">{subcategory.aiPosts}</span>
                              <span className="text-purple-600 ml-1">AI</span>
                            </div>
                            <div className="px-2.5 py-1.5 bg-green-50 border border-green-200 rounded-full">
                              <span className="text-green-700 font-semibold">{subcategory.humanPosts}</span>
                              <span className="text-green-600 ml-1">ludzie</span>
                            </div>
                          </div>
                        </div>

                        {/* Subcategories Level 3 */}
                        {subcategory.subcategories && subcategory.subcategories.length > 0 && expandedCategories.has(subcategory.id) && (
                          <div className="bg-muted">
                            {subcategory.subcategories.map((subcat3) => (
                              <div
                                key={subcat3.id}
                                className="flex items-center gap-3 p-3 pl-16 hover:bg-black/5 transition-colors"
                              >
                                <Checkbox
                                  checked={selectedCategories.has(subcat3.id)}
                                  onCheckedChange={() => toggleCategory(subcat3.id)}
                                />
                                <span className="text-sm text-foreground flex-1">{subcat3.name}</span>
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="px-2.5 py-1.5 bg-muted rounded-full">
                                    <span className="text-foreground font-semibold">{subcat3.totalPosts}</span>
                                    <span className="text-muted-foreground ml-1">razem</span>
                                  </div>
                                  <div className="px-2.5 py-1.5 bg-purple-50 border border-purple-200 rounded-full">
                                    <span className="text-purple-700 font-semibold">{subcat3.aiPosts}</span>
                                    <span className="text-purple-600 ml-1">AI</span>
                                  </div>
                                  <div className="px-2.5 py-1.5 bg-green-50 border border-green-200 rounded-full">
                                    <span className="text-green-700 font-semibold">{subcat3.humanPosts}</span>
                                    <span className="text-green-600 ml-1">ludzie</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Generation Progress */}
      {generationProgress && (
        <div className="bg-card rounded-3xl shadow-sm overflow-hidden border border-[#C44E35]/30">
          <div className="p-6 space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="h-6 w-6 animate-spin text-[#C44E35]" />
              <div>
                <h3 className="text-2xl font-bold text-foreground">Generowanie w toku...</h3>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                Postów: {generationProgress.current} / {generationProgress.total}
              </span>
              <span className="text-muted-foreground">
                {Math.round((generationProgress.current / generationProgress.total) * 100)}%
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-[#C44E35] h-3 rounded-full transition-all duration-300"
                style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
              ></div>
            </div>

            {generationProgress.categoryName && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{generationProgress.categoryName}</span>
                  {' '}- {generationProgress.postType}
                  {' '}({generationProgress.postNumber}/{generationProgress.totalForCategory})
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generation Stats */}
      {generationStats && !isGenerating && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Generowanie zakończone!</h3>
          <div className="space-y-1 text-sm">
            <p className="text-green-800">
              ✓ Wygenerowano: <span className="font-semibold">{generationStats.generated}</span> ogłoszeń
            </p>
            {generationStats.failed > 0 && (
              <p className="text-red-600">
                ✗ Błędy: <span className="font-semibold">{generationStats.failed}</span>
              </p>
            )}
          </div>

          {generationStats.errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-xs font-medium text-red-900 mb-2">Szczegóły błędów:</p>
              <ul className="text-xs text-red-800 space-y-1">
                {generationStats.errors.slice(0, 5).map((error, index) => (
                  <li key={index} className="truncate">• {error}</li>
                ))}
                {generationStats.errors.length > 5 && (
                  <li className="text-red-600">... i {generationStats.errors.length - 5} więcej</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-black mb-1">Akcje</h2>
            <p className="text-sm text-black/60">Generuj lub usuń ogłoszenia AI</p>
          </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {selectedCategories.size > 0 && (
            <Button
              onClick={handleDeleteByCategory}
              disabled={isGenerating || isDeleting}
              variant="outline"
              className="flex-1 rounded-full border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-semibold py-6"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Usuwanie...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-5 w-5" />
                  Usuń AI z {selectedCategories.size} wybranych
                </>
              )}
            </Button>
          )}

          <Button
            onClick={handleDeleteAll}
            disabled={isGenerating || isDeleting || aiPostsCount === 0}
            variant="outline"
            className="flex-1 rounded-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold py-6"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Usuwanie...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-5 w-5" />
                Usuń wszystkie ogłoszenia AI ({aiPostsCount})
              </>
            )}
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || isDeleting}
            className="flex-1 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 font-semibold py-6"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generowanie...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                {selectedCategories.size === 0
                  ? 'Wygeneruj dla wszystkich kategorii'
                  : `Wygeneruj dla ${selectedCategories.size} wybranych`}
              </>
            )}
          </Button>
        </div>
        </div>
      </div>
    </div>
  )
}
