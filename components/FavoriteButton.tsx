'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)

    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId }),
        })

        if (response.status === 401) {
          router.push('/login')
          return
        }

        if (response.ok) {
          setIsFavorite(false)
          toast.success('Usunięto z ulubionych')
        } else {
          toast.error('Nie udało się usunąć z ulubionych')
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId }),
        })

        if (response.status === 401) {
          router.push('/login')
          return
        }

        if (response.ok) {
          setIsFavorite(true)
          toast.success('Dodano do ulubionych')
        } else {
          toast.error('Nie udało się dodać do ulubionych')
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`group/fav flex items-center gap-2 transition-all ${className}`}
      aria-label={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
    >
      <div className="relative">
        <svg
          className={`w-6 h-6 transition-all ${
            isFavorite
              ? 'fill-red-500 text-red-500'
              : 'fill-none text-black/40 group-hover/fav:text-red-500 group-hover/fav:fill-red-100'
          } ${isLoading ? 'opacity-50' : ''}`}
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
        <span className="text-sm text-black/60">
          {isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
        </span>
      )}
    </button>
  )
}
