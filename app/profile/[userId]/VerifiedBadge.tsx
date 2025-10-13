'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export function VerifiedBadge() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {/* Verified badge - top right of avatar */}
      <div className="absolute -top-1 -right-1 z-10">
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-full bg-amber-100 p-2 cursor-pointer shadow-md hover:bg-amber-200 transition-colors"
          aria-label="Informacje o weryfikacji"
        >
          <svg className="w-6 h-6 text-amber-800" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Modal using Portal */}
      {mounted && isModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-amber-100 p-4">
                <svg className="w-12 h-12 text-amber-800" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-black text-center mb-3">
              Użytkownik zweryfikowany
            </h3>

            {/* Description */}
            <p className="text-black/70 text-center leading-relaxed mb-6">
              Ten użytkownik przeszedł proces weryfikacji tożsamości. Oznacza to, że jego dane osobowe zostały potwierdzone przez nasz zespół, co zwiększa bezpieczeństwo i wiarygodność transakcji.
            </p>

            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white font-semibold py-3 px-6 transition-colors"
            >
              Rozumiem
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
