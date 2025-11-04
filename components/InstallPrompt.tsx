'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already dismissed and when
    const dismissedData = localStorage.getItem('pwa-install-dismissed')
    if (dismissedData) {
      const { timestamp } = JSON.parse(dismissedData)
      const daysSinceDismissal = (Date.now() - timestamp) / (1000 * 60 * 60 * 24)

      // Only show again after 7 days
      if (daysSinceDismissal < 7) return
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      // Show prompt after 30 seconds (not 5)
      setTimeout(() => setShowPrompt(true), 30000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDeferredPrompt(null)
    localStorage.setItem('pwa-install-dismissed', JSON.stringify({
      timestamp: Date.now(),
      dismissed: true
    }))
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 animate-in slide-in-from-bottom duration-300">
      <Card className="border-border shadow-2xl max-w-md mx-auto md:mx-0">
        <CardContent className="p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-accent transition-colors"
            aria-label="Zamknij"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="flex items-start pr-6">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-foreground mb-1">
                Zainstaluj FindSomeone
              </h3>
              <p className="text-sm text-muted-foreground mb-3 leading-snug">
                Dodaj aplikację do ekranu głównego dla szybszego dostępu i powiadomień!
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-3 py-1.5 md:py-2 hover:bg-accent text-foreground text-sm font-semibold rounded-full transition-all"
                >
                  Później
                </button>
                <button
                  onClick={handleInstall}
                  className="flex-1 px-3 py-1.5 md:py-2 bg-brand hover:bg-brand/90 text-brand-foreground text-sm font-semibold rounded-full transition-colors"
                >
                  Zainstaluj
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
