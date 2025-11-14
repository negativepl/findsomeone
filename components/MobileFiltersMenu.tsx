'use client'

import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface MobileFiltersMenuProps {
  onFiltersClick: () => void
}

export function MobileFiltersMenu({ onFiltersClick }: MobileFiltersMenuProps) {
  const [isDockMenuOpen, setIsDockMenuOpen] = useState(false)

  useEffect(() => {
    const handleDockMenuOpen = () => {
      setIsDockMenuOpen(true)
    }

    const handleDockMenuClose = () => {
      setIsDockMenuOpen(false)
    }

    window.addEventListener('mobileDockCategoriesOpen', handleDockMenuOpen)
    window.addEventListener('mobileDockCategoriesClose', handleDockMenuClose)
    window.addEventListener('mobileDockMenuOpen', handleDockMenuOpen)
    window.addEventListener('mobileDockMenuClose', handleDockMenuClose)

    return () => {
      window.removeEventListener('mobileDockCategoriesOpen', handleDockMenuOpen)
      window.removeEventListener('mobileDockCategoriesClose', handleDockMenuClose)
      window.removeEventListener('mobileDockMenuOpen', handleDockMenuOpen)
      window.removeEventListener('mobileDockMenuClose', handleDockMenuClose)
    }
  }, [])

  // Don't show button when categories or menu are open
  if (isDockMenuOpen) {
    return null
  }

  return (
    <>
      {/* Floating button for filters - on mobile and tablet (md) screens */}
      <div className="lg:hidden fixed right-4 z-[10000] bottom-[100px] md:bottom-4">
        <Button
          onClick={onFiltersClick}
          className="rounded-full bg-brand hover:bg-brand/90 text-brand-foreground shadow-lg w-12 h-12 p-0"
          aria-label="Otwórz filtry"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </div>
    </>
  )
}
