'use client'

import { ChevronDown } from 'lucide-react'

interface FiltersPlaceholderProps {
  fullWidth?: boolean
}

export function FiltersPlaceholder({ fullWidth = false }: FiltersPlaceholderProps) {
  const filters = [
    { label: 'Cena' },
    { label: 'Ocena' },
    { label: 'Odległość' },
    { label: 'Dostępność' },
    { label: 'Doświadczenie' },
    { label: 'Warunki' },
    { label: 'Gwarancja' },
  ]

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <div className="space-y-3 opacity-30 pointer-events-none">
        <h3 className="text-sm font-semibold text-foreground">Filtry:</h3>
        <div className="flex gap-4 flex-wrap w-full">
          {filters.map((filter, idx) => (
            <div key={filter.label} className="flex flex-col flex-1 min-w-[140px]">
              {/* Price Special Case */}
              {filter.label === 'Cena' ? (
                <>
                  <label className="text-xs font-medium text-muted-foreground mb-2">Cena</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Od"
                      disabled
                      className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-muted-foreground text-sm placeholder-muted-foreground/70 cursor-not-allowed"
                    />
                    <span className="text-muted-foreground text-sm flex-shrink-0">-</span>
                    <input
                      type="text"
                      placeholder="Do"
                      disabled
                      className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-muted-foreground text-sm placeholder-muted-foreground/70 cursor-not-allowed"
                    />
                  </div>
                </>
              ) : (
                <>
                  <label className="text-xs font-medium text-muted-foreground mb-2">{filter.label}</label>
                  <button
                    disabled
                    className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-muted-foreground cursor-not-allowed transition-colors hover:bg-muted/50"
                  >
                    <span className="text-sm">Wybierz...</span>
                    <ChevronDown className="w-3 h-3 flex-shrink-0" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Overlay Message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background/95 px-6 py-3 rounded-lg border border-border shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Funkcjonalność filtrów jest w trakcie budowania
          </p>
        </div>
      </div>
    </div>
  )
}
