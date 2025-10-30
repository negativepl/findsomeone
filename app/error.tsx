'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F3] via-[#FFF5E6] to-[#FAF8F3] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Animation */}
        <div className="mb-8 relative flex items-center justify-center">
          <div className="relative">
            {/* Alert Icon */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white shadow-2xl flex items-center justify-center">
              <AlertTriangle className="w-20 h-20 md:w-24 md:h-24 text-[#C44E35]" strokeWidth={2.5} />
            </div>
            {/* Decorative dots */}
            <div className="absolute -top-4 -right-4 w-4 h-4 rounded-full bg-[#C44E35] animate-ping"></div>
            <div className="absolute -bottom-4 -left-4 w-3 h-3 rounded-full bg-[#C44E35]/60 animate-pulse"></div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">
            Coś poszło nie tak
          </h1>

          <p className="text-lg md:text-xl text-black/60 max-w-lg mx-auto">
            Przepraszamy, wystąpił nieoczekiwany błąd. Nasz zespół został powiadomiony i pracuje nad rozwiązaniem problemu.
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-black/5 rounded-xl p-4 mt-4">
              <summary className="cursor-pointer font-semibold text-sm text-black/70 hover:text-black">
                Szczegóły techniczne (tylko dev)
              </summary>
              <pre className="mt-2 text-xs text-black/60 overflow-auto">
                {error.message}
              </pre>
              {error.digest && (
                <p className="mt-2 text-xs text-black/40">
                  Error ID: {error.digest}
                </p>
              )}
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button
              onClick={reset}
              className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white px-8 py-6 text-lg font-semibold transition-colors shadow-lg w-full sm:w-auto"
            >
              Spróbuj ponownie
            </Button>

            <Link href="/">
              <Button
                variant="outline"
                className="rounded-full border-2 border-[#C44E35] bg-white text-[#C44E35] hover:bg-[#C44E35]/10 hover:text-[#C44E35] px-8 py-6 text-lg font-semibold transition-colors w-full sm:w-auto"
              >
                Strona główna
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="pt-4 text-sm text-black/50">
            <p>Jeśli problem będzie się powtarzał, skontaktuj się z nami poprzez formularz kontaktowy.</p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 text-black/40 text-sm space-y-2">
          <p>💡 <strong>Wskazówka:</strong> Spróbuj odświeżyć stronę lub wyczyść cache przeglądarki</p>
        </div>
      </div>
    </div>
  )
}
