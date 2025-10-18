import { Sparkles } from 'lucide-react'

interface AIGeneratedBadgeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AIGeneratedBadge({ className = '', size = 'sm' }: AIGeneratedBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  }

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  return (
    <div
      className={`inline-flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full ${sizeClasses[size]} ${className}`}
      title="Treść wygenerowana przez AI"
    >
      <Sparkles className={iconSizes[size]} />
      <span>AI</span>
    </div>
  )
}
