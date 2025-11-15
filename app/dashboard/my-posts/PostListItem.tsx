'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Pencil,
  PauseCircle,
  CheckCircle,
  PlayCircle,
  Trash2,
  MapPin,
  Clock,
  Eye,
  Phone,
  XCircle,
  RefreshCw,
  ShieldAlert,
  ExternalLink
} from 'lucide-react'

interface Post {
  id: string
  title: string
  description: string
  city: string
  district: string | null
  price: number | null
  price_type: 'hourly' | 'fixed' | 'free' | null
  price_negotiable: boolean | null
  status: 'active' | 'pending' | 'closed' | 'completed'
  moderation_status: 'pending' | 'checking' | 'approved' | 'rejected' | 'flagged'
  moderation_reason: string | null
  appeal_status: 'pending' | 'reviewing' | 'approved' | 'rejected' | null
  appeal_message: string | null
  appealed_at: string | null
  created_at: string
  expires_at: string | null
  extended_count: number
  views: number
  phone_clicks: number
  images: string[] | null
  categories: {
    name: string
    parent: {
      name: string
      parent: {
        name: string
      } | null
    } | null
  } | null
}

interface PostListItemProps {
  post: Post
  isPending: boolean
  onStatusChange: (postId: string, newStatus: 'active' | 'closed' | 'completed') => void
  onDelete: (postId: string) => void
  onAppeal: (postId: string) => void
  onExtend: (postId: string, e: React.MouseEvent) => void
  getDaysUntilExpiry: (expiresAt: string | null) => number | null
  isPendingModeration: (post: Post) => boolean
  isSelected: boolean
  onToggleSelect: (postId: string) => void
}

export function PostListItem({
  post,
  isPending,
  onStatusChange,
  onDelete,
  onAppeal,
  onExtend,
  getDaysUntilExpiry,
  isPendingModeration,
  isSelected,
  onToggleSelect,
}: PostListItemProps) {
  // Build full category path
  const getCategoryPath = () => {
    if (!post.categories) return null

    const parts: string[] = []

    // Add grandparent if exists
    if (post.categories.parent?.parent?.name) {
      parts.push(post.categories.parent.parent.name)
    }

    // Add parent if exists
    if (post.categories.parent?.name) {
      parts.push(post.categories.parent.name)
    }

    // Add current category
    parts.push(post.categories.name)

    return parts.join(' > ')
  }

  return (
    <Card className="border border-border hover:border-foreground/20 rounded-3xl bg-card transition-all group relative overflow-hidden">
      {/* Clickable overlay */}
      <Link
        href={`/dashboard/my-posts/${post.id}`}
        className="absolute inset-0 z-0 rounded-3xl"
        aria-label={`Zobacz ogłoszenie: ${post.title}`}
      />

      <CardContent className="p-0 relative z-10">
        {/* Mobile/Tablet layout */}
        <div className="lg:hidden flex flex-col">
          <div className="p-4 sm:p-5">
            {/* Status badge */}
            {(post.moderation_status === 'rejected' || isPendingModeration(post)) && (
              <div className="mb-3">
                {post.moderation_status === 'rejected' ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 border border-destructive/30 rounded-xl">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-semibold text-destructive">Odrzucone</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-xl">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-muted-foreground">Oczekuje</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 sm:gap-4">
              {/* Image thumbnail with checkbox */}
              {post.images && post.images.length > 0 && (
                <div className="relative overflow-hidden bg-muted flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl">
                  <Image
                    src={post.images[0]}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  {/* Checkbox overlay */}
                  <div className="absolute top-2 left-2 z-20" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(post.id)}
                      className="bg-card shadow-md"
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-2 mb-2">
                  {post.title}
                </h3>

                {/* Category path */}
                {getCategoryPath() && (
                  <div className="mb-2.5">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {getCategoryPath()}
                    </span>
                  </div>
                )}

                {/* ID */}
                <div className="mb-2.5">
                  <span className="text-[9px] sm:text-[10px] font-mono bg-muted text-muted-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 rounded break-all leading-tight">
                    {post.id}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{post.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{post.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{post.phone_clicks || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rejection reason */}
            {post.moderation_status === 'rejected' && post.moderation_reason && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
                <p className="text-xs text-destructive">
                  <span className="font-semibold">Powód:</span> {post.moderation_reason}
                </p>
              </div>
            )}

            {/* Price and Date section */}
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between gap-2">
                {/* Price */}
                {post.price ? (
                  <div>
                    <p className="text-base sm:text-lg font-bold text-foreground">
                      {post.price} zł
                    </p>
                    {post.price_type && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {post.price_type === 'hourly'
                          ? 'za godzinę'
                          : post.price_type === 'fixed'
                          ? 'cena stała'
                          : 'do negocjacji'}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-muted-foreground">Brak ceny</div>
                )}

                {/* Date */}
                <div className="text-[10px] sm:text-xs text-muted-foreground text-right">
                  {new Date(post.created_at).toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Actions only */}
          <div className="border-t-2 border-border bg-muted/30 p-3 sm:p-4">
            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {post.moderation_status === 'rejected' && !post.appeal_status && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    onAppeal(post.id)
                  }}
                  className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-accent border border-border hover:bg-muted flex items-center justify-center sm:gap-2 transition-all relative z-20"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">Odwołaj się</span>
                </button>
              )}

              {post.appeal_status === 'pending' && (
                <div className="h-9 px-2 sm:px-3 rounded-xl bg-accent border border-border flex items-center gap-1.5 sm:gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="hidden sm:inline text-xs font-medium text-muted-foreground">W trakcie odwołania</span>
                </div>
              )}

              <Link href={`/dashboard/my-posts/${post.id}/edit`} className="relative z-20">
                <button className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-accent border border-border hover:bg-muted flex items-center justify-center sm:gap-2 transition-all">
                  <Pencil className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">Edytuj</span>
                </button>
              </Link>

              <Link href={`/posts/${post.id}`} className="relative z-20" target="_blank">
                <button className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-accent border border-border hover:bg-muted flex items-center justify-center sm:gap-2 transition-all">
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">Podgląd</span>
                </button>
              </Link>

              {post.status === 'active' && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      onStatusChange(post.id, 'closed')
                    }}
                    className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-accent border border-border hover:bg-muted flex items-center justify-center sm:gap-2 transition-all relative z-20"
                    disabled={isPending}
                  >
                    <PauseCircle className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-medium">Dezaktywuj</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      onStatusChange(post.id, 'completed')
                    }}
                    className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-accent border border-border hover:bg-muted flex items-center justify-center sm:gap-2 transition-all relative z-20"
                    disabled={isPending}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-medium">Zakończ</span>
                  </button>
                </>
              )}

              {post.status === 'closed' && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    onStatusChange(post.id, 'active')
                  }}
                  className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-accent border border-border hover:bg-muted flex items-center justify-center sm:gap-2 transition-all relative z-20"
                  disabled={isPending}
                >
                  <PlayCircle className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">Aktywuj</span>
                </button>
              )}

              {post.status === 'completed' && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    onStatusChange(post.id, 'active')
                  }}
                  className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-accent border border-border hover:bg-muted flex items-center justify-center sm:gap-2 transition-all relative z-20"
                  disabled={isPending}
                >
                  <PlayCircle className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">Aktywuj ponownie</span>
                </button>
              )}

              <button
                onClick={(e) => {
                  e.preventDefault()
                  onDelete(post.id)
                }}
                className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 flex items-center justify-center sm:gap-2 transition-all relative z-20 ml-auto"
                disabled={isPending}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
                <span className="hidden sm:inline text-xs font-medium text-destructive">Usuń</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:flex h-full overflow-hidden rounded-3xl">
          {/* Image - left side with checkbox */}
          {post.images && post.images.length > 0 && (
            <div className="relative bg-muted w-64 lg:w-72 xl:w-80 flex-shrink-0">
              <Image
                src={post.images[0]}
                alt={post.title}
                fill
                className="object-cover"
              />
              {/* Checkbox overlay */}
              <div className="absolute top-3 left-3 z-20" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(post.id)}
                  className="bg-card shadow-md h-5 w-5"
                />
              </div>
            </div>
          )}

          {/* Content - right side */}
          <div className="flex-1 flex flex-col p-4 lg:p-5 xl:p-6">
            {/* Top section */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                {/* Status badge */}
                {(post.moderation_status === 'rejected' || isPendingModeration(post)) && (
                  <div className="mb-2">
                    {post.moderation_status === 'rejected' ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 border border-destructive/30 rounded-xl">
                        <XCircle className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-semibold text-destructive">Odrzucone</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-xl">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-muted-foreground">Oczekuje na weryfikację</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Title */}
                <h3 className="text-lg lg:text-xl font-bold text-foreground mb-2 line-clamp-2">
                  {post.title}
                </h3>

                {/* Category path */}
                {post.categories && (
                  <div className="mb-3">
                    <span className="text-sm text-muted-foreground">
                      {getCategoryPath()}
                    </span>
                  </div>
                )}
              </div>

              {/* Price - top right */}
              {post.price && (
                <div className="text-right flex-shrink-0">
                  <p className="text-xl lg:text-2xl font-bold text-foreground">
                    {post.price} zł
                  </p>
                  {post.price_type && (
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      {post.price_type === 'hourly'
                        ? 'za godzinę'
                        : post.price_type === 'fixed'
                        ? 'cena stała'
                        : 'do negocjacji'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Rejection reason */}
            {post.moderation_status === 'rejected' && post.moderation_reason && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
                <p className="text-sm text-destructive">
                  <span className="font-semibold">Powód odrzucenia:</span> {post.moderation_reason}
                </p>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Bottom section */}
            <div className="space-y-3 lg:space-y-4">
              {/* Stats */}
              <div className="flex items-center justify-between gap-3 lg:gap-4 text-xs lg:text-sm text-muted-foreground flex-wrap">
                {/* Left side - ID */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                    #{post.id}
                  </span>
                </div>

                {/* Right side - Stats */}
                <div className="flex items-center gap-3 lg:gap-4 xl:gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{post.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{post.views} wyświetleń</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{post.phone_clicks || 0} kliknięć</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(post.created_at).toLocaleDateString('pl-PL', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })},{' '}
                      {new Date(post.created_at).toLocaleTimeString('pl-PL', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border"></div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 lg:gap-2 flex-wrap">
                {post.moderation_status === 'rejected' && !post.appeal_status && (
                  <TooltipProvider delayDuration={500}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            onAppeal(post.id)
                          }}
                          className="h-10 px-4 rounded-xl bg-muted border border-border hover:bg-accent flex items-center gap-2 transition-all relative z-20"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span className="text-sm font-medium">Odwołaj się</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Odwołaj się od decyzji moderacji</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {post.appeal_status === 'pending' && (
                  <div className="h-10 px-4 rounded-xl bg-muted border border-border flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Odwołanie w trakcie</span>
                  </div>
                )}

                <Link href={`/dashboard/my-posts/${post.id}/edit`} className="relative z-20">
                  <button className="h-10 px-3 lg:px-4 rounded-xl bg-muted border border-border hover:bg-accent flex items-center gap-2 transition-all">
                    <Pencil className="w-4 h-4" />
                    <span className="text-xs lg:text-sm font-medium">Edytuj</span>
                  </button>
                </Link>

                <Link href={`/posts/${post.id}`} className="relative z-20" target="_blank">
                  <button className="h-10 px-3 lg:px-4 rounded-xl bg-muted border border-border hover:bg-accent flex items-center gap-2 transition-all">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-xs lg:text-sm font-medium">Podgląd</span>
                  </button>
                </Link>

                {post.status === 'active' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        onStatusChange(post.id, 'closed')
                      }}
                      className="h-10 px-3 lg:px-4 rounded-xl bg-muted border border-border hover:bg-accent flex items-center gap-2 transition-all relative z-20"
                      disabled={isPending}
                    >
                      <PauseCircle className="w-4 h-4" />
                      <span className="text-xs lg:text-sm font-medium">Dezaktywuj</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        onStatusChange(post.id, 'completed')
                      }}
                      className="h-10 px-3 lg:px-4 rounded-xl bg-muted border border-border hover:bg-accent flex items-center gap-2 transition-all relative z-20"
                      disabled={isPending}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs lg:text-sm font-medium">Zakończ</span>
                    </button>
                  </>
                )}

                {(post.status === 'closed' || post.status === 'completed') && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      onStatusChange(post.id, 'active')
                    }}
                    className="h-10 px-3 lg:px-4 rounded-xl bg-muted border border-border hover:bg-accent flex items-center gap-2 transition-all relative z-20"
                    disabled={isPending}
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span className="text-xs lg:text-sm font-medium">
                      {post.status === 'completed' ? 'Aktywuj ponownie' : 'Aktywuj'}
                    </span>
                  </button>
                )}

                <div className="flex-1"></div>

                <button
                  onClick={(e) => {
                    e.preventDefault()
                    onDelete(post.id)
                  }}
                  className="h-10 px-3 lg:px-4 rounded-xl bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 flex items-center gap-2 transition-all relative z-20"
                  disabled={isPending}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                  <span className="text-xs lg:text-sm font-medium text-destructive">Usuń</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
