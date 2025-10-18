'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EditCategoryDialog } from './EditCategoryDialog'
import { EditSubcategoryDialog } from './EditSubcategoryDialog'
import { DeleteCategoryDialog } from './DeleteCategoryDialog'
import { CategoryIcon } from '@/lib/category-icons'
import { ChevronRight, ChevronDown } from 'lucide-react'

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
  const [selectedParentCategory, setSelectedParentCategory] = useState<Category | null>(null)

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

  const subcategories = selectedParentCategory
    ? getSubcategories(selectedParentCategory.id)
    : []

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

  return (
    <>
      {/* Breadcrumb / Back button */}
      {selectedParentCategory && (
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedParentCategory(null)}
            className="text-black/60 hover:text-black hover:bg-black/5 gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Powrót do kategorii głównych
          </Button>
        </div>
      )}

      {/* Main Categories Grid */}
      {!selectedParentCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {parentCategories.map((parent) => {
            const subCount = getSubcategories(parent.id).length

            return (
              <div
                key={parent.id}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FAF8F3] to-[#F5F1E8] border-2 border-black/5 hover:border-black/20 transition-all shadow-sm hover:shadow-md flex flex-col"
              >
                {/* Card Body - clickable */}
                <div
                  className="p-6 flex-1 cursor-pointer"
                  onClick={() => setSelectedParentCategory(parent)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-black/5 group-hover:bg-black/10 flex items-center justify-center transition-colors shrink-0">
                      <CategoryIcon iconName={parent.icon} className="w-7 h-7 text-black/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-black group-hover:text-black/80 transition-colors mb-1">
                        {parent.name}
                      </h3>
                      <p className="text-xs text-black/50">
                        {subCount} {subCount === 1 ? 'podkategoria' : 'podkategorii'}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-black/30 group-hover:text-black/50 transition-colors shrink-0" />
                  </div>

                  {parent.description && (
                    <p className="text-sm text-black/60 line-clamp-2">{parent.description}</p>
                  )}
                </div>

                {/* Card Footer - buttons */}
                <div className="border-t border-black/5 bg-black/[0.02] px-4 py-3 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeletingCategory(parent)
                    }}
                    className="rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 text-sm px-5"
                  >
                    Usuń
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingCategory(parent)
                    }}
                    className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 font-semibold text-sm px-5"
                  >
                    Edytuj
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Subcategories View */}
      {selectedParentCategory && (
        <div>
          {/* Header */}
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-[#FAF8F3] to-[#F5F1E8] border-2 border-black/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-black/5 flex items-center justify-center">
                <CategoryIcon iconName={selectedParentCategory.icon} className="w-8 h-8 text-black/70" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black mb-1">
                  {selectedParentCategory.name}
                </h2>
                <p className="text-sm text-black/60">
                  {subcategories.length} {subcategories.length === 1 ? 'podkategoria' : 'podkategorii'}
                </p>
              </div>
            </div>
          </div>

          {/* Subcategories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subcategories.map((sub) => (
              <div
                key={sub.id}
                className="rounded-xl bg-white border-2 border-black/5 hover:border-black/20 hover:shadow-sm transition-all flex flex-col"
              >
                {/* Card Body */}
                <div className="p-5 flex-1">
                  <h4 className="font-semibold text-base text-black mb-2">{sub.name}</h4>
                  <p className="text-xs text-black/40 mb-3 font-mono">
                    {sub.slug}
                  </p>
                  {sub.description && (
                    <p className="text-sm text-black/60">{sub.description}</p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="border-t border-black/5 bg-black/[0.02] px-4 py-3 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingCategory(sub)}
                    className="rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 text-sm px-5"
                  >
                    Usuń
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setEditingCategory(sub)}
                    className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 font-semibold text-sm px-5"
                  >
                    Edytuj
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {subcategories.length === 0 && (
            <div className="text-center py-12 rounded-xl border-2 border-dashed border-black/10">
              <p className="text-black/40">Brak podkategorii</p>
            </div>
          )}
        </div>
      )}

      {editingCategory && !editingCategory.parent_id && (
        <EditCategoryDialog
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onUpdated={handleCategoryUpdated}
        />
      )}

      {editingCategory && editingCategory.parent_id && (
        <EditSubcategoryDialog
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
