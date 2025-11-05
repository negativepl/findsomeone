'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function VerifiedBadge() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Verified badge - top right of avatar */}
      <div className="absolute -top-1 -right-1 z-10">
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-amber-100 p-2 cursor-pointer shadow-md hover:bg-amber-200 transition-colors"
          aria-label="Informacje o weryfikacji"
        >
          <svg className="w-6 h-6 text-amber-800" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border-0" showCloseButton={false}>
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-amber-100 p-4">
              <svg className="w-12 h-12 text-amber-800" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black text-center">
              Użytkownik zweryfikowany
            </DialogTitle>
            <DialogDescription className="text-black/70 text-center leading-relaxed text-base pt-2">
              Ten użytkownik przeszedł proces weryfikacji tożsamości. Oznacza to, że jego dane osobowe zostały potwierdzone przez nasz zespół, co zwiększa bezpieczeństwo i wiarygodność transakcji.
            </DialogDescription>
          </DialogHeader>

          {/* Close button */}
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full rounded-full bg-brand hover:bg-brand/90 text-white font-semibold mt-4"
          >
            Rozumiem
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
