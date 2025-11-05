'use client'

import { memo, useMemo, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HomepageSection, SECTION_TYPES } from '@/lib/homepage-sections/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface SortableSectionProps {
  section: HomepageSection
  onEdit: (section: HomepageSection) => void
  onToggleActive: (section: HomepageSection) => void
  onDelete: (sectionId: string) => void
}

function SortableSectionComponent({
  section,
  onEdit,
  onToggleActive,
  onDelete,
}: SortableSectionProps) {
  const handleEdit = useCallback(() => onEdit(section), [onEdit, section])
  const handleToggleActive = useCallback(() => onToggleActive(section), [onToggleActive, section])
  const handleDelete = useCallback(() => onDelete(section.id), [onDelete, section.id])
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  // Use CSS.Translate instead of Transform for better performance
  const style = useMemo(
    () => ({
      transform: CSS.Translate.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }),
    [transform, transition, isDragging]
  )

  const metadata = SECTION_TYPES[section.type]
  const title = section.title || metadata?.label || section.type
  const subtitle = section.subtitle || metadata?.description || ''

  // Memoize expensive config preview calculation
  const configPreview = useMemo(() => {
    if (Object.keys(section.config).length === 0) return null

    return Object.entries(section.config).map(([key, value]) => {
      // Skip html_content for custom_html sections - too large to display
      if (section.type === 'custom_html' && key === 'html_content') {
        return null
      }

      if (typeof value === 'boolean') {
        return value ? (
          <span key={key} className="px-2.5 py-1 bg-brand/10 text-brand rounded-full font-medium">
            {key}
          </span>
        ) : null
      }
      if (typeof value === 'number' || typeof value === 'string') {
        return (
          <span key={key} className="px-2.5 py-1 bg-muted text-muted-foreground rounded-full">
            <span className="font-medium text-foreground">{key}:</span> {value}
          </span>
        )
      }
      if (Array.isArray(value) && value.length > 0) {
        return (
          <span key={key} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
            <span className="font-medium">{key}:</span> {value.length} items
          </span>
        )
      }
      return null
    })
  }, [section.config, section.type])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-3xl overflow-hidden ${
        section.is_active
          ? 'bg-card shadow-sm'
          : 'bg-muted'
      }`}
    >
      {/* Header with drag handle and badges */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/50">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        {/* Section type badge */}
        <Badge variant="outline" className="rounded-full flex-shrink-0 border-brand/30 text-brand bg-brand/5">
          {metadata?.label || section.type}
        </Badge>

        {/* Status badge */}
        <Badge
          variant={section.is_active ? 'default' : 'secondary'}
          className={`rounded-full flex-shrink-0 ${
            section.is_active
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-muted text-muted-foreground border-border'
          }`}
        >
          {section.is_active ? '● Aktywna' : '○ Nieaktywna'}
        </Badge>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleToggleActive}
            className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
            title={section.is_active ? 'Dezaktywuj' : 'Aktywuj'}
          >
            {section.is_active ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={handleEdit}
            className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
            title="Edytuj"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-card border border-border hover:border-red-300 text-red-600 hover:bg-red-50 transition-colors"
            title="Usuń"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
        )}

        {/* Config preview */}
        {configPreview && (
          <div className="flex flex-wrap gap-2 text-xs">
            {configPreview}
          </div>
        )}
      </div>
    </div>
  )
}

// Custom comparison function - only re-render if section data actually changed
export const SortableSection = memo(SortableSectionComponent, (prevProps, nextProps) => {
  // Don't re-render if section ID, title, subtitle, is_active, and config are the same
  return (
    prevProps.section.id === nextProps.section.id &&
    prevProps.section.title === nextProps.section.title &&
    prevProps.section.subtitle === nextProps.section.subtitle &&
    prevProps.section.is_active === nextProps.section.is_active &&
    prevProps.section.type === nextProps.section.type &&
    prevProps.section.sort_order === nextProps.section.sort_order &&
    JSON.stringify(prevProps.section.config) === JSON.stringify(nextProps.section.config) &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onToggleActive === nextProps.onToggleActive &&
    prevProps.onDelete === nextProps.onDelete
  )
})
