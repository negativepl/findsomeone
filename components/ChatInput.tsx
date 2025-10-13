'use client'

import { useState } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  onTyping?: (isTyping: boolean) => void
  disabled?: boolean
  placeholder?: string
}

const MIN_MESSAGE_LENGTH = 10
const MAX_MESSAGE_LENGTH = 2000

export function ChatInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = "Napisz wiadomość..."
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleChange = (value: string) => {
    setMessage(value)

    // Notify typing status
    if (onTyping) {
      onTyping(value.length > 0)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = message.trim()

    // Validation
    if (!trimmed) return

    if (trimmed.length < MIN_MESSAGE_LENGTH) {
      setError(`Wiadomość musi mieć minimum ${MIN_MESSAGE_LENGTH} znaków`)
      return
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      setError(`Wiadomość może mieć maksymalnie ${MAX_MESSAGE_LENGTH} znaków`)
      return
    }

    if (!disabled) {
      onSend(trimmed)
      setMessage('')
      setError(null)

      // Stop typing indicator
      if (onTyping) {
        onTyping(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const characterCount = message.length
  const trimmedLength = message.trim().length
  const isValid = trimmedLength >= MIN_MESSAGE_LENGTH && characterCount <= MAX_MESSAGE_LENGTH
  const showWarning = trimmedLength > 0 && trimmedLength < MIN_MESSAGE_LENGTH

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="py-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              maxLength={MAX_MESSAGE_LENGTH}
              className="w-full resize-none rounded-2xl border border-black/10 px-4 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-[#C44E35]/20 focus:border-[#C44E35] disabled:bg-black/5 disabled:cursor-not-allowed max-h-32 overflow-y-auto flex items-center"
              style={{
                minHeight: '44px',
                maxHeight: '128px',
                paddingTop: '11px',
                paddingBottom: '11px',
                lineHeight: '1.5'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = '44px'
                target.style.height = Math.min(target.scrollHeight, 128) + 'px'
              }}
            />
            {/* Character count inside textarea */}
            <div className="absolute right-4 text-xs pointer-events-none flex items-center" style={{ bottom: '11px', height: '22px' }}>
              <span className={characterCount > MAX_MESSAGE_LENGTH - 100 ? 'text-orange-500' : 'text-black/40'}>
                {characterCount} / {MAX_MESSAGE_LENGTH}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={disabled || !isValid}
            className="flex-shrink-0 w-11 h-11 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white disabled:bg-black/10 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>

        {/* Validation errors/warnings only */}
        {(error || showWarning) && (
          <div className="px-1 text-xs">
            {error && (
              <span className="text-red-500">{error}</span>
            )}
            {!error && showWarning && (
              <span className="text-orange-500">
                Minimum {MIN_MESSAGE_LENGTH} znaków
              </span>
            )}
          </div>
        )}
      </div>
    </form>
  )
}
