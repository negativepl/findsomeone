'use client'

import { useState } from 'react'
import { HomepageSection, SECTION_TYPES, SectionType } from '@/lib/homepage-sections/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AddSectionDialogProps {
  categories: { id: string; name: string }[]
  onAdd: (section: Omit<HomepageSection, 'id' | 'created_at' | 'updated_at'>) => void
  onClose: () => void
}

export function AddSectionDialog({ categories, onAdd, onClose }: AddSectionDialogProps) {
  const [selectedType, setSelectedType] = useState<SectionType | null>(null)

  const handleSelect = (type: SectionType) => {
    const metadata = SECTION_TYPES[type]

    // Create new section with default config
    const newSection: Omit<HomepageSection, 'id' | 'created_at' | 'updated_at'> = {
      type,
      title: metadata.label,
      subtitle: metadata.description,
      is_active: true,
      sort_order: 0, // Will be set by the parent
      config: metadata.defaultConfig,
      visible_on_mobile: true,
      visible_on_desktop: true,
    }

    onAdd(newSection)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-black">Dodaj nową sekcję</h2>
          <button
            onClick={onClose}
            className="text-black/60 hover:text-black transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-black/60 mb-8">
          Wybierz typ sekcji, którą chcesz dodać do strony głównej
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(SECTION_TYPES)
            .filter((sectionType) => sectionType.type !== 'spacer')
            .map((sectionType) => (
            <button
              key={sectionType.type}
              onClick={() => handleSelect(sectionType.type)}
              className="border-2 border-black/10 rounded-2xl p-6 text-left hover:border-[#C44E35] hover:bg-[#C44E35]/5 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-[#C44E35]/10 transition-colors">
                  {getIcon(sectionType.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black mb-1">
                    {sectionType.label}
                  </h3>
                  <p className="text-sm text-black/60 mb-3">
                    {sectionType.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sectionType.configSchema.slice(0, 3).map((field) => (
                      <Badge key={field.name} variant="outline" className="rounded-full text-xs">
                        {field.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-full"
          >
            Anuluj
          </Button>
        </div>
      </div>
    </div>
  )
}

function getIcon(iconName: string) {
  const icons: Record<string, JSX.Element> = {
    search: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    hand: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
      </svg>
    ),
    clock: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    location: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    grid: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    eye: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    photo: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    code: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    document: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    list: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  }

  return icons[iconName] || icons.document
}
