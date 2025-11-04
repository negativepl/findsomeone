'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { HomepageSection, SECTION_TYPES } from '@/lib/homepage-sections/types'
import { SortableSection } from './SortableSection'
import { SectionEditor } from './SectionEditor'
import { AddSectionDialog } from './AddSectionDialog'
import { Button } from '@/components/ui/button'
import {
  useHomepageSections,
  useUpdateSection,
  useDeleteSection,
  useCreateSection,
  useReorderSections,
  useToggleSectionActive,
} from '@/lib/hooks/useHomepageSections'

interface PageBuilderClientProps {
  initialSections: HomepageSection[]
  categories: { id: string; name: string }[]
}

export function PageBuilderClient({ initialSections, categories }: PageBuilderClientProps) {
  const { data: sections = initialSections, isLoading } = useHomepageSections()
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const updateSection = useUpdateSection()
  const deleteSection = useDeleteSection()
  const createSection = useCreateSection()
  const reorderSections = useReorderSections()
  const toggleActive = useToggleSectionActive()

  // Prevent SSR hydration mismatch with @dnd-kit
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Memoize sensors to prevent recreating on every render
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over.id)

      const newSections = arrayMove(sections, oldIndex, newIndex).map((section, index) => ({
        ...section,
        sort_order: index
      }))

      // Optimistic update via React Query
      reorderSections.mutate(newSections)
    }
  }, [sections, reorderSections])

  const handleToggleActive = useCallback((section: HomepageSection) => {
    toggleActive.mutate({
      id: section.id,
      is_active: !section.is_active,
    })
  }, [toggleActive])

  const handleDelete = useCallback((sectionId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę sekcję?')) {
      return
    }

    deleteSection.mutate(sectionId)
  }, [deleteSection])

  // Memoize section IDs array for SortableContext
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections])

  const handleSaveSection = (updatedSection: HomepageSection) => {
    updateSection.mutate(
      {
        id: updatedSection.id,
        updates: {
          title: updatedSection.title,
          subtitle: updatedSection.subtitle,
          config: updatedSection.config,
          background_color: updatedSection.background_color,
          text_color: updatedSection.text_color,
          visible_on_mobile: updatedSection.visible_on_mobile,
          visible_on_desktop: updatedSection.visible_on_desktop,
        },
      },
      {
        onSuccess: () => {
          setEditingSection(null)
        },
      }
    )
  }

  const handleAddSection = (newSection: Omit<HomepageSection, 'id' | 'created_at' | 'updated_at'>) => {
    createSection.mutate(
      {
        ...newSection,
        sort_order: sections.length,
      },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false)
        },
      }
    )
  }

  const handlePublish = () => {
    // Force refresh z serwera - revalidate cache
    window.location.href = '/'
  }

  // If editing a section, show edit view instead of list
  if (editingSection) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-black/10 bg-gradient-to-r from-[#C44E35]/5 to-transparent">
            <button
              onClick={() => setEditingSection(null)}
              className="text-black/60 hover:text-[#C44E35] flex items-center gap-2 transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Powrót do listy sekcji
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-black mb-1">Edytuj sekcję</h2>
                <p className="text-sm text-black/60">
                  {SECTION_TYPES[editingSection.type]?.label || editingSection.type}
                </p>
              </div>
              <div className="px-4 py-2 bg-white rounded-full border border-black/10">
                <span className="text-sm font-medium text-[#C44E35]">
                  {SECTION_TYPES[editingSection.type]?.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <SectionEditor
            section={editingSection}
            categories={categories}
            onSave={handleSaveSection}
            onClose={() => setEditingSection(null)}
            inline={true}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-black mb-1">Page Builder</h1>
              <p className="text-sm text-black/60">Zarządzaj sekcjami na stronie głównej</p>
            </div>
            <div className="px-4 py-2 bg-black/5 rounded-full">
              <span className="text-sm font-medium text-black/80">
                {sections.filter((s) => s.is_active).length} / {sections.length}
              </span>
              <span className="text-xs text-black/60 ml-1">aktywnych</span>
            </div>
          </div>

        <div className="flex items-center justify-between">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Dodaj sekcję
          </Button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#C44E35] hover:text-[#B33D2A] bg-[#C44E35]/10 hover:bg-[#C44E35]/20 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Podgląd strony głównej
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        </div>
      </div>

      {/* Sections list with drag & drop */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-black mb-1">Sekcje strony głównej</h2>
          <p className="text-sm text-black/60 mb-6">Przeciągnij sekcje aby zmienić kolejność</p>

        {sections.length === 0 ? (
          <div className="text-center py-12 text-black/60">
            <p className="mb-4">Nie masz jeszcze żadnych sekcji</p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white"
            >
              Dodaj pierwszą sekcję
            </Button>
          </div>
        ) : !isMounted ? (
          <div className="space-y-4">
            {sections.map((section) => {
              const metadata = SECTION_TYPES[section.type]
              const title = section.title || metadata?.label || section.type
              return (
                <div key={section.id} className="border rounded-2xl p-6 border-black/10 bg-white">
                  <div className="text-lg font-bold text-black">{title}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sectionIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {sections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    onEdit={setEditingSection}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        </div>
      </div>

      {/* Add section dialog */}
      {isAddDialogOpen && (
        <AddSectionDialog
          categories={categories}
          onAdd={handleAddSection}
          onClose={() => setIsAddDialogOpen(false)}
        />
      )}
    </div>
  )
}
