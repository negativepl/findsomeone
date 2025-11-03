'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5 text-muted-foreground" />
      case 'dark':
        return <Moon className="w-5 h-5 text-muted-foreground" />
      case 'system':
        return <Monitor className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Jasny'
      case 'dark':
        return 'Ciemny'
      case 'system':
        return 'Auto'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Wybierz motyw"
        className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-full bg-muted hover:bg-accent transition-colors"
      >
        {getIcon()}
        <span className="text-sm text-muted-foreground hidden sm:inline">{getLabel()}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-xl shadow-lg min-w-[160px] p-2 space-y-1">
          <button
            onClick={() => {
              setTheme('light')
              setIsOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-lg ${
              theme === 'light' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Jasny</span>
          </button>

          <button
            onClick={() => {
              setTheme('system')
              setIsOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-lg ${
              theme === 'system' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Auto</span>
          </button>

          <button
            onClick={() => {
              setTheme('dark')
              setIsOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-lg ${
              theme === 'dark' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Ciemny</span>
          </button>
        </div>
      )}
    </div>
  )
}
