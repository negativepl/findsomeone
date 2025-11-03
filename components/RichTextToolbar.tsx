'use client'

interface RichTextToolbarProps {
  editor: any
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
  if (!editor) {
    return null
  }

  return (
    <div className="bg-card border-b border-border pt-3 pb-2 px-2 flex items-center gap-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory overscroll-x-contain">
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
            ? 'bg-foreground text-background border-foreground'
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
            ? 'bg-foreground text-background border-foreground'
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
            ? 'bg-foreground text-background border-foreground'
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
            ? 'bg-foreground text-background border-foreground'
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
            ? 'bg-foreground text-background border-foreground'
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
            ? 'bg-foreground text-background border-foreground'
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
            ? 'bg-foreground text-background border-foreground'
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
            ? 'bg-foreground text-background border-foreground'
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
  )
}
