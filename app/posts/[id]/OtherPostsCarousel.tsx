'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { ScrollArrows } from '@/components/ScrollArrows'

interface OtherPost {
  id: string
  title: string
  city: string
  price: number | null
  images: string[] | null
  categories?: {
    name: string
  } | {
    name: string
  }[] | null
}

interface OtherPostsCarouselProps {
  posts: OtherPost[]
  containerId: string
}

export function OtherPostsCarousel({ posts, containerId }: OtherPostsCarouselProps) {
  const [showLeftGradient, setShowLeftGradient] = useState(false)
  const [showRightGradient, setShowRightGradient] = useState(true)

  const checkScroll = () => {
    const container = document.getElementById(containerId)
    if (container) {
      setShowLeftGradient(container.scrollLeft > 0)
      const canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      setShowRightGradient(canScrollRight)
    }
  }

  useEffect(() => {
    const container = document.getElementById(containerId)
    if (container) {
      checkScroll()

      const timeouts = [50, 100, 200, 500].map(delay =>
        setTimeout(checkScroll, delay)
      )

      container.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)

      const resizeObserver = new ResizeObserver(checkScroll)
      resizeObserver.observe(container)

      const images = container.querySelectorAll('img')
      images.forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', checkScroll)
        }
      })

      return () => {
        timeouts.forEach(clearTimeout)
        container.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
        resizeObserver.disconnect()
        images.forEach(img => {
          img.removeEventListener('load', checkScroll)
        })
      }
    }
  }, [containerId])

  return (
    <div className="relative -mx-6 group/section">
      <ScrollArrows containerId={containerId} />

      {/* Dynamic gradients for full height */}
      <div className={`absolute left-0 top-0 bottom-0 w-12 md:w-16 pointer-events-none z-[15] bg-gradient-to-r from-card via-card/60 to-transparent transition-opacity duration-300 ${showLeftGradient ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute right-0 top-0 bottom-0 w-12 md:w-16 pointer-events-none z-[15] bg-gradient-to-l from-card via-card/60 to-transparent transition-opacity duration-300 ${showRightGradient ? 'opacity-100' : 'opacity-0'}`} />

      <div id={containerId} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 px-6">
        {posts.map((otherPost) => (
          <Link key={otherPost.id} href={`/posts/${otherPost.id}`} className="snap-center flex-shrink-0" style={{ width: '280px' }}>
            <div className="border border-border rounded-3xl bg-muted hover:bg-accent transition-all group overflow-hidden cursor-pointer h-full flex flex-col shadow-sm">
              {otherPost.images && otherPost.images.length > 0 && (
                <div className="relative w-full h-40 bg-muted">
                  <Image
                    src={otherPost.images[0]}
                    alt={otherPost.title}
                    fill
                    sizes="280px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                {otherPost.categories && (
                  <div className="mb-2">
                    <Badge variant="outline" className="rounded-full border-border text-muted-foreground text-xs">
                      {Array.isArray(otherPost.categories) ? otherPost.categories[0]?.name : otherPost.categories.name}
                    </Badge>
                  </div>
                )}
                <h3 className="text-base font-bold text-foreground mb-3">{otherPost.title}</h3>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{otherPost.city}</span>
                  </div>
                  {otherPost.price && (
                    <p className="text-sm font-bold text-foreground whitespace-nowrap">
                      {otherPost.price} zł
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
