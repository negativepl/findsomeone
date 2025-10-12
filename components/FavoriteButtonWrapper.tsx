'use client'

import { FavoriteButton } from './FavoriteButton'

interface FavoriteButtonWrapperProps {
  postId: string
  initialIsFavorite?: boolean
  showLabel?: boolean
  className?: string
}

export function FavoriteButtonWrapper({
  postId,
  initialIsFavorite = false,
  showLabel = false,
  className = ''
}: FavoriteButtonWrapperProps) {
  return (
    <FavoriteButton
      postId={postId}
      initialIsFavorite={initialIsFavorite}
      showLabel={showLabel}
      className={className}
    />
  )
}
