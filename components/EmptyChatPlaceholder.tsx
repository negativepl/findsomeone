interface EmptyChatPlaceholderProps {
  userName?: string
  onQuickMessageSelect?: (message: string) => void
}

export function EmptyChatPlaceholder({ userName, onQuickMessageSelect }: EmptyChatPlaceholderProps) {
  const quickMessages = [
    '👋 Cześć! Interesuje mnie Twoje ogłoszenie...',
    '💬 Chciałbym dowiedzieć się więcej o...',
    '📍 Czy ta usługa jest dostępna w mojej okolicy?'
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-4">
      <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-brand"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-black mb-2">
        Rozpocznij rozmowę
      </h3>

      <p className="text-black/60 text-center max-w-sm">
        {userName
          ? `To początek Twojej rozmowy z ${userName}. Wyślij pierwszą wiadomość!`
          : 'To początek Twojej rozmowy. Wyślij pierwszą wiadomość!'}
      </p>

      <div className="mt-8 grid gap-3 w-full max-w-md">
        {quickMessages.map((message, index) => (
          <button
            key={index}
            onClick={() => onQuickMessageSelect?.(message)}
            className="bg-white border border-black/10 rounded-2xl p-4 hover:border-brand/30 hover:bg-brand/5 transition-all cursor-pointer text-left"
          >
            <p className="text-sm text-black/70">{message}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
