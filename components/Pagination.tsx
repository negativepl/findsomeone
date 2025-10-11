'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
}

export function Pagination({ currentPage, totalPages, totalItems }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/dashboard?${params.toString()}`)
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7 // Maximum number of page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-12 mb-8">
      {/* Stats */}
      <p className="text-sm text-black/60">
        Strona {currentPage} z {totalPages} • Łącznie: {totalItems} {totalItems === 1 ? 'ogłoszenie' : 'ogłoszeń'}
      </p>

      {/* Pagination controls */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Previous button */}
        <Button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          className="rounded-full border-black/10 hover:border-black/30 hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="ml-1">Poprzednia</span>
        </Button>

        {/* Page numbers */}
        <div className="flex gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-black/40">
                  ...
                </span>
              )
            }

            return (
              <Button
                key={page}
                onClick={() => goToPage(page as number)}
                variant={currentPage === page ? 'default' : 'outline'}
                className={`rounded-full w-10 h-10 p-0 ${
                  currentPage === page
                    ? 'bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0'
                    : 'border-black/10 hover:border-black/30 hover:bg-black/5'
                }`}
              >
                {page}
              </Button>
            )
          })}
        </div>

        {/* Next button */}
        <Button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
          className="rounded-full border-black/10 hover:border-black/30 hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="mr-1">Następna</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
