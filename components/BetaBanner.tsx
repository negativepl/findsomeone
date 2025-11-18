'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the banner
    const isDismissed = localStorage.getItem('betaBannerDismissed')
    if (!isDismissed) {
      setIsVisible(true)
      // Add class to body when banner is visible
      document.body.classList.add('beta-banner-visible')
    }

    return () => {
      document.body.classList.remove('beta-banner-visible')
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('betaBannerDismissed', 'true')
    // Remove class from body when banner is dismissed
    document.body.classList.remove('beta-banner-visible')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 left-0 right-0 z-[9998] bg-card border-b border-border rounded-b-3xl"
        >
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-center gap-4 text-xs md:text-base">
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 text-brand font-semibold text-xs">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  BETA
                </div>
                <p className="text-foreground">
                  <span className="hidden md:inline">Projekt w fazie beta. Masz uwagi lub sugestie?{' '}</span>
                  <span className="md:hidden">Wersja beta. Masz uwagi? {' '}</span>
                  <a
                    href="mailto:mbaszewski@findsomeone.app"
                    className="font-semibold text-brand hover:text-brand/80 transition-colors underline decoration-brand/30 hover:decoration-brand/60"
                  >
                    <span className="hidden md:inline">Napisz do mnie</span>
                    <span className="md:hidden">Napisz</span>
                  </a>
                </p>
              </div>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-brand/10 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Zamknij banner"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
