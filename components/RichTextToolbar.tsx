'use client'

interface RichTextToolbarProps {
  editor: any
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
  if (!editor) {
    return null
  }

  return (
    <div className="bg-white border-b border-black/10 pt-3 pb-2 px-2 flex items-center gap-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory overscroll-x-contain">
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
            ? 'bg-black text-white border-black'
            : 'bg-white hover:bg-black/5 text-black border-black/10'
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
            ? 'bg-black text-white border-black'
            : 'bg-white hover:bg-black/5 text-black border-black/10'
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
            ? 'bg-black text-white border-black'
            : 'bg-white hover:bg-black/5 text-black border-black/10'
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
            ? 'bg-black text-white border-black'
            : 'bg-white hover:bg-black/5 text-black border-black/10'
        }`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-black text-white border-black'
            : 'bg-white hover:bg-black/5 text-black border-black/10'
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
            ? 'bg-black text-white border-black'
            : 'bg-white hover:bg-black/5 text-black border-black/10'
        }`}
      >
        • Lista
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap border ${
          editor.isActive('orderedList')
            ? 'bg-black text-white border-black'
            : 'bg-white hover:bg-black/5 text-black border-black/10'
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
            ? 'bg-black text-white border-black'
            : 'bg-white hover:bg-black/5 text-black border-black/10'
        }`}
      >
        " Cytat
      </button>

      <div className="flex-shrink-0 w-px h-6 bg-black/10 mx-1 self-center" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm bg-white hover:bg-black/5 text-black border border-black/10 transition-colors whitespace-nowrap"
      >
        ─ Linia
      </button>
    </div>
  )
}
