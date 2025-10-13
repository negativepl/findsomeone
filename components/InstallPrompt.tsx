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
    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) return

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      // Show prompt after 5 seconds
      setTimeout(() => setShowPrompt(true), 5000)
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
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 animate-in slide-in-from-bottom duration-300">
      <Card className="border-2 border-[#C44E35] shadow-2xl max-w-md mx-auto md:mx-0">
        <CardContent className="p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Zamknij"
          >
            <X className="w-4 h-4 text-black/60" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#1A1A1A] to-[#C44E35] rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-black mb-1">
                Zainstaluj FindSomeone
              </h3>
              <p className="text-sm text-black/70 mb-3 leading-snug">
                Dodaj aplikację do ekranu głównego dla szybszego dostępu i powiadomień!
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="flex-1 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-9 text-sm"
                >
                  Zainstaluj
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="rounded-full border-black/10 text-black/60 hover:bg-black/5 h-9 text-sm px-4"
                >
                  Później
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
