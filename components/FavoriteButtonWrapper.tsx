'use client'

import { FavoriteButton } from './FavoriteButton'

interface FavoriteButtonWrapperProps {
  postId: string
  initialIsFavorite?: boolean
  showLabel?: boolean
  className?: string
  withContainer?: boolean
}

export function FavoriteButtonWrapper({
  postId,
  initialIsFavorite = false,
  showLabel = false,
  className = '',
  withContainer = true
}: FavoriteButtonWrapperProps) {
  const button = (
    <FavoriteButton
      postId={postId}
      initialIsFavorite={initialIsFavorite}
      showLabel={showLabel}
      className={className}
    />
  )

  if (withContainer) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-full p-2 hover:bg-white transition-all border border-white/60 shadow-sm">
        {button}
      </div>
    )
  }

  return button
}
