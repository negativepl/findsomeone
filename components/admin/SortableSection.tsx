'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HomepageSection, SECTION_TYPES } from '@/lib/homepage-sections/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface SortableSectionProps {
  section: HomepageSection
  onEdit: () => void
  onToggleActive: () => void
  onDelete: () => void
}

export function SortableSection({
  section,
  onEdit,
  onToggleActive,
  onDelete,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const metadata = SECTION_TYPES[section.type]
  const title = section.title || metadata?.label || section.type
  const subtitle = section.subtitle || metadata?.description || ''

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-2 rounded-2xl p-6 ${
        section.is_active
          ? 'border-[#C44E35]/20 bg-white'
          : 'border-black/10 bg-black/5'
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Top section with drag handle and info */}
        <div className="flex items-start gap-4">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-black/40 hover:text-black transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>

          {/* Section info */}
          <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-black truncate">{title}</h3>
            <Badge variant={section.is_active ? 'default' : 'secondary'} className="rounded-full">
              {section.is_active ? 'Aktywna' : 'Nieaktywna'}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {metadata?.label || section.type}
            </Badge>
          </div>
          {subtitle && (
            <p className="text-sm text-black/60 mb-3">{subtitle}</p>
          )}

          {/* Config preview */}
          <div className="flex flex-wrap gap-2 text-xs text-black/40">
            {Object.entries(section.config).map(([key, value]) => {
              if (typeof value === 'boolean') {
                return value ? (
                  <span key={key} className="px-2 py-1 bg-black/5 rounded">
                    {key}
                  </span>
                ) : null
              }
              if (typeof value === 'number' || typeof value === 'string') {
                return (
                  <span key={key} className="px-2 py-1 bg-black/5 rounded">
                    {key}: {value}
                  </span>
                )
              }
              if (Array.isArray(value) && value.length > 0) {
                return (
                  <span key={key} className="px-2 py-1 bg-black/5 rounded">
                    {key}: {value.length} items
                  </span>
                )
              }
              return null
            })}
          </div>
        </div>
        </div>

        {/* Actions - Bottom section */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-black/10">
          <button
            onClick={onToggleActive}
            className="p-2.5 rounded-lg bg-white border border-black/10 hover:bg-black/5 transition-colors"
            title={section.is_active ? 'Dezaktywuj' : 'Aktywuj'}
          >
            {section.is_active ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={onEdit}
            className="p-2.5 rounded-lg bg-white border border-black/10 hover:bg-black/5 transition-colors"
            title="Edytuj"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={onDelete}
            className="p-2.5 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            title="Usuń"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
