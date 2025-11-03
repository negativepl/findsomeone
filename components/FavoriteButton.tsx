'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useToggleFavoriteAPI } from '@/lib/hooks/useFavoritesAPI'

interface FavoriteButtonProps {
  postId: string
  initialIsFavorite?: boolean
  showLabel?: boolean
  className?: string
}

export function FavoriteButton({
  postId,
  initialIsFavorite = false,
  showLabel = false,
  className = ''
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const router = useRouter()
  const { toggleFavorite, isLoading } = useToggleFavoriteAPI()

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Optimistic update - UI changes immediately!
    const previousState = isFavorite
    setIsFavorite(!isFavorite)

    try {
      await toggleFavorite(postId, isFavorite)

      // Show success toast
      toast.success(isFavorite ? 'Usunięto z ulubionych' : 'Dodano do ulubionych')
    } catch (error: any) {
      // Rollback on error
      setIsFavorite(previousState)

      if (error.message === 'UNAUTHORIZED') {
        router.push('/login')
        return
      }

      console.error('Error toggling favorite:', error)
      toast.error('Wystąpił błąd. Spróbuj ponownie.')
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`group/fav flex items-center gap-2 ${className}`}
      aria-label={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
    >
      <div className="relative">
        <svg
          className={`w-6 h-6 transition-all duration-300 ease-in-out ${
            isFavorite
              ? 'fill-red-500 text-red-500 scale-100'
              : 'fill-none text-muted-foreground group-hover/fav:text-red-400 group-hover/fav:fill-red-50 group-hover/fav:scale-110'
          } ${isLoading ? 'opacity-50' : ''} active:scale-125`}
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </div>
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
        </span>
      )}
    </button>
  )
}
