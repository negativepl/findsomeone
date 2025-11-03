'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileSearchBarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSearchBar({ isOpen, onClose }: MobileSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [cityQuery, setCityQuery] = useState('')
  const [isClosing, setIsClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Clear inputs when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setCityQuery('')
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (cityQuery) params.set('city', cityQuery)

    handleClose()
    router.push(`/posts${params.toString() ? `?${params}` : ''}`)
  }

  if (!isOpen && !isClosing) return null
  if (!mounted) return null

  const content = (
    <div className="md:hidden">
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40",
          isClosing ? "animate-out fade-out duration-300" : "animate-in fade-in duration-200"
        )}
        onClick={handleClose}
      />

      {/* Search Bar */}
      <div
        className={cn(
          "fixed left-0 right-0 top-0 bg-card rounded-b-3xl shadow-lg z-50 overflow-hidden",
          isClosing ? "animate-out slide-out-to-top duration-300" : "animate-in slide-in-from-top duration-400"
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">Wyszukaj</h2>
            <button
              type="button"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2 rounded-full hover:bg-accent"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" stroke="currentColor" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15L15 5M5 5L15 15" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Search input */}
            <div className="flex items-center gap-2 px-4 py-3 bg-secondary rounded-2xl">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Czego szukasz?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-base text-foreground placeholder:text-muted-foreground bg-transparent"
                autoComplete="off"
              />
            </div>

            {/* City input */}
            <div className="flex items-center gap-2 px-4 py-3 bg-secondary rounded-2xl">
              <svg className="w-5 h-5 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                placeholder="Miasto"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                className="flex-1 outline-none text-base text-foreground placeholder:text-muted-foreground bg-transparent"
                autoComplete="off"
              />
            </div>

            {/* Search button */}
            <button
              type="submit"
              className="w-full rounded-2xl bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 px-6 py-3 font-medium transition-colors text-base"
            >
              Szukaj
            </button>
          </form>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
