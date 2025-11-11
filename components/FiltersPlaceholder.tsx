'use client'

import { ChevronDown, Filter, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Drawer } from 'vaul'

interface FiltersPlaceholderProps {
  fullWidth?: boolean
  isFiltersOpen?: boolean
  setIsFiltersOpen?: (open: boolean) => void
}

export function FiltersPlaceholder({ fullWidth = false, isFiltersOpen: externalIsFiltersOpen, setIsFiltersOpen: externalSetIsFiltersOpen }: FiltersPlaceholderProps) {
  const [internalIsFiltersOpen, setInternalIsFiltersOpen] = useState(false)

  // Use external state if provided, otherwise use internal state
  const isFiltersOpen = externalIsFiltersOpen ?? internalIsFiltersOpen
  const setIsFiltersOpen = externalSetIsFiltersOpen ?? setInternalIsFiltersOpen

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
    <>
      {/* Tablet/Desktop: Overlay */}
      {isFiltersOpen && (
        <div
          className="hidden md:block fixed inset-0 bg-background/95 z-[55] transition-opacity"
          onClick={() => setIsFiltersOpen(false)}
        />
      )}

      {/* Tablet/Desktop: Slide-out menu from right */}
      <div
        className={`hidden md:block fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background border-l border-border z-[55] transform transition-transform duration-300 ease-in-out overflow-y-auto pb-20 ${
          isFiltersOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          paddingTop: 'calc(64px + env(safe-area-inset-top))',
          paddingBottom: 'calc(96px + env(safe-area-inset-bottom))',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        <div className="px-6 py-4 space-y-4 relative">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Filtry</h3>
            <button
              onClick={() => setIsFiltersOpen(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors duration-300 text-foreground"
              aria-label="Zamknij menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filters content - dimmed */}
          <div className="space-y-4 opacity-30 pointer-events-none">
            {filters.map((filter) => (
              <div key={filter.label} className="flex flex-col gap-3">
                {filter.label === 'Cena' ? (
                  <>
                    <label className="text-sm font-medium text-foreground">{filter.label}</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Od"
                        disabled
                        className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-muted-foreground text-sm placeholder-muted-foreground/70 cursor-not-allowed"
                      />
                      <span className="text-muted-foreground text-sm">-</span>
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
                    <label className="text-sm font-medium text-foreground">{filter.label}</label>
                    <button
                      disabled
                      className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-muted/50 border border-border/50 text-muted-foreground cursor-not-allowed"
                    >
                      <span className="text-sm">Wybierz...</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Overlay Message */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6 pt-16">
            <div className="bg-background/95 px-6 py-4 rounded-lg border border-border shadow-sm">
              <p className="text-sm font-medium text-muted-foreground text-center leading-relaxed">
                Funkcjonalność<br />
                filtrów<br />
                jest w trakcie<br />
                budowania
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Drawer from bottom */}
      <Drawer.Root open={isFiltersOpen} onOpenChange={setIsFiltersOpen} modal={true}>
        <Drawer.Portal>
          <Drawer.Overlay className="md:hidden fixed inset-0 bg-background/95 z-30 transition-all duration-300" />
          <Drawer.Content
            className="md:hidden fixed bottom-0 left-0 right-0 z-[60] flex flex-col rounded-t-3xl max-h-[75vh] border-t border-border bg-card"
            style={{
              paddingBottom: '84px'
            }}
          >
              {/* Handle */}
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/30 mt-4 mb-2" />

              <div className="overflow-y-auto flex-1">
                <div className="p-6 space-y-4 relative">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <Drawer.Title className="text-lg font-bold text-foreground">Filtry</Drawer.Title>
                    <button
                      onClick={() => setIsFiltersOpen(false)}
                      className="p-2 hover:bg-muted rounded-full transition-colors duration-300 text-foreground"
                      aria-label="Zamknij menu"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Filters content - dimmed */}
                  <div className="space-y-4 opacity-30 pointer-events-none">
                    {filters.map((filter) => (
                      <div key={filter.label} className="flex flex-col gap-3">
                        {filter.label === 'Cena' ? (
                          <>
                            <label className="text-sm font-medium text-foreground">{filter.label}</label>
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                placeholder="Od"
                                disabled
                                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-muted-foreground text-sm placeholder-muted-foreground/70 cursor-not-allowed"
                              />
                              <span className="text-muted-foreground text-sm">-</span>
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
                            <label className="text-sm font-medium text-foreground">{filter.label}</label>
                            <button
                              disabled
                              className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-muted/50 border border-border/50 text-muted-foreground cursor-not-allowed"
                            >
                              <span className="text-sm">Wybierz...</span>
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Overlay Message */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
                    <div className="bg-background/95 px-6 py-4 rounded-lg border border-border shadow-sm">
                      <p className="text-sm font-medium text-muted-foreground text-center leading-relaxed">
                        Funkcjonalność<br />
                        filtrów<br />
                        jest w trakcie<br />
                        budowania
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
