'use client'

import Link from 'next/link'

interface RatingDisplayProps {
  userId: string
  rating: number
  reviewCount?: number
  className?: string
}

export function RatingDisplay({ userId, rating, reviewCount = 1, className = '' }: RatingDisplayProps) {
  if (rating <= 0) return null

  return (
    <Link
      href={`/profile/${userId}`}
      className={`flex items-center gap-1 text-black/60 hover:text-black transition-colors ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-[#C44E35]">★</span>
      <span className="font-semibold">{rating.toFixed(1)}</span>
      <span className="text-sm">({reviewCount} {reviewCount === 1 ? 'opinii' : 'opinii'})</span>
    </Link>
  )
}
