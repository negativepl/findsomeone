'use client'

import { useState, useEffect } from 'react'
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
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
  }

  const handleToggleActive = (section: HomepageSection) => {
    toggleActive.mutate({
      id: section.id,
      is_active: !section.is_active,
    })
  }

  const handleDelete = (sectionId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę sekcję?')) {
      return
    }

    deleteSection.mutate(sectionId)
  }

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
        {/* Back button */}
        <button
          onClick={() => setEditingSection(null)}
          className="flex items-center gap-2 text-black/60 hover:text-black transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Powrót do listy sekcji
        </button>

        {/* Edit form */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-black mb-1">Edytuj sekcję</h2>
            <p className="text-sm text-black/60">
              {SECTION_TYPES[editingSection.type]?.label || editingSection.type}
            </p>
          </div>

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
      {/* Action buttons */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white"
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
            className="text-sm text-black/60 hover:text-black underline"
          >
            Podgląd strony głównej →
          </a>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-black/60">
            {sections.filter((s) => s.is_active).length} / {sections.length} aktywnych sekcji
          </span>

          <Button
            onClick={handlePublish}
            variant="outline"
            className="rounded-full"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Odśwież podgląd
          </Button>
        </div>
      </div>

      {/* Sections list with drag & drop */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-black mb-6">Sekcje strony głównej</h2>

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
                <div key={section.id} className="border-2 rounded-2xl p-6 border-black/10 bg-white">
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
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {sections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    onEdit={() => setEditingSection(section)}
                    onToggleActive={() => handleToggleActive(section)}
                    onDelete={() => handleDelete(section.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
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
