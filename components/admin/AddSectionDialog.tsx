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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-black/10 bg-gradient-to-r from-[#C44E35]/5 to-transparent flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black mb-1">Dodaj nową sekcję</h2>
              <p className="text-sm text-black/60">
                Wybierz typ sekcji, którą chcesz dodać do strony głównej
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 text-black/60 hover:text-black transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(SECTION_TYPES)
              .filter((sectionType) => sectionType.type !== 'spacer')
              .map((sectionType) => (
              <button
                key={sectionType.type}
                onClick={() => handleSelect(sectionType.type)}
                className="border-2 border-black/10 rounded-2xl p-5 text-left hover:border-[#C44E35]/50 hover:bg-[#C44E35]/5 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C44E35]/10 to-[#C44E35]/5 flex items-center justify-center group-hover:from-[#C44E35]/20 group-hover:to-[#C44E35]/10 transition-all flex-shrink-0">
                    <div className="text-[#C44E35]">
                      {getIcon(sectionType.icon)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-black mb-1 group-hover:text-[#C44E35] transition-colors">
                      {sectionType.label}
                    </h3>
                    <p className="text-sm text-black/60 mb-3 line-clamp-2">
                      {sectionType.description}
                    </p>
                    {sectionType.configSchema.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {sectionType.configSchema.slice(0, 3).map((field) => (
                          <span
                            key={field.name}
                            className="px-2 py-0.5 bg-black/5 text-black/60 rounded-full text-xs"
                          >
                            {field.label}
                          </span>
                        ))}
                        {sectionType.configSchema.length > 3 && (
                          <span className="px-2 py-0.5 bg-black/5 text-black/60 rounded-full text-xs">
                            +{sectionType.configSchema.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-black/10 bg-black/[0.02] flex justify-end flex-shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-full border-black/20 hover:bg-black/5"
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
