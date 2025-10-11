'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Zacznij pisać...',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border-2 border-black/10 rounded-2xl overflow-hidden focus-within:border-black/30 transition-colors">
      {/* Toolbar */}
      <div className="border-b border-black/10 bg-black/5 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            editor.isActive('bold')
              ? 'bg-black text-white'
              : 'bg-white hover:bg-black/5 text-black'
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded-lg text-sm italic font-medium transition-colors ${
            editor.isActive('italic')
              ? 'bg-black text-white'
              : 'bg-white hover:bg-black/5 text-black'
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`px-3 py-1.5 rounded-lg text-sm line-through font-medium transition-colors ${
            editor.isActive('strike')
              ? 'bg-black text-white'
              : 'bg-white hover:bg-black/5 text-black'
          }`}
        >
          S
        </button>

        <div className="w-px h-6 bg-black/10 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-black text-white'
              : 'bg-white hover:bg-black/5 text-black'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-black text-white'
              : 'bg-white hover:bg-black/5 text-black'
          }`}
        >
          H3
        </button>

        <div className="w-px h-6 bg-black/10 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-black text-white'
              : 'bg-white hover:bg-black/5 text-black'
          }`}
        >
          • Lista
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-black text-white'
              : 'bg-white hover:bg-black/5 text-black'
          }`}
        >
          1. Lista
        </button>

        <div className="w-px h-6 bg-black/10 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-black text-white'
              : 'bg-white hover:bg-black/5 text-black'
          }`}
        >
          " Cytat
        </button>

        <div className="w-px h-6 bg-black/10 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-3 py-1.5 rounded-lg text-sm bg-white hover:bg-black/5 text-black transition-colors"
        >
          ─ Linia
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="bg-white" />
    </div>
  )
}
