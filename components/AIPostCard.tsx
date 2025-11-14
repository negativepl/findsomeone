'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Tag } from 'lucide-react'

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
        className="flex flex-col h-full group bg-muted rounded-xl border border-border hover:border-brand/40 hover:bg-accent transition-all overflow-hidden"
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
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{city}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-muted-foreground">{price}</span>
          </div>
        </div>
        </div>
      </Link>
    </motion.div>
  )
}
