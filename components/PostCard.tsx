import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FavoriteButtonWrapper } from '@/components/FavoriteButtonWrapper'

interface Post {
  id: string
  title: string
  city: string
  district?: string
  price?: number
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
      href={`/search/${post.id}`}
      className="flex-shrink-0 snap-center"
      style={{ width: '280px' }}
    >
      <Card className="border border-border rounded-3xl bg-muted hover:bg-accent transition-all group overflow-hidden gap-0 py-0 cursor-pointer h-full flex flex-col">
        {/* Image */}
        {post.images && post.images.length > 0 && (
          <div className="relative w-full h-40 bg-muted">
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
          {post.categories && (
            <div className="mb-2">
              <Badge variant="outline" className="rounded-full border-border bg-accent text-muted-foreground text-xs">
                {post.categories.name}
              </Badge>
            </div>
          )}
          <CardTitle className="text-base md:text-base font-bold text-foreground">{post.title}</CardTitle>
        </CardHeader>

        <CardContent className="pb-4 mt-auto">
          <div className="flex items-center justify-between gap-2">
            {/* Location - Left */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{post.city}{post.district && `, ${post.district}`}</span>
            </div>

            {/* Price - Right */}
            {post.price ? (
              <p className="text-sm font-bold text-foreground whitespace-nowrap">
                {post.price} zł
              </p>
            ) : (
              post.price_type === 'negotiable' && (
                <p className="text-xs text-muted-foreground whitespace-nowrap">Do negocjacji</p>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
