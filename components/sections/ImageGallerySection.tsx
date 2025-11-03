'use client'

import { HomepageSection } from '@/lib/homepage-sections/types'
import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ImageGallerySectionProps {
  section: HomepageSection
}

export function ImageGallerySection({ section }: ImageGallerySectionProps) {
  const config = section.config as any
  const images = config.images || []
  const layout = config.layout || 'grid'
  const columns = config.columns || 3
  const lightbox = config.lightbox !== false
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Check if component is mounted (for portal)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxImage])

  const handleCloseLightbox = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setLightboxImage(null)
      setIsClosing(false)
    }, 200) // Match animation duration
  }, [])

  // Handle ESC key to close lightbox
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxImage) {
        handleCloseLightbox()
      }
    }

    if (lightboxImage) {
      window.addEventListener('keydown', handleEscape)
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [lightboxImage, handleCloseLightbox])

  if (images.length === 0) {
    return (
      <section className="py-12 md:py-14">
        <div className="container mx-auto px-6">
          <div className="text-center text-foreground/40 py-12 border-2 border-dashed border-black/10 rounded-2xl">
            Brak zdjęć. Dodaj obrazki w konfiguracji sekcji.
          </div>
        </div>
      </section>
    )
  }

  const columnClasses = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  }

  const gridClass = columnClasses[columns as keyof typeof columnClasses] || columnClasses[3]

  // Carousel layout
  if (layout === 'carousel') {
    return (
      <>
        <section className="py-12 md:py-14">
          <div className="container mx-auto px-6">
            {section.title && (
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-sm md:text-lg text-muted-foreground">
                    {section.subtitle}
                  </p>
                )}
              </div>
            )}

            <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-6 px-6">
              <div className="flex gap-4 pb-4">
                {images.map((image: any, index: number) => (
                  <div
                    key={index}
                    className="flex-shrink-0 snap-center relative group overflow-hidden rounded-2xl cursor-pointer"
                    style={{ width: '400px' }}
                    onClick={() => lightbox && setLightboxImage(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `Gallery image ${index + 1}`}
                      className="w-full h-80 object-cover transition-transform group-hover:scale-105"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="text-white text-sm">
                          {image.caption}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Lightbox */}
        {mounted && lightbox && lightboxImage && createPortal(
          <div
            className="flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999999,
              overflow: 'hidden',
              animation: isClosing ? 'fadeOut 0.2s ease-out' : 'fadeIn 0.2s ease-in'
            }}
            onClick={handleCloseLightbox}
          >
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                  }
                  to {
                    opacity: 1;
                  }
                }
                @keyframes fadeOut {
                  from {
                    opacity: 1;
                  }
                  to {
                    opacity: 0;
                  }
                }
                @keyframes scaleIn {
                  from {
                    transform: scale(0.9);
                    opacity: 0;
                  }
                  to {
                    transform: scale(1);
                    opacity: 1;
                  }
                }
                @keyframes scaleOut {
                  from {
                    transform: scale(1);
                    opacity: 1;
                  }
                  to {
                    transform: scale(0.9);
                    opacity: 0;
                  }
                }
              `
            }} />

            <button
              onClick={handleCloseLightbox}
              className="absolute top-4 right-4 bg-card hover:bg-accent rounded-full p-2 transition-all shadow-lg"
              style={{ zIndex: 1000000 }}
            >
              <X className="w-6 h-6 text-foreground" />
            </button>

            <img
              src={lightboxImage}
              alt="Gallery"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              style={{
                zIndex: 999999,
                animation: isClosing ? 'scaleOut 0.2s ease-out' : 'scaleIn 0.2s ease-in'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
      </>
    )
  }

  // Masonry layout
  if (layout === 'masonry') {
    return (
      <>
        <section className="py-12 md:py-14">
          <div className="container mx-auto px-6">
            {section.title && (
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-sm md:text-lg text-muted-foreground">
                    {section.subtitle}
                  </p>
                )}
              </div>
            )}

            <div className={`columns-1 ${gridClass.replace('grid-cols', 'columns')} gap-4 space-y-4`}>
              {images.map((image: any, index: number) => (
                <div
                  key={index}
                  className="break-inside-avoid relative group overflow-hidden rounded-2xl cursor-pointer mb-4"
                  onClick={() => lightbox && setLightboxImage(image.url)}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `Gallery image ${index + 1}`}
                    className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                  />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <p className="text-white text-sm">
                        {image.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox */}
        {mounted && lightbox && lightboxImage && createPortal(
          <div
            className="flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999999,
              overflow: 'hidden',
              animation: isClosing ? 'fadeOut 0.2s ease-out' : 'fadeIn 0.2s ease-in'
            }}
            onClick={handleCloseLightbox}
          >
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                  }
                  to {
                    opacity: 1;
                  }
                }
                @keyframes fadeOut {
                  from {
                    opacity: 1;
                  }
                  to {
                    opacity: 0;
                  }
                }
                @keyframes scaleIn {
                  from {
                    transform: scale(0.9);
                    opacity: 0;
                  }
                  to {
                    transform: scale(1);
                    opacity: 1;
                  }
                }
                @keyframes scaleOut {
                  from {
                    transform: scale(1);
                    opacity: 1;
                  }
                  to {
                    transform: scale(0.9);
                    opacity: 0;
                  }
                }
              `
            }} />

            <button
              onClick={handleCloseLightbox}
              className="absolute top-4 right-4 bg-card hover:bg-accent rounded-full p-2 transition-all shadow-lg"
              style={{ zIndex: 1000000 }}
            >
              <X className="w-6 h-6 text-foreground" />
            </button>

            <img
              src={lightboxImage}
              alt="Gallery"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              style={{
                zIndex: 999999,
                animation: isClosing ? 'scaleOut 0.2s ease-out' : 'scaleIn 0.2s ease-in'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
      </>
    )
  }

  // Grid layout (default)
  return (
    <>
      <section className="py-12 md:py-14">
        <div className="container mx-auto px-6">
          {section.title && (
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {section.title}
              </h2>
              {section.subtitle && (
                <p className="text-sm md:text-lg text-muted-foreground">
                  {section.subtitle}
                </p>
              )}
            </div>
          )}

          <div className={`grid grid-cols-1 ${gridClass} gap-4`}>
            {images.map((image: any, index: number) => (
              <div
                key={index}
                className="relative group overflow-hidden rounded-2xl cursor-pointer"
                onClick={() => lightbox && setLightboxImage(image.url)}
              >
                <img
                  src={image.url}
                  alt={image.alt || `Gallery image ${index + 1}`}
                  className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-sm">
                      {image.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox - using Portal to render at body level */}
      {mounted && lightbox && lightboxImage && createPortal(
        <div
          className="flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            overflow: 'hidden',
            animation: isClosing ? 'fadeOut 0.2s ease-out' : 'fadeIn 0.2s ease-in'
          }}
          onClick={handleCloseLightbox}
        >
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes fadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
              @keyframes fadeOut {
                from {
                  opacity: 1;
                }
                to {
                  opacity: 0;
                }
              }
              @keyframes scaleIn {
                from {
                  transform: scale(0.9);
                  opacity: 0;
                }
                to {
                  transform: scale(1);
                  opacity: 1;
                }
              }
              @keyframes scaleOut {
                from {
                  transform: scale(1);
                  opacity: 1;
                }
                to {
                  transform: scale(0.9);
                  opacity: 0;
                }
              }
            `
          }} />

          <button
            onClick={handleCloseLightbox}
            className="absolute top-4 right-4 bg-card hover:bg-accent rounded-full p-2 transition-all shadow-lg"
            style={{ zIndex: 1000000 }}
          >
            <X className="w-6 h-6 text-foreground" />
          </button>

          <img
            src={lightboxImage}
            alt="Gallery"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            style={{
              zIndex: 999999,
              animation: isClosing ? 'scaleOut 0.2s ease-out' : 'scaleIn 0.2s ease-in'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  )
}
