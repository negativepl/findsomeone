'use client'

import Link from 'next/link'

interface RatingDisplayProps {
  userId: string
  rating: number
  reviewCount?: number
  className?: string
  clickable?: boolean
}

export function RatingDisplay({ userId, rating, reviewCount = 0, className = '', clickable = true }: RatingDisplayProps) {
  const content = rating > 0 ? (
    <>
      <span className="text-[#C44E35]">★</span>
      <span className="font-semibold">{rating.toFixed(1)}</span>
      <span>({reviewCount} {reviewCount === 1 ? 'opinia' : 'opinii'})</span>
    </>
  ) : (
    <span className="text-muted-foreground italic">Brak opinii</span>
  )

  if (!clickable) {
    return (
      <div className={`flex items-center gap-1 text-muted-foreground ${className}`}>
        {content}
      </div>
    )
  }

  return (
    <Link
      href={`/profile/${userId}`}
      className={`flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {content}
    </Link>
  )
}
