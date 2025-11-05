'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CategoryList } from '@/components/admin/CategoryList'
import { createClient } from '@/lib/supabase/client'

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
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Ładowanie kategorii...</div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Zarządzanie kategoriami</h1>
          <p className="text-muted-foreground">
            Dodawaj, edytuj i usuwaj kategorie ogłoszeń
          </p>
        </div>
      </div>

      {/* Categories List */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <CategoryList categories={categories} onCategoriesRefresh={fetchCategories} />
        </CardContent>
      </Card>
    </>
  )
}
