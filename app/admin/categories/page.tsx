'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CategoryList } from '@/components/admin/CategoryList'
import { SortAlphabeticallyButton } from '@/components/admin/SortAlphabeticallyButton'
import { AddCategoryDialog } from '@/components/admin/AddCategoryDialog'
import { createClient } from '@/lib/supabase/client'
import { Search, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  parent_id: string | null
  created_at: string
  display_order?: number
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order')

    setCategories(data as Category[] || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return (
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-xl border p-0 gap-0 flex-1 flex flex-col overflow-hidden bg-card">
        <CardHeader className="h-20 flex flex-row items-center justify-between space-y-0 px-8 border-b flex-shrink-0">
          <div>
            <CardTitle className="text-base font-bold">Zarządzanie kategoriami</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Dodawaj, edytuj i usuwaj kategorie ogłoszeń</p>
          </div>
          <div className="flex items-center gap-3">
            <SortAlphabeticallyButton
              parentId={null}
              onSorted={fetchCategories}
            />
            <AddCategoryDialog
              parentId={null}
              onCategoryAdded={fetchCategories}
            />
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-1 overflow-y-auto flex flex-col bg-background">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-muted-foreground">Ładowanie kategorii...</div>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="mb-6 flex-shrink-0">
                <Card className="border bg-card">
                  <CardContent className="p-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Szukaj kategorii..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-10 h-12 text-base border border-input focus:border-ring bg-background"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Categories List */}
              <Card className="border bg-card flex-1 flex flex-col overflow-hidden">
                <CardContent className="p-6 flex-1 overflow-auto">
                  <CategoryList
                    categories={categories}
                    onCategoriesRefresh={fetchCategories}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
