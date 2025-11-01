'use client'

import Image from 'next/image'
import { useState, ReactNode, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageGalleryProps {
  images: string[]
  title: string
  favoriteButton?: ReactNode
}

export function ImageGallery({ images, title, favoriteButton }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
  }

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox()
      } else if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen])

  if (images.length === 0) return null

  return (
    <>
      {/* Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative w-full h-[60vh] min-h-[400px] max-h-[700px] rounded-2xl overflow-hidden bg-black/5">
          <Image
            src={images[currentIndex]}
            alt={`${title} - zdjęcie ${currentIndex + 1}`}
            fill
            className="object-cover cursor-zoom-in"
            onClick={() => openLightbox(currentIndex)}
            priority={currentIndex === 0}
          />

          {/* Favorite Button - Top Right (Mobile Only) */}
          {favoriteButton && (
            <div className="lg:hidden absolute top-4 right-4 z-20 scale-125">
              {favoriteButton}
            </div>
          )}

          {/* Navigation Arrows on Main Image */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
                aria-label="Poprzednie zdjęcie"
              >
                <ChevronLeft className="w-6 h-6 text-black" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
                aria-label="Następne zdjęcie"
              >
                <ChevronRight className="w-6 h-6 text-black" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 overflow-x-auto py-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden transition-all ${
                  index === currentIndex
                    ? 'ring-2 ring-[#C44E35] ring-offset-1'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={image}
                  alt={`${title} - miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-10"
            aria-label="Zamknij"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image Counter in Lightbox */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Main Image in Lightbox */}
          <div
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
              <Image
                src={images[currentIndex]}
                alt={`${title} - zdjęcie ${currentIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Navigation in Lightbox */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-10"
                aria-label="Poprzednie zdjęcie"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-10"
                aria-label="Następne zdjęcie"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </>
          )}

          {/* Thumbnails in Lightbox */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8">
              <div className="flex gap-2 overflow-x-auto py-2 justify-center scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentIndex(index)
                    }}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                      index === currentIndex
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                        : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${title} - miniatura ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
