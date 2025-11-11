'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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

export function CategoriesClient() {
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

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Ładowanie kategorii...</div>
      </div>
    )
  }

  return (
    <>
      {/* Search Bar and Actions */}
      <div className="space-y-4 mb-6 flex-shrink-0">
        {/* Search Bar */}
        <Card className="border bg-background">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Szukaj kategorii..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-10 h-12 text-base border border-input focus:border-brand/40 bg-background"
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

        {/* Action Buttons */}
        {!searchQuery && (
          <Card className="border bg-background">
            <CardContent className="p-4">
              <div className="flex items-center justify-end gap-3">
                <SortAlphabeticallyButton
                  parentId={null}
                  onSorted={fetchCategories}
                />
                <AddCategoryDialog
                  parentId={null}
                  onCategoryAdded={fetchCategories}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Categories List */}
      <Card className="border bg-background flex-1 flex flex-col overflow-hidden">
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
  )
}
