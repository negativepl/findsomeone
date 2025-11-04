'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface AIPostCardProps {
  id: string
  title: string
  description: string
  price: string
  city: string
  url: string
  authorName: string
  authorAvatar?: string | null
  categoryName?: string
  image?: string | null
  index?: number
}

export function AIPostCard({
  title,
  description,
  price,
  city,
  url,
  authorName,
  authorAvatar,
  categoryName,
  image,
  index = 0
}: AIPostCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -10,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.2,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="h-full w-full"
    >
      <Link
        href={url}
        className="flex flex-col h-full group bg-card rounded-xl border border-border hover:border-brand/40 hover:bg-brand/[0.02] transition-all overflow-hidden"
      >
        {/* Image */}
        {image && (
          <div className="relative w-full h-32 bg-muted">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="280px"
            />
          </div>
        )}

        <div className="flex flex-col flex-1 p-3.5">
          {/* Title */}
          <h4 className="font-semibold text-foreground text-base mb-3 pb-3 border-b border-border group-hover:text-brand transition-colors">
            {title}
          </h4>

        {/* Meta info */}
        <div className="flex items-center justify-between text-[15px] mt-auto">
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 430 430" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="14" strokeWidth="12">
                <path stroke="#121331" d="M104.199 215.4c-3.8-11.7-6-24.1-6-37 0-67.1 56.5-120.9 124.6-116.5 57.7 3.7 104.6 50.3 108.7 107.9 1.1 15-.8 29.5-4.8 43-18.8 62.9-111.7 155.6-111.7 155.6s-87.4-80.6-110.8-153"/>
                <path stroke="#c44e35" d="M270 178.4c0 30.4-24.6 55-55 55s-55-24.6-55-55 24.6-55 55-55 55 24.6 55 55"/>
              </g>
            </svg>
            <span className="text-muted-foreground">{city}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 430 430" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g strokeLinecap="round" strokeLinejoin="round">
                <path stroke="#121331" strokeWidth="12" d="M375 189.251 185.594 380 50 244.406 240.749 55H375z"/>
                <path stroke="#c44e35" strokeWidth="18" d="M327.453 102.547h.021"/>
              </g>
            </svg>
            <span className="font-semibold text-muted-foreground">{price}</span>
          </div>
        </div>
        </div>
      </Link>
    </motion.div>
  )
}
