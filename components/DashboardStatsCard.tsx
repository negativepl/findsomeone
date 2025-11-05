'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

interface DashboardStatsCardProps {
  href: string
  title: string
  count: number | string
  subtitle?: string
  iconType?: 'megaphone' | 'heart' | 'messages' | 'review' // Made optional since we're not using it
}

export function DashboardStatsCard({ href, title, count, subtitle }: DashboardStatsCardProps) {
  return (
    <Link href={href}>
      <Card className="border border-border rounded-3xl bg-card hover:bg-muted/50 transition-all cursor-pointer h-full">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col justify-center h-full min-h-[100px] md:min-h-[120px] text-left">
            <p className="text-base md:text-lg text-muted-foreground mb-2">{title}</p>
            <div>
              <p className="text-3xl md:text-5xl font-bold text-foreground leading-none">{count}</p>
              {subtitle && (
                <p className="text-xs md:text-sm text-muted-foreground mt-2">{subtitle}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
