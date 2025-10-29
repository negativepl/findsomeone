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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10 shadow-2xl pb-[84px] md:pb-0">
      <div className="container mx-auto px-4 py-5 md:py-6 max-w-4xl">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-black">Używamy ciasteczek</h3>
        </div>

        <p className="text-sm text-black/70 mb-4 leading-relaxed">
          Używamy plików cookie, aby zapewnić podstawowe funkcje witryny i ulepszyć korzystanie z niej.
          Możesz wybrać dla każdej kategorii opcję włączenia/wyłączenia w dowolnym momencie.
          Aby uzyskać więcej informacji na temat plików cookie i innych wrażliwych danych, przeczytaj pełną{' '}
          <Link href="/privacy" className="text-[#C44E35] hover:underline font-medium">
            politykę prywatności
          </Link>.
        </p>

        {/* Cookie Categories */}
        {showDetails && (
          <>
            <div className="space-y-3 mb-4 bg-[#FAF8F3] rounded-2xl p-4">
            {/* Required Cookies */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-black/5">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-black mb-1">Wymagane ciasteczka</h4>
                <p className="text-xs text-black/60">
                  Niezbędne do podstawowego działania witryny. Nie można ich wyłączyć.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-black/50">Zawsze aktywne</span>
                <Switch checked={true} disabled className="opacity-50" />
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-black/5">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-black mb-1">Ciasteczka wydajnościowe i analityczne</h4>
                <p className="text-xs text-black/60">
                  Pozwalają nam analizować sposób korzystania z witryny i mierzyć jej wydajność.
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) => setPreferences({...preferences, analytics: checked})}
              />
            </div>

            {/* Advertising Cookies */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-black/5">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-black mb-1">Personalizacja reklam</h4>
                <p className="text-xs text-black/60">
                  Służą do wyświetlania reklam dopasowanych do Twoich zainteresowań.
                </p>
              </div>
              <Switch
                checked={preferences.advertising}
                onCheckedChange={(checked) => setPreferences({...preferences, advertising: checked})}
              />
            </div>

            {/* Personalization Cookies */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-black/5">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-black mb-1">Personalizacja strony</h4>
                <p className="text-xs text-black/60">
                  Zapamiętują Twoje preferencje i ustawienia dla lepszego doświadczenia.
                </p>
              </div>
              <Switch
                checked={preferences.personalization}
                onCheckedChange={(checked) => setPreferences({...preferences, personalization: checked})}
              />
            </div>

            {/* Security Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-black mb-1">Bezpieczeństwo</h4>
                <p className="text-xs text-black/60">
                  Chronią przed nieautoryzowanym dostępem i zapewniają bezpieczną komunikację.
                </p>
              </div>
              <Switch
                checked={preferences.security}
                onCheckedChange={(checked) => setPreferences({...preferences, security: checked})}
              />
            </div>
          </div>

          {/* Save Button - only visible when details are shown */}
          <div className="mt-4">
            <button
              onClick={acceptSelected}
              className="w-full px-6 py-3 bg-black hover:bg-black/90 text-white font-semibold rounded-xl transition-colors"
            >
              Zapisz wybór
            </button>
          </div>
          </>
        )}

        {/* Action Buttons - always visible */}
        {!showDetails && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={acceptOnlyNecessary}
              className="flex-1 px-6 py-3 border-2 border-black/10 hover:border-black/30 hover:bg-black/5 text-black font-semibold rounded-xl transition-all"
            >
              Tylko niezbędne
            </button>
            <button
              onClick={handleCustomize}
              className="flex-1 px-6 py-3 bg-black hover:bg-black/90 text-white font-semibold rounded-xl transition-colors"
            >
              Dostosuj zgody
            </button>
            <button
              onClick={acceptAll}
              className="flex-1 px-6 py-3 bg-[#C44E35] hover:bg-[#B33D2A] text-white font-semibold rounded-xl transition-colors"
            >
              Zaakceptuj wszystkie
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
