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
    <nav className="flex items-center gap-2 text-sm text-black/60 mb-6">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[#C44E35] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-black font-medium' : ''}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </div>
        )
      })}
    </nav>
  )
}
