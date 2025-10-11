'use client'

interface TypingIndicatorProps {
  userName?: string
}

export function TypingIndicator({ userName = 'Użytkownik' }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-black/60">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="italic">{userName} pisze...</span>
    </div>
  )
}
