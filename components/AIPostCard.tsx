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
        y: 20,
        scale: 0.95
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      <Link
        href={url}
        className="block group bg-white rounded-2xl border border-black/10 hover:border-[#C44E35]/30 hover:shadow-lg transition-all overflow-hidden"
      >
        {/* Image */}
        {image && (
          <div className="relative w-full h-32 bg-black/5">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 400px) 100vw, 400px"
            />
          </div>
        )}

        <div className="p-3">
          {/* Category badge */}
          {categoryName && (
            <div className="mb-2">
              <span className="inline-block px-2 py-0.5 bg-black/5 text-black/60 text-xs rounded-full">
                {categoryName}
              </span>
            </div>
          )}

          {/* Title */}
          <h4 className="font-semibold text-black text-sm mb-2 line-clamp-2 group-hover:text-[#C44E35] transition-colors">
            {title}
          </h4>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-black/5">
            {/* Author */}
            <div className="flex items-center gap-1.5">
              {authorAvatar ? (
                <div className="relative w-5 h-5 rounded-full overflow-hidden bg-black/5">
                  <Image
                    src={authorAvatar}
                    alt={authorName}
                    fill
                    className="object-cover"
                    sizes="20px"
                  />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#C44E35] flex items-center justify-center">
                  <span className="text-xs text-white font-medium">
                    {authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-xs text-black/60 truncate max-w-[100px]">
                {authorName}
              </span>
            </div>

            {/* Price & Location */}
            <div className="text-right">
              <div className="text-xs font-semibold text-[#C44E35]">
                {price}
              </div>
              <div className="text-xs text-black/40">
                {city}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
