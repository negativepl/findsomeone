'use client'

import { useRef, useState, useEffect } from 'react'

interface RichTextToolbarProps {
  editor: any
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftGradient, setShowLeftGradient] = useState(false)
  const [showRightGradient, setShowRightGradient] = useState(false)

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftGradient(scrollLeft > 0)
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    handleScroll()
    const element = scrollRef.current
    if (element) {
      element.addEventListener('scroll', handleScroll)
      window.addEventListener('resize', handleScroll)
      return () => {
        element.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleScroll)
      }
    }
  }, [])

  if (!editor || !editor.view || !editor.can || !editor.isActive) {
    return null
  }

  // Additional safety check
  try {
    editor.can().chain().focus().toggleBold().run()
  } catch {
    return null
  }

  return (
    <div className="bg-card border-b border-border pt-3 pb-2 relative">
      <div ref={scrollRef} className="px-2 flex items-center gap-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory overscroll-x-contain">
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${
          editor.isActive('bold')
            ? 'bg-muted border-border text-foreground'
            : 'bg-card hover:bg-muted text-foreground border-border'
        }`}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm italic font-medium transition-colors border ${
          editor.isActive('italic')
            ? 'bg-muted border-border text-foreground'
            : 'bg-card hover:bg-muted text-foreground border-border'
        }`}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm line-through font-medium transition-colors border ${
          editor.isActive('strike')
            ? 'bg-muted border-border text-foreground'
            : 'bg-card hover:bg-muted text-foreground border-border'
        }`}
      >
        S
      </button>

      <div className="flex-shrink-0 w-px h-6 bg-black/10 mx-1 self-center" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-muted border-border text-foreground'
            : 'bg-card hover:bg-muted text-foreground border-border'
        }`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-muted border-border text-foreground'
            : 'bg-card hover:bg-muted text-foreground border-border'
        }`}
      >
        H3
      </button>

      <div className="flex-shrink-0 w-px h-6 bg-black/10 mx-1 self-center" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap border ${
          editor.isActive('bulletList')
            ? 'bg-muted border-border text-foreground'
            : 'bg-card hover:bg-muted text-foreground border-border'
        }`}
      >
        • Lista
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap border ${
          editor.isActive('orderedList')
            ? 'bg-muted border-border text-foreground'
            : 'bg-card hover:bg-muted text-foreground border-border'
        }`}
      >
        1. Lista
      </button>

      <div className="flex-shrink-0 w-px h-6 bg-black/10 mx-1 self-center" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap border ${
          editor.isActive('blockquote')
            ? 'bg-muted border-border text-foreground'
            : 'bg-card hover:bg-muted text-foreground border-border'
        }`}
      >
        " Cytat
      </button>

      <div className="flex-shrink-0 w-px h-6 bg-black/10 mx-1 self-center" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm bg-card hover:bg-muted text-foreground border border-border transition-colors whitespace-nowrap"
      >
        ─ Linia
      </button>
      </div>

      {/* Gradient overlays */}
      <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card via-card/60 to-transparent pointer-events-none transition-opacity duration-300 ${
        showLeftGradient ? 'opacity-100' : 'opacity-0'
      }`} />
      <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card via-card/60 to-transparent pointer-events-none transition-opacity duration-300 ${
        showRightGradient ? 'opacity-100' : 'opacity-0'
      }`} />
    </div>
  )
}
