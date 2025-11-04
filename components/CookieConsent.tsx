'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'

interface CookiePreferences {
  required: boolean // Always true
  analytics: boolean
  advertising: boolean
  personalization: boolean
  security: boolean
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    required: true,
    analytics: false,
    advertising: false,
    personalization: false,
    security: true, // Security enabled by default
  })

  useEffect(() => {
    // Check if user has already set cookie preferences
    const savedPreferences = localStorage.getItem('cookiePreferences')
    if (!savedPreferences) {
      setShowBanner(true)
    }
  }, [])

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs))
    setShowBanner(false)
  }

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      required: true,
      analytics: true,
      advertising: true,
      personalization: true,
      security: true,
    }
    setPreferences(allAccepted)
    savePreferences(allAccepted)
  }

  const acceptSelected = () => {
    savePreferences(preferences)
  }

  const acceptOnlyNecessary = () => {
    const minimal: CookiePreferences = {
      required: true,
      analytics: false,
      advertising: false,
      personalization: false,
      security: true,
    }
    setPreferences(minimal)
    savePreferences(minimal)
  }

  const handleCustomize = () => {
    setShowDetails(!showDetails)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-6 md:right-auto md:bottom-6 z-50 bg-card border-t md:border border-border shadow-2xl pb-[84px] md:pb-0 rounded-t-3xl md:rounded-3xl md:max-w-md">
      <div className="mx-auto px-4 py-4 md:px-4 md:py-4">
        <div className="mb-2 md:mb-3">
          <h3 className="text-base md:text-lg font-bold text-foreground">Używamy ciasteczek</h3>
        </div>

        <p className="text-xs md:text-sm text-muted-foreground mb-2 leading-snug">
          Używamy plików cookie, aby zapewnić podstawowe funkcje witryny i ulepszyć korzystanie z niej. Więcej informacji znajdziesz w{' '}
          <Link href="/privacy" className="text-brand hover:underline font-medium">
            polityce prywatności
          </Link>.
        </p>

        {/* Customize button - moved up */}
        {!showDetails && (
          <button
            onClick={handleCustomize}
            className="text-xs text-muted-foreground hover:text-foreground underline mb-3 transition-colors"
          >
            Dostosuj ustawienia
          </button>
        )}

        {/* Cookie Categories */}
        {showDetails && (
          <>
            {/* Back button */}
            <button
              onClick={handleCustomize}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Wróć
            </button>
            <div className="space-y-2 mb-3 bg-secondary rounded-xl p-3 max-h-[40vh] md:max-h-[50vh] overflow-y-auto">
            {/* Required Cookies */}
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-border">
              <div className="flex-1">
                <h4 className="text-xs md:text-sm font-semibold text-foreground mb-0.5">Wymagane</h4>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  Niezbędne do działania witryny.
                </p>
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[10px] md:text-xs text-muted-foreground">Aktywne</span>
                <Switch checked={true} disabled className="opacity-50" />
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-border">
              <div className="flex-1">
                <h4 className="text-xs md:text-sm font-semibold text-foreground mb-0.5">Analityczne</h4>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  Analizują korzystanie z witryny.
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) => setPreferences({...preferences, analytics: checked})}
              />
            </div>

            {/* Advertising Cookies */}
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-border">
              <div className="flex-1">
                <h4 className="text-xs md:text-sm font-semibold text-foreground mb-0.5">Reklamy</h4>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  Dopasowane do zainteresowań.
                </p>
              </div>
              <Switch
                checked={preferences.advertising}
                onCheckedChange={(checked) => setPreferences({...preferences, advertising: checked})}
              />
            </div>

            {/* Personalization Cookies */}
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-border">
              <div className="flex-1">
                <h4 className="text-xs md:text-sm font-semibold text-foreground mb-0.5">Personalizacja</h4>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  Zapamiętują preferencje.
                </p>
              </div>
              <Switch
                checked={preferences.personalization}
                onCheckedChange={(checked) => setPreferences({...preferences, personalization: checked})}
              />
            </div>

            {/* Security Cookies */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h4 className="text-xs md:text-sm font-semibold text-foreground mb-0.5">Bezpieczeństwo</h4>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  Chronią przed dostępem.
                </p>
              </div>
              <Switch
                checked={preferences.security}
                onCheckedChange={(checked) => setPreferences({...preferences, security: checked})}
              />
            </div>
          </div>

          {/* Save Button - only visible when details are shown */}
          <div className="mt-3">
            <button
              onClick={acceptSelected}
              className="w-full px-4 py-2 md:py-2.5 bg-brand hover:bg-brand/90 text-brand-foreground text-sm font-semibold rounded-full transition-colors"
            >
              Zapisz wybór
            </button>
          </div>
          </>
        )}

        {/* Action Buttons - always visible */}
        {!showDetails && (
          <div className="flex gap-2">
            <button
              onClick={acceptOnlyNecessary}
              className="flex-1 px-3 py-1.5 md:py-2 hover:bg-accent text-foreground text-xs md:text-sm font-semibold rounded-full transition-all"
            >
              Tylko niezbędne
            </button>
            <button
              onClick={acceptAll}
              className="flex-1 px-3 py-1.5 md:py-2 bg-brand hover:bg-brand/90 text-brand-foreground text-xs md:text-sm font-semibold rounded-full transition-colors"
            >
              Akceptuj wszystkie
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
