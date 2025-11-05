'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { EditCategoryDialog } from './EditCategoryDialog'
import { EditSubcategoryDialog } from './EditSubcategoryDialog'
import { DeleteCategoryDialog } from './DeleteCategoryDialog'
import { SortAlphabeticallyButton } from './SortAlphabeticallyButton'
import { AddCategoryDialog } from './AddCategoryDialog'
import { CategoryIcon } from '@/lib/category-icons'
import { ChevronRight, ChevronLeft, GripVertical, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

interface CategoryListProps {
  categories: Category[]
  onCategoriesRefresh?: () => void
}

function SortableCategory({
  category,
  onClick,
  onEdit,
  onDelete,
  subCount
}: {
  category: Category
  onClick: () => void
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
  subCount: number
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl bg-card border border-border hover:border-border shadow-sm hover:shadow-md flex items-center gap-4 p-4 cursor-pointer ${isDragging ? '' : 'transition-all'}`}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={`p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground ${isDragging ? '' : 'transition-colors'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Arrow - moved to left */}
      <ChevronRight className={`w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0 ${isDragging ? '' : 'transition-colors'}`} />

      {/* Icon */}
      <div className={`w-12 h-12 rounded-lg bg-muted group-hover:bg-muted flex items-center justify-center shrink-0 ${isDragging ? '' : 'transition-colors'}`}>
        <CategoryIcon iconName={category.icon} className="w-6 h-6 text-foreground" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-bold text-base text-foreground group-hover:text-foreground ${isDragging ? '' : 'transition-colors'}`}>
            {category.name}
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {category.slug}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {subCount} {subCount === 1 ? 'podkategoria' : 'podkategorii'}
          </p>
          {category.description && (
            <>
              <span className="text-muted-foreground">•</span>
              <p className="text-xs text-muted-foreground line-clamp-1">{category.description}</p>
            </>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="rounded-full border border-border hover:border-border hover:bg-muted text-xs px-4"
        >
          Usuń
        </Button>
        <Button
          size="sm"
          onClick={onEdit}
          className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 font-semibold text-xs px-4"
        >
          Edytuj
        </Button>
      </div>
    </div>
  )
}

function SortableSubcategory({
  category,
  onEdit,
  onDelete,
  onClick,
  hasChildren,
}: {
  category: Category
  onEdit: () => void
  onDelete: () => void
  onClick?: () => void
  hasChildren?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl bg-card border border-border hover:border-border shadow-sm hover:shadow-md flex items-center gap-4 p-4 ${hasChildren ? 'cursor-pointer' : ''} ${isDragging ? '' : 'transition-all'}`}
      onClick={hasChildren ? onClick : undefined}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={`p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground ${isDragging ? '' : 'transition-colors'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Arrow if has children - moved to left */}
      {hasChildren ? (
        <ChevronRight className={`w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0 ${isDragging ? '' : 'transition-colors'}`} />
      ) : (
        <div className="w-5 h-5 shrink-0" />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-semibold text-base text-foreground ${isDragging ? '' : 'transition-colors'}`}>{category.name}</h4>
          <span className="text-xs text-muted-foreground font-mono">
            {category.slug}
          </span>
          {hasChildren && (
            <span className="text-xs text-muted-foreground">
              • ma podkategorie
            </span>
          )}
        </div>
        {category.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">{category.description}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="rounded-full border border-border hover:border-border hover:bg-muted text-xs px-4"
        >
          Usuń
        </Button>
        <Button
          size="sm"
          onClick={onEdit}
          className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 font-semibold text-xs px-4"
        >
          Edytuj
        </Button>
      </div>
    </div>
  )
}

export function CategoryList({ categories: initialCategories, onCategoriesRefresh }: CategoryListProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [navigationPath, setNavigationPath] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update categories when prop changes (e.g., after sorting)
  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  const selectedParentCategory = useMemo(
    () => navigationPath.length > 0 ? navigationPath[navigationPath.length - 1] : null,
    [navigationPath]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  // Global search - finds matching categories at any level
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null

    const query = searchQuery.toLowerCase()
    const matches = categories.filter(cat =>
      cat.name.toLowerCase().includes(query) ||
      cat.slug.toLowerCase().includes(query) ||
      cat.description?.toLowerCase().includes(query)
    ).sort((a, b) => (a.display_order || 0) - (b.display_order || 0))

    return matches
  }, [categories, searchQuery])

  // Organize categories by parent/child - memoized for performance
  const parentCategories = useMemo(
    () => categories
      .filter(cat => !cat.parent_id)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
    [categories]
  )

  const getSubcategories = useMemo(
    () => (parentId: string) =>
      categories
        .filter(cat => cat.parent_id === parentId)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
    [categories]
  )

  const hasChildren = useMemo(
    () => (categoryId: string) => categories.some(cat => cat.parent_id === categoryId),
    [categories]
  )

  const subcategories = useMemo(
    () => selectedParentCategory ? getSubcategories(selectedParentCategory.id) : [],
    [selectedParentCategory, getSubcategories]
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const isMainCategory = !selectedParentCategory
    const items = isMainCategory ? parentCategories : subcategories

    const oldIndex = items.findIndex(cat => cat.id === active.id)
    const newIndex = items.findIndex(cat => cat.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(items, oldIndex, newIndex)

    // Update local state immediately for instant feedback
    const updatedCategories = [...categories]
    newOrder.forEach((cat, index) => {
      const catIndex = updatedCategories.findIndex(c => c.id === cat.id)
      if (catIndex !== -1) {
        updatedCategories[catIndex] = {
          ...updatedCategories[catIndex],
          display_order: (index + 1) * 10
        }
      }
    })
    setCategories(updatedCategories)

    // Debounce save to database
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const updates = newOrder.map((cat, index) => ({
          id: cat.id,
          display_order: (index + 1) * 10
        }))

        fetch('/api/admin/categories/reorder', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates })
        })
          .then(res => {
            if (res.ok) {
              toast.success('Kolejność zapisana', {
                duration: 2000,
              })
            } else {
              toast.error('Błąd podczas zapisywania kolejności')
            }
          })
          .catch(err => {
            console.error('Error updating category order:', err)
            toast.error('Błąd podczas zapisywania kolejności')
          })
      } catch (error) {
        console.error('Error updating category order:', error)
        toast.error('Błąd podczas zapisywania kolejności')
      }
    }, 300)
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <p className="text-lg text-muted-foreground">Brak kategorii</p>
      </div>
    )
  }

  return (
    <>
      {/* Search, Breadcrumbs and Sort Button */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Szukaj kategorii..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-10 h-12 text-base rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground"
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

        {/* Breadcrumbs, Add Button and Sort Button - hide when searching */}
        {!searchResults && (
          <div className="flex items-center justify-between gap-4">
            {navigationPath.length > 0 ? (
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => setNavigationPath([])}
                  className="text-muted-foreground hover:text-foreground hover:underline"
                >
                  Kategorie główne
                </button>
                {navigationPath.map((cat, index) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    {index === navigationPath.length - 1 ? (
                      <span className="font-semibold text-foreground">{cat.name}</span>
                    ) : (
                      <button
                        onClick={() => setNavigationPath(navigationPath.slice(0, index + 1))}
                        className="text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {cat.name}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div />
            )}
            <div className="flex gap-3">
              <SortAlphabeticallyButton
                parentId={selectedParentCategory?.id || null}
                onSorted={onCategoriesRefresh}
              />
              <AddCategoryDialog
                parentId={selectedParentCategory?.id || null}
                onCategoryAdded={onCategoriesRefresh}
              />
            </div>
          </div>
        )}
      </div>

      {/* Search Results - Global search across all categories */}
      {searchResults && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Znaleziono {searchResults.length} {searchResults.length === 1 ? 'kategorię' : searchResults.length < 5 ? 'kategorie' : 'kategorii'}
          </p>
          {searchResults.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">Brak kategorii pasujących do "{searchQuery}"</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {searchResults.map((cat) => {
                const parentCat = cat.parent_id ? categories.find(c => c.id === cat.parent_id) : null
                return (
                  <div
                    key={cat.id}
                    className="group relative rounded-xl bg-card border border-border hover:border-border shadow-sm hover:shadow-md flex items-center gap-4 p-4 transition-all"
                  >
                    {cat.icon && (
                      <div className="w-12 h-12 rounded-lg bg-muted group-hover:bg-muted flex items-center justify-center shrink-0 transition-colors">
                        <CategoryIcon iconName={cat.icon} className="w-6 h-6 text-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-base text-foreground">{cat.name}</h4>
                        <span className="text-xs text-muted-foreground font-mono">{cat.slug}</span>
                        {parentCat && (
                          <span className="text-xs text-muted-foreground">• w {parentCat.name}</span>
                        )}
                      </div>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingCategory(cat)}
                        className="rounded-full border border-border hover:border-border hover:bg-muted text-xs px-4"
                      >
                        Usuń
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setEditingCategory(cat)}
                        className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 font-semibold text-xs px-4"
                      >
                        Edytuj
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Categories Grid with Drag & Drop */}
      {!selectedParentCategory && !searchResults && (
        <>
          {parentCategories.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">Brak kategorii</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={parentCategories.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3">
                  {parentCategories.map((parent) => {
                    const subCount = getSubcategories(parent.id).length
                    return (
                      <SortableCategory
                        key={parent.id}
                        category={parent}
                        onClick={() => setNavigationPath([parent])}
                        onEdit={(e) => {
                          e.stopPropagation()
                          setEditingCategory(parent)
                        }}
                        onDelete={(e) => {
                          e.stopPropagation()
                          setDeletingCategory(parent)
                        }}
                        subCount={subCount}
                      />
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}

      {/* Subcategories View with Drag & Drop */}
      {selectedParentCategory && !searchResults && (
        <div>
          {/* Header with Back Button */}
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-[#FAF8F3] to-[#F5F1E8] border border-border">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => {
                  if (navigationPath.length > 1) {
                    setNavigationPath(navigationPath.slice(0, -1))
                  } else {
                    setNavigationPath([])
                  }
                }}
                variant="outline"
                className="rounded-full border border-border hover:border-border hover:bg-muted text-sm px-6 gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Cofnij
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {selectedParentCategory.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {subcategories.length} {subcategories.length === 1 ? 'podkategoria' : 'podkategorii'}
                </p>
              </div>
            </div>
          </div>

          {/* Subcategories Grid with Drag & Drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={subcategories.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-3">
                {subcategories.map((sub) => {
                  const subHasChildren = hasChildren(sub.id)
                  return (
                    <SortableSubcategory
                      key={sub.id}
                      category={sub}
                      onEdit={() => setEditingCategory(sub)}
                      onDelete={() => setDeletingCategory(sub)}
                      onClick={() => setNavigationPath([...navigationPath, sub])}
                      hasChildren={subHasChildren}
                    />
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>

          {subcategories.length === 0 && (
            <div className="text-center py-12 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">Brak podkategorii</p>
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
