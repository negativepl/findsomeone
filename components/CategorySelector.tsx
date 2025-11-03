'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import * as LucideIcons from 'lucide-react'
const { ChevronRight, Check, ArrowLeft } = LucideIcons

interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  icon?: string
}

interface CategoryPath {
  id: string
  name: string
  slug: string
}

interface CategorySelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (categoryId: string, categoryPath: CategoryPath[]) => void
  selectedCategoryId?: string
}

// Get Lucide icon component from icon name string
const getCategoryIcon = (iconName?: string) => {
  if (!iconName) return LucideIcons.Grid3x3

  // Convert icon name to PascalCase (e.g., 'wrench' -> 'Wrench', 'zap' -> 'Zap')
  const pascalCase = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  // Get the icon component from lucide-react
  const IconComponent = (LucideIcons as any)[pascalCase]

  return IconComponent || LucideIcons.Grid3x3
}

export function CategorySelector({ open, onOpenChange, onSelect, selectedCategoryId }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryTree, setCategoryTree] = useState<Map<string | null, Category[]>>(new Map())
  const [currentParentId, setCurrentParentId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<CategoryPath[]>([])
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedCategoryId)
  const supabase = createClient()

  // Load all categories
  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id, icon')
        .order('display_order')

      if (data) {
        setCategories(data)

        // Build tree structure
        const tree = new Map<string | null, Category[]>()
        data.forEach(cat => {
          const parentId = cat.parent_id || null
          if (!tree.has(parentId)) {
            tree.set(parentId, [])
          }
          tree.get(parentId)!.push(cat)
        })
        setCategoryTree(tree)
      }
    }

    if (open) {
      loadCategories()
    }
  }, [open, supabase])

  const getCurrentCategories = () => {
    return categoryTree.get(currentParentId) || []
  }

  const hasChildren = (categoryId: string) => {
    return categoryTree.has(categoryId) && (categoryTree.get(categoryId)?.length || 0) > 0
  }

  const handleCategoryClick = (category: Category) => {
    if (hasChildren(category.id)) {
      // Navigate into subcategories
      setCurrentParentId(category.id)
      setBreadcrumbs([...breadcrumbs, { id: category.id, name: category.name, slug: category.slug }])
    } else {
      // Select this category (leaf node)
      setSelectedId(category.id)
    }
  }

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Go to root
      setCurrentParentId(null)
      setBreadcrumbs([])
    } else {
      // Go to specific breadcrumb
      const targetBreadcrumb = breadcrumbs[index]
      setCurrentParentId(targetBreadcrumb.id)
      setBreadcrumbs(breadcrumbs.slice(0, index + 1))
    }
  }

  const handleGoBack = () => {
    if (breadcrumbs.length === 0) return

    if (breadcrumbs.length === 1) {
      // Go back to root
      setCurrentParentId(null)
      setBreadcrumbs([])
    } else {
      // Go back to previous level
      const newBreadcrumbs = breadcrumbs.slice(0, -1)
      setCurrentParentId(newBreadcrumbs[newBreadcrumbs.length - 1].id)
      setBreadcrumbs(newBreadcrumbs)
    }
  }

  const handleConfirm = () => {
    if (selectedId) {
      // Build full path
      const path: CategoryPath[] = [...breadcrumbs]

      // Find the selected category in current view
      const selectedCategory = categories.find(c => c.id === selectedId)
      if (selectedCategory) {
        path.push({ id: selectedCategory.id, name: selectedCategory.name, slug: selectedCategory.slug })
      }

      onSelect(selectedId, path)
      onOpenChange(false)
    }
  }

  const currentCategories = getCurrentCategories()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col ">
        <DialogHeader className="pb-4 border-b border-black/5">
          <DialogTitle className="text-2xl font-bold text-black">Wybierz kategorię</DialogTitle>
        </DialogHeader>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-black/60 overflow-x-auto py-4 border-b border-black/5">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className="hover:text-[#C44E35] transition-colors whitespace-nowrap font-medium"
          >
            Wszystkie kategorie
          </button>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-[#C44E35]" />
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="hover:text-[#C44E35] transition-colors whitespace-nowrap font-medium"
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1 p-1">
            {/* Back button when in subcategories */}
            {breadcrumbs.length > 0 && (
              <button
                onClick={handleGoBack}
                className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left hover:bg-[#C44E35]/5 text-black/70 hover:text-[#C44E35] mb-2 border border-transparent hover:border-[#C44E35]/20"
              >
                <ArrowLeft className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Powrót</span>
              </button>
            )}

            {currentCategories.map((category) => {
              const isSelected = selectedId === category.id
              const hasSubcategories = hasChildren(category.id)
              const isMainCategory = breadcrumbs.length === 0 // Ikony tylko dla głównych kategorii
              const IconComponent = isMainCategory ? getCategoryIcon(category.icon) : null

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`
                    w-full flex items-center px-4 py-3 transition-all text-left border
                    ${isMainCategory ? 'gap-3' : 'justify-between'}
                    ${isSelected
                      ? 'bg-[#C44E35]/10 text-black font-medium border-[#C44E35]/30'
                      : 'hover:bg-[#C44E35]/5 text-black border-transparent hover:border-[#C44E35]/20'
                    }
                  `}
                >
                  {/* Ikona tylko dla głównych kategorii */}
                  {isMainCategory && IconComponent && (
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      isSelected ? 'bg-[#C44E35]/20' : 'bg-black/5 group-hover:bg-[#C44E35]/10'
                    }`}>
                      <IconComponent className={`w-5 h-5 transition-colors ${isSelected ? 'text-[#C44E35]' : 'text-black/60'}`} />
                    </div>
                  )}

                  <span className={`font-medium ${isMainCategory ? 'flex-1' : ''}`}>{category.name}</span>

                  {hasSubcategories ? (
                    <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isSelected ? 'text-[#C44E35]' : 'text-black/40'
                    }`} />
                  ) : isSelected ? (
                    <Check className="w-5 h-5 text-[#C44E35] flex-shrink-0" />
                  ) : null}
                </button>
              )
            })}
          </div>

          {currentCategories.length === 0 && (
            <div className="text-center py-8 text-black/60">
              Brak kategorii
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-black/5 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 px-6 border-2 border-black/10 hover:border-black/20"
          >
            Anuluj
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedId}
            className="h-11 px-8 bg-[#C44E35] hover:bg-[#B33D2A] text-white shadow-sm"
          >
            Potwierdź
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
