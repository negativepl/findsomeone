'use client'

import { LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface MobileCategoriesMenuProps {
  onCategoriesClick: () => void
}

export function MobileCategoriesMenu({ onCategoriesClick }: MobileCategoriesMenuProps) {
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

  // Don't show button when dock menus are open or on desktop
  if (isDockMenuOpen) {
    return null
  }

  return (
    <>
      {/* Floating button for categories - only on md screens (tablet) */}
      <div className="hidden md:block lg:hidden fixed bottom-4 left-4 z-40">
        <Button
          onClick={onCategoriesClick}
          className="rounded-full bg-brand hover:bg-brand/90 text-brand-foreground shadow-lg w-12 h-12 p-0"
          aria-label="Otwórz kategorie"
        >
          <LayoutGrid className="w-5 h-5" />
        </Button>
      </div>
    </>
  )
}
