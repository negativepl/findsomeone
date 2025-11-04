'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CategoryIcon, POPULAR_ICONS } from '@/lib/category-icons'
import { Search } from 'lucide-react'

interface IconPickerProps {
  value: string
  onChange: (iconName: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState('')

  // Filter icons based on search
  const filteredIcons = search
    ? POPULAR_ICONS.filter(icon => icon.toLowerCase().includes(search.toLowerCase()))
    : POPULAR_ICONS

  return (
    <div className="space-y-3">
      <Label>Wybierz ikonkę</Label>

      {/* Container with rounded design */}
      <div className="border border-black/10 rounded-2xl overflow-hidden bg-white">
        {/* Search */}
        <div className="p-3 bg-[#FAF8F3] border-b-2 border-black/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <Input
              placeholder="Szukaj ikony (np. wrench, hammer)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl pl-9 border-black/10"
            />
          </div>
        </div>

        {/* Current selection */}
        {value && (
          <div className="px-3 pt-3 pb-2 bg-[#FAF8F3]/50 border-b-2 border-black/5">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-black/10">
              <CategoryIcon iconName={value} className="w-5 h-5 text-[#C44E35]" />
              <span className="text-sm font-medium">Wybrana: <span className="font-mono text-xs text-black/60">{value}</span></span>
            </div>
          </div>
        )}

        {/* Icon grid */}
        <div className="p-3">
          <div className="grid grid-cols-6 gap-2">
            {filteredIcons.length > 0 ? (
              filteredIcons.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => onChange(iconName)}
                  className={`p-3 rounded-xl border transition-all hover:border-[#C44E35] hover:bg-[#C44E35]/5 flex items-center justify-center ${
                    value === iconName
                      ? 'border-[#C44E35] bg-[#C44E35]/10'
                      : 'border-black/10'
                  }`}
                  title={iconName}
                >
                  <CategoryIcon iconName={iconName} className="w-5 h-5" />
                </button>
              ))
            ) : (
              <div className="col-span-6 text-center py-8 text-black/60">
                Nie znaleziono ikon
              </div>
            )}
          </div>
        </div>

        {/* Custom icon input - footer */}
        <div className="p-3 bg-[#FAF8F3] border-t-2 border-black/5 rounded-t-xl rounded-b-2xl">
          <div className="space-y-2">
            <Label htmlFor="custom-icon" className="text-xs text-black/60">
              Lub wpisz nazwę ikony z Lucide
            </Label>
            <Input
              id="custom-icon"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="np. wrench-screwdriver"
              className="rounded-xl border-black/10"
            />
            <p className="text-xs text-black/60">
              Zobacz wszystkie:{' '}
              <a
                href="https://lucide.dev/icons/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C44E35] hover:underline font-medium"
              >
                lucide.dev/icons
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
