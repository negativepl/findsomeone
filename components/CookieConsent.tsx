'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookieConsent')
    if (!hasAccepted) {
      setShowBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg pb-[84px] md:pb-0">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 text-sm text-muted-foreground">
            <p className="mb-2">
              <strong className="text-foreground">Ta strona używa plików cookies</strong>
            </p>
            <p>
              Używamy plików cookies w celu zapewnienia poprawnego działania strony, analizy ruchu oraz
              personalizacji treści. Korzystając z naszej strony, wyrażasz zgodę na używanie cookies
              zgodnie z naszą{' '}
              <Link
                href="/privacy"
                className="text-primary hover:underline font-medium"
              >
                polityką prywatności
              </Link>.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={acceptCookies}
              className="flex-1 md:flex-none px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
            >
              Rozumiem
            </button>
            <button
              onClick={acceptCookies}
              className="p-2.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Zamknij"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
