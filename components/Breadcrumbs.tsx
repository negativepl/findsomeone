'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 overflow-x-auto scrollbar-hide">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center gap-2 flex-shrink-0">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[#C44E35] transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`whitespace-nowrap ${isLast ? 'text-foreground font-medium truncate max-w-[150px] md:max-w-none' : ''}`}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
          </div>
        )
      })}
    </nav>
  )
}
