import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FavoriteButtonWrapper } from '@/components/FavoriteButtonWrapper'

interface Post {
  id: string
  title: string
  type: 'seeking' | 'offering'
  city: string
  district?: string
  price_min?: number
  price_max?: number
  price_type?: string
  images?: string[]
  categories?: {
    name: string
  }
}

interface PostCardProps {
  post: Post
  isFavorite: boolean
  priority?: boolean
}

export function PostCard({ post, isFavorite, priority = false }: PostCardProps) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="flex-shrink-0 snap-center"
      style={{ width: '280px' }}
    >
      <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all group overflow-hidden gap-0 py-0 cursor-pointer h-full flex flex-col">
        {/* Image */}
        {post.images && post.images.length > 0 && (
          <div className="relative w-full h-40 bg-black/5">
            <Image
              src={post.images[0]}
              alt={post.title}
              fill
              sizes="280px"
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3 z-10" data-no-loader="true">
              <FavoriteButtonWrapper
                postId={post.id}
                initialIsFavorite={isFavorite}
              />
            </div>
          </div>
        )}

        <CardHeader className="pb-3 pt-4">
          <div className="flex items-start justify-between mb-2">
            <Badge
              className={`rounded-full px-2 py-1 text-xs ${
                post.type === 'seeking'
                  ? 'bg-[#C44E35] text-white border-0'
                  : 'bg-black text-white border-0'
              }`}
            >
              {post.type === 'seeking' ? 'Szukam' : 'Oferuję'}
            </Badge>
            {post.categories && (
              <Badge variant="outline" className="rounded-full border-black/10 text-black/60 text-xs">
                {post.categories.name}
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg font-bold text-black">{post.title}</CardTitle>
        </CardHeader>

        <CardContent className="pb-4 mt-auto space-y-2">
          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-black/60">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{post.city}{post.district && `, ${post.district}`}</span>
          </div>

          {/* Price */}
          {(post.price_min || post.price_max) ? (
            <p className="text-sm font-bold text-black">
              {post.price_min && post.price_max
                ? `${post.price_min}-${post.price_max} zł`
                : post.price_min
                ? `${post.price_min} zł`
                : `${post.price_max} zł`}
            </p>
          ) : (
            post.price_type === 'negotiable' && (
              <p className="text-xs text-black/60">Do negocjacji</p>
            )
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
