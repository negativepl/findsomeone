'use client'

import { useState } from 'react'
import { HomepageSection, SECTION_TYPES } from '@/lib/homepage-sections/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Grid3x3, GalleryHorizontal, LayoutGrid, List, Columns, ChevronsUpDown, RectangleVertical, Columns2, Columns3 } from 'lucide-react'

interface SectionEditorProps {
  section: HomepageSection
  categories: { id: string; name: string }[]
  onSave: (section: HomepageSection) => void
  onClose: () => void
  inline?: boolean
}

export function SectionEditor({ section, categories, onSave, onClose, inline = false }: SectionEditorProps) {
  const [editedSection, setEditedSection] = useState<HomepageSection>(section)
  const metadata = SECTION_TYPES[section.type]

  const handleConfigChange = (key: string, value: any) => {
    setEditedSection({
      ...editedSection,
      config: {
        ...editedSection.config,
        [key]: value,
      },
    })
  }

  const handleSave = () => {
    // Clean up undefined values - convert to null for proper database storage
    const cleanedSection = {
      ...editedSection,
      background_color: editedSection.background_color || null,
      text_color: editedSection.text_color || null,
    }
    onSave(cleanedSection)
  }

  // If inline mode, render without modal wrapper
  if (inline) {
    return (
      <div className="space-y-8">
          {/* Basic settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C44E35]/20 to-[#C44E35]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-black">Podstawowe ustawienia</h3>
                <p className="text-sm text-black/60">Tytuł i podtytuł sekcji</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="mb-2 block">Tytuł sekcji</Label>
                <Input
                  id="title"
                  value={editedSection.title || ''}
                  onChange={(e) =>
                    setEditedSection({ ...editedSection, title: e.target.value })
                  }
                  placeholder={metadata?.label}
                  className=""
                />
              </div>

              <div>
                <Label htmlFor="subtitle" className="mb-2 block">Podtytuł</Label>
                <Input
                  id="subtitle"
                  value={editedSection.subtitle || ''}
                  onChange={(e) =>
                    setEditedSection({ ...editedSection, subtitle: e.target.value })
                  }
                  placeholder={metadata?.description}
                  className=""
                />
              </div>
            </div>
          </div>

          {/* Section-specific configuration */}
          {metadata && metadata.configSchema.length > 0 && (
            <div className="space-y-6 pt-6 border-t-2 border-black/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black">Konfiguracja sekcji</h3>
                  <p className="text-sm text-black/60">Opcje specyficzne dla tego typu sekcji</p>
                </div>
              </div>

              {metadata.configSchema.map((field) => (
                <div key={field.name}>
                  {field.type === 'text' && (
                    <div>
                      <Label htmlFor={field.name} className="mb-2 block">{field.label}</Label>
                      {field.description && (
                        <p className="text-xs text-black/60 mb-2">{field.description}</p>
                      )}
                      <Input
                        id={field.name}
                        value={editedSection.config[field.name] || ''}
                        onChange={(e) => handleConfigChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    </div>
                  )}

                  {field.type === 'number' && (() => {
                    // Hide columns field when layout is 'list', 'carousel', 'horizontal', or 'accordion'
                    if (field.name === 'columns' && (editedSection.config.layout === 'list' || editedSection.config.layout === 'carousel' || editedSection.config.layout === 'horizontal' || editedSection.config.layout === 'accordion')) {
                      return null
                    }

                    // Set appropriate max value based on field name
                    let maxValue = 20
                    let minValue = 1
                    if (field.name === 'columns') {
                      maxValue = 6
                    } else if (field.name === 'overlay_opacity') {
                      maxValue = 100
                      minValue = 0
                    } else if (field.name === 'overlay_blur') {
                      maxValue = 30
                      minValue = 0
                    } else if (field.name === 'border_width') {
                      maxValue = 20
                      minValue = 0
                    } else if (field.name === 'border_radius') {
                      maxValue = 50
                      minValue = 0
                    }

                    return (
                      <div className="rounded-2xl border-2 border-black/10 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <Label htmlFor={field.name} className="text-base font-semibold">{field.label}</Label>
                            {field.description && (
                              <p className="text-xs text-black/60 mt-1">{field.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-[#C44E35]">
                              {editedSection.config[field.name] !== undefined ? editedSection.config[field.name] : field.default || 0}
                            </span>
                          </div>
                        </div>
                        <Input
                          id={field.name}
                          type="range"
                          value={editedSection.config[field.name] !== undefined ? editedSection.config[field.name] : field.default || 0}
                          onChange={(e) => handleConfigChange(field.name, parseInt(e.target.value) || 0)}
                          min={minValue}
                          max={maxValue}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-black/40 mt-2">
                          <span>{minValue}</span>
                          <span>{maxValue}</span>
                        </div>
                      </div>
                    )
                  })()}

                  {field.type === 'boolean' && (
                    <div className="flex items-center justify-between rounded-2xl border-2 border-black/10 p-4">
                      <div>
                        <Label htmlFor={field.name}>{field.label}</Label>
                        {field.description && (
                          <p className="text-xs text-black/60 mt-1">{field.description}</p>
                        )}
                      </div>
                      <Switch
                        id={field.name}
                        checked={editedSection.config[field.name] ?? field.default ?? false}
                        onCheckedChange={(checked) => handleConfigChange(field.name, checked)}
                      />
                    </div>
                  )}

                  {field.type === 'select' && (
                    <div>
                      <Label htmlFor={field.name} className="mb-2 block font-semibold">{field.label}</Label>
                      {field.description && (
                        <p className="text-xs text-black/60 mb-3">{field.description}</p>
                      )}

                      {/* Special handling for layout field - use icon buttons */}
                      {field.name === 'layout' && field.options ? (
                        <div className="flex flex-row gap-3">
                          {field.options.map((option) => {
                            const isSelected = (editedSection.config[field.name] || field.default) === option.value
                            const getIcon = () => {
                              if (option.value === 'grid') return <Grid3x3 className="w-5 h-5" />
                              if (option.value === 'carousel') return <GalleryHorizontal className="w-5 h-5" />
                              if (option.value === 'masonry') return <LayoutGrid className="w-5 h-5" />
                              if (option.value === 'list') return <List className="w-5 h-5" />
                              if (option.value === 'horizontal') return <Columns className="w-5 h-5" />
                              if (option.value === 'accordion') return <ChevronsUpDown className="w-5 h-5" />
                              if (option.value === 'single') return <RectangleVertical className="w-5 h-5" />
                              if (option.value === 'two-column') return <Columns2 className="w-5 h-5" />
                              if (option.value === 'three-column') return <Columns3 className="w-5 h-5" />
                              return null
                            }

                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleConfigChange(field.name, option.value)}
                                className={`flex flex-row items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                                  isSelected
                                    ? 'border-[#C44E35] bg-[#C44E35]/5'
                                    : 'border-black/10 hover:border-black/20 hover:bg-black/5'
                                }`}
                              >
                                <div className={isSelected ? 'text-[#C44E35]' : 'text-black/60'}>
                                  {getIcon()}
                                </div>
                                <span className={`text-sm font-medium whitespace-nowrap ${isSelected ? 'text-[#C44E35]' : 'text-black'}`}>
                                  {option.label}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <Select
                          value={editedSection.config[field.name] || field.default || ''}
                          onValueChange={(value) => handleConfigChange(field.name, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={field.placeholder || 'Wybierz...'} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}

                  {field.type === 'multi-select' && (
                    <div>
                      <Label htmlFor={field.name} className="mb-2 block">{field.label}</Label>
                      {field.description && (
                        <p className="text-xs text-black/60 mb-2">{field.description}</p>
                      )}
                      <div className="border-2 border-black/10 rounded-2xl p-4 max-h-48 overflow-y-auto">
                        {categories.map((category) => (
                          <label
                            key={category.id}
                            className="flex items-center gap-2 py-2 cursor-pointer hover:bg-black/5 rounded px-2"
                          >
                            <input
                              type="checkbox"
                              checked={(editedSection.config[field.name] as string[] || []).includes(category.id)}
                              onChange={(e) => {
                                const current = (editedSection.config[field.name] as string[]) || []
                                const updated = e.target.checked
                                  ? [...current, category.id]
                                  : current.filter((id) => id !== category.id)
                                handleConfigChange(field.name, updated)
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{category.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {field.type === 'textarea' && (() => {
                    // Hide content_column_2 if layout is 'single'
                    if (field.name === 'content_column_2' && editedSection.config.layout === 'single') {
                      return null
                    }
                    // Hide content_column_3 if layout is 'single' or 'two-column'
                    if (field.name === 'content_column_3' && (editedSection.config.layout === 'single' || editedSection.config.layout === 'two-column')) {
                      return null
                    }

                    return (
                      <div>
                        <Label htmlFor={field.name} className="mb-2 block">{field.label}</Label>
                        {field.description && (
                          <p className="text-xs text-black/60 mb-2">{field.description}</p>
                        )}
                        <Textarea
                          id={field.name}
                          value={
                            typeof editedSection.config[field.name] === 'object'
                              ? JSON.stringify(editedSection.config[field.name], null, 2)
                              : (editedSection.config[field.name] || '')
                          }
                          onChange={(e) => {
                            const value = e.target.value
                            // Try to parse as JSON if it looks like JSON
                            if (value.trim().startsWith('[') || value.trim().startsWith('{')) {
                              try {
                                const parsed = JSON.parse(value)
                                handleConfigChange(field.name, parsed)
                              } catch {
                                // If invalid JSON, store as string temporarily
                                handleConfigChange(field.name, value)
                              }
                            } else {
                              handleConfigChange(field.name, value)
                            }
                          }}
                          placeholder={field.placeholder}
                          rows={field.rows || 8}
                          className="rounded-2xl font-mono text-sm"
                        />
                      </div>
                    )
                  })()}

                  {field.type === 'color' && (
                    <div className="rounded-2xl border-2 border-black/10 p-4">
                      <Label htmlFor={field.name} className="mb-2 block font-semibold">{field.label}</Label>
                      {field.description && (
                        <p className="text-xs text-black/60 mb-3">{field.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={field.name}
                          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-black/10 overflow-hidden block relative shrink-0"
                          style={{
                            backgroundColor: editedSection.config[field.name] || field.default || '#FFFFFF'
                          }}
                        >
                          <input
                            id={field.name}
                            type="color"
                            value={editedSection.config[field.name] || field.default || '#FFFFFF'}
                            onChange={(e) => handleConfigChange(field.name, e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </label>
                        <Input
                          value={editedSection.config[field.name] || ''}
                          onChange={(e) => handleConfigChange(field.name, e.target.value)}
                          placeholder={field.default || '#FFFFFF'}
                          className="flex-1 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Global styling and visibility options */}
          <div className="space-y-6 pt-6 border-t-2 border-black/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-black">Stylowanie i widoczność</h3>
                <p className="text-sm text-black/60">Kolory, responsywność i widoczność sekcji</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Background Color */}
              <div className="rounded-2xl border-2 border-black/10 p-4">
                <Label htmlFor="background_color" className="mb-2 block font-semibold">Kolor tła</Label>
                <p className="text-xs text-black/60 mb-3">Nadpisuje domyślny kolor sekcji</p>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="background_color"
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-black/10 overflow-hidden block relative shrink-0"
                    style={{
                      backgroundColor: editedSection.background_color || '#FAF8F3'
                    }}
                  >
                    <input
                      id="background_color"
                      type="color"
                      value={editedSection.background_color || '#FAF8F3'}
                      onChange={(e) =>
                        setEditedSection({ ...editedSection, background_color: e.target.value })
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>
                  <Input
                    value={editedSection.background_color || ''}
                    onChange={(e) =>
                      setEditedSection({ ...editedSection, background_color: e.target.value })
                    }
                    placeholder="#FAF8F3"
                    className="flex-1 text-sm"
                  />
                  {editedSection.background_color && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditedSection({ ...editedSection, background_color: null })
                      }
                      className="text-xs text-black/60 hover:text-black underline"
                    >
                      Wyczyść
                    </button>
                  )}
                </div>
              </div>

              {/* Text Color */}
              <div className="rounded-2xl border-2 border-black/10 p-4">
                <Label htmlFor="text_color" className="mb-2 block font-semibold">Kolor tekstu</Label>
                <p className="text-xs text-black/60 mb-3">Nadpisuje domyślny kolor tekstu</p>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="text_color"
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-black/10 overflow-hidden block relative shrink-0"
                    style={{
                      backgroundColor: editedSection.text_color || '#000000'
                    }}
                  >
                    <input
                      id="text_color"
                      type="color"
                      value={editedSection.text_color || '#000000'}
                      onChange={(e) =>
                        setEditedSection({ ...editedSection, text_color: e.target.value })
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>
                  <Input
                    value={editedSection.text_color || ''}
                    onChange={(e) =>
                      setEditedSection({ ...editedSection, text_color: e.target.value })
                    }
                    placeholder="#000000"
                    className="flex-1 text-sm"
                  />
                  {editedSection.text_color && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditedSection({ ...editedSection, text_color: null })
                      }
                      className="text-xs text-black/60 hover:text-black underline"
                    >
                      Wyczyść
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Visibility Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-2xl border-2 border-black/10 p-5">
                <div>
                  <Label htmlFor="visible_on_mobile" className="mb-1 block font-semibold">Widoczna na mobile</Label>
                  <p className="text-xs text-black/60">Pokaż sekcję na urządzeniach mobilnych</p>
                </div>
                <Switch
                  id="visible_on_mobile"
                  checked={editedSection.visible_on_mobile ?? true}
                  onCheckedChange={(checked) =>
                    setEditedSection({ ...editedSection, visible_on_mobile: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border-2 border-black/10 p-5">
                <div>
                  <Label htmlFor="visible_on_desktop" className="mb-1 block font-semibold">Widoczna na desktop</Label>
                  <p className="text-xs text-black/60">Pokaż sekcję na komputerach</p>
                </div>
                <Switch
                  id="visible_on_desktop"
                  checked={editedSection.visible_on_desktop ?? true}
                  onCheckedChange={(checked) =>
                    setEditedSection({ ...editedSection, visible_on_desktop: checked })
                  }
                />
              </div>
            </div>
          </div>

        {/* Actions */}
        <div className="mt-8 flex justify-between items-center gap-3 pt-6 border-t-2 border-black/10">
          <p className="text-sm text-black/60">
            Pamiętaj, aby zapisać zmiany przed opuszczeniem strony
          </p>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="rounded-full border-black/20 hover:bg-black/5"
            >
              Anuluj
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Zapisz zmiany
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Modal mode (legacy - for AddSectionDialog if needed)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-black mb-1">Edytuj sekcję</h2>
            <p className="text-sm text-black/60">{metadata?.label || section.type}</p>
          </div>
          <button
            onClick={onClose}
            className="text-black/60 hover:text-black transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Form content will be here - but we're using inline mode now */}
        </div>

        <div className="mt-8 flex justify-end gap-3 pt-6 border-t">
          <Button onClick={onClose} variant="outline" className="">Anuluj</Button>
          <Button onClick={handleSave} className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white">
            Zapisz zmiany
          </Button>
        </div>
      </div>
    </div>
  )
}
