'use client'

import Link from 'next/link'

interface RatingDisplayProps {
  userId: string
  rating: number
  reviewCount?: number
  className?: string
  clickable?: boolean
}

export function RatingDisplay({ userId, rating, reviewCount = 1, className = '', clickable = true }: RatingDisplayProps) {
  if (rating <= 0) return null

  const content = (
    <>
      <span className="text-[#C44E35]">★</span>
      <span className="font-semibold">{rating.toFixed(1)}</span>
      <span className="text-sm">({reviewCount} {reviewCount === 1 ? 'opinii' : 'opinii'})</span>
    </>
  )

  if (!clickable) {
    return (
      <div className={`flex items-center gap-1 text-black/60 ${className}`}>
        {content}
      </div>
    )
  }

  return (
    <Link
      href={`/profile/${userId}`}
      className={`flex items-center gap-1 text-black/60 hover:text-black transition-colors ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {content}
    </Link>
  )
}
