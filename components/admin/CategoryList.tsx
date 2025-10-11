'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EditCategoryDialog } from './EditCategoryDialog'
import { DeleteCategoryDialog } from './DeleteCategoryDialog'
import { CategoryIcon } from '@/lib/category-icons'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  parent_id: string | null
  created_at: string
}

interface CategoryListProps {
  categories: Category[]
}

export function CategoryList({ categories: initialCategories }: CategoryListProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setCategories(categories.map(cat =>
      cat.id === updatedCategory.id ? updatedCategory : cat
    ))
    setEditingCategory(null)
  }

  const handleCategoryDeleted = (deletedId: string) => {
    setCategories(categories.filter(cat => cat.id !== deletedId))
    setDeletingCategory(null)
  }

  // Organize categories by parent/child
  const parentCategories = categories.filter(cat => !cat.parent_id)
  const getSubcategories = (parentId: string) =>
    categories.filter(cat => cat.parent_id === parentId)

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-black/5 flex items-center justify-center">
          <svg className="w-8 h-8 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <p className="text-lg text-black/60">Brak kategorii</p>
      </div>
    )
  }

  const renderCategory = (category: Category, isSubcategory = false) => (
    <div
      key={category.id}
      className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F3] hover:bg-[#F5F1E8] transition-all ${
        isSubcategory ? 'ml-8 border-l-4 border-black/10' : ''
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <CategoryIcon iconName={category.icon} className="w-5 h-5 text-black/60" />
          <h3 className="font-semibold text-black">{category.name}</h3>
          {isSubcategory && (
            <span className="text-xs bg-black/10 text-black/60 px-2 py-0.5 rounded-full">
              Podkategoria
            </span>
          )}
        </div>
        <p className="text-sm text-black/60 mb-1">
          Slug: <code className="bg-black/5 px-2 py-0.5 rounded">{category.slug}</code>
        </p>
        {category.description && (
          <p className="text-sm text-black/60">{category.description}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditingCategory(category)}
          className="rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5"
        >
          Edytuj
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeletingCategory(category)}
          className="rounded-full border-2 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
        >
          Usuń
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <div className="space-y-3">
        {parentCategories.map((parent) => {
          const subcategories = getSubcategories(parent.id)
          return (
            <div key={parent.id} className="space-y-2">
              {renderCategory(parent, false)}
              {subcategories.map((sub) => renderCategory(sub, true))}
            </div>
          )
        })}
      </div>

      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onUpdated={handleCategoryUpdated}
        />
      )}

      {deletingCategory && (
        <DeleteCategoryDialog
          category={deletingCategory}
          onClose={() => setDeletingCategory(null)}
          onDeleted={handleCategoryDeleted}
        />
      )}
    </>
  )
}
