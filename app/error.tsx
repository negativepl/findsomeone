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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Animation */}
        <div className="mb-8 relative flex items-center justify-center">
          <div className="relative">
            {/* Alert Icon */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-card shadow-2xl dark:shadow-brand/20 flex items-center justify-center border border-border">
              <AlertTriangle className="w-20 h-20 md:w-24 md:h-24 text-brand" strokeWidth={2.5} />
            </div>
            {/* Decorative dots */}
            <div className="absolute -top-4 -right-4 w-4 h-4 rounded-full bg-brand animate-ping"></div>
            <div className="absolute -bottom-4 -left-4 w-3 h-3 rounded-full bg-brand/60 animate-pulse"></div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-3xl shadow-xl p-8 md:p-12 space-y-6 border border-border">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Coś poszło nie tak
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
            Przepraszamy, wystąpił nieoczekiwany błąd. Nasz zespół został powiadomiony i pracuje nad rozwiązaniem problemu.
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-muted rounded-xl p-4 mt-4">
              <summary className="cursor-pointer font-semibold text-sm text-muted-foreground hover:text-foreground">
                Szczegóły techniczne (tylko dev)
              </summary>
              <pre className="mt-2 text-xs text-muted-foreground overflow-auto">
                {error.message}
              </pre>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground/60">
                  Error ID: {error.digest}
                </p>
              )}
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button
              onClick={reset}
              className="rounded-full bg-brand hover:bg-brand/90 text-brand-foreground px-8 py-6 text-lg font-semibold transition-colors shadow-lg w-full sm:w-auto"
            >
              Spróbuj ponownie
            </Button>

            <Link href="/">
              <Button
                variant="outline"
                className="rounded-full border border-brand bg-card text-brand hover:bg-accent hover:text-brand px-8 py-6 text-lg font-semibold transition-colors w-full sm:w-auto"
              >
                Strona główna
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="pt-4 text-sm text-muted-foreground/80">
            <p>Jeśli problem będzie się powtarzał, skontaktuj się z nami poprzez formularz kontaktowy.</p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 text-muted-foreground/60 text-sm space-y-2">
          <p><strong>Wskazówka:</strong> Spróbuj odświeżyć stronę lub wyczyść cache przeglądarki</p>
        </div>
      </div>
    </div>
  )
}
