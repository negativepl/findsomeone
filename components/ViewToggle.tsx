'use client'

import { LayoutGrid, List } from 'lucide-react'
import { motion } from 'framer-motion'

interface ViewToggleProps {
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="relative flex items-center gap-1 bg-card rounded-xl border border-border p-1">
      {/* Animated background indicator */}
      <motion.div
        className="absolute bg-[#C44E35] rounded-lg"
        initial={false}
        animate={{
          x: view === 'grid' ? 0 : 32, // Width of button (28px) + gap (4px)
          width: 28,
          height: 28,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        style={{
          zIndex: 0,
        }}
      />

      {/* Grid button */}
      <button
        onClick={() => onViewChange('grid')}
        className={`relative z-10 p-1.5 rounded-lg transition-colors ${
          view === 'grid'
            ? 'text-white'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Widok siatki"
        style={{ width: 28, height: 28 }}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>

      {/* List button */}
      <button
        onClick={() => onViewChange('list')}
        className={`relative z-10 p-1.5 rounded-lg transition-colors ${
          view === 'list'
            ? 'text-white'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Widok listy"
        style={{ width: 28, height: 28 }}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  )
}
