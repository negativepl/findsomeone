'use client'

import { useState } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  onTyping?: (isTyping: boolean) => void
  disabled?: boolean
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

const MIN_MESSAGE_LENGTH = 10
const MAX_MESSAGE_LENGTH = 2000

export function ChatInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = "Napisz wiadomość...",
  value: externalValue,
  onChange: externalOnChange
}: ChatInputProps) {
  const [internalMessage, setInternalMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Use external value if provided, otherwise use internal state
  const message = externalValue !== undefined ? externalValue : internalMessage
  const setMessage = externalOnChange !== undefined ? externalOnChange : setInternalMessage

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

      // Clear message - use internal state since external onChange will be called from parent
      if (externalOnChange === undefined) {
        setMessage('')
      }
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
          <div className="flex-1 relative flex items-center rounded-2xl border border-border bg-background focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand disabled:bg-muted h-[44px] px-4">
            <textarea
              value={message}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={1}
              className="resize-none text-base text-foreground placeholder:text-muted-foreground focus:outline-none bg-transparent disabled:cursor-not-allowed overflow-x-auto overflow-y-hidden whitespace-nowrap leading-normal py-2.5"
              style={{
                maxHeight: '44px',
                width: 'calc(100% - 72px)'
              }}
            />
            {/* Character count and warning on the right */}
            <div className="absolute right-4 flex items-center gap-2 text-xs pointer-events-none bg-background pl-2">
              {showWarning && (
                <span className="text-brand">
                  Wpisz minimum {MIN_MESSAGE_LENGTH} znaków
                </span>
              )}
              <span className={characterCount > MAX_MESSAGE_LENGTH - 100 ? 'text-brand' : 'text-muted-foreground'}>
                {characterCount} / {MAX_MESSAGE_LENGTH}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={disabled || !isValid}
            className="flex-shrink-0 w-11 h-11 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground disabled:bg-muted disabled:text-border disabled:cursor-not-allowed transition-colors flex items-center justify-center border border-border/50"
            aria-label="Wyślij wiadomość"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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

        {/* Validation errors only */}
        {error && (
          <div className="px-1 text-xs">
            <span className="text-red-500">{error}</span>
          </div>
        )}
      </div>
    </form>
  )
}
