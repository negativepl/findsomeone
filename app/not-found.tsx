'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8 relative">
          <div className="text-[180px] md:text-[240px] font-black text-brand/10 dark:text-brand/20 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Animated Search Icon */}
              <div className="animate-bounce">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-card shadow-2xl dark:shadow-brand/20 flex items-center justify-center border border-border">
                  <Search className="w-12 h-12 md:w-16 md:h-16 text-brand" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-3xl shadow-xl p-8 md:p-12 space-y-6 border border-border">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Ups! Nie znaleźliśmy tej strony
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
            Strona, której szukasz, nie istnieje lub została przeniesiona.
            Może ktoś usunął to ogłoszenie? 🤔
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/">
              <Button
                className="rounded-full bg-brand hover:bg-brand/90 text-brand-foreground px-8 py-6 text-lg font-semibold transition-colors shadow-lg w-full sm:w-auto"
              >
                Strona główna
              </Button>
            </Link>

            <Link href="/posts">
              <Button
                variant="outline"
                className="rounded-full border border-brand bg-card text-brand hover:bg-accent hover:text-brand px-8 py-6 text-lg font-semibold transition-colors w-full sm:w-auto"
              >
                Przeglądaj ogłoszenia
              </Button>
            </Link>
          </div>

          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mt-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Wróć do poprzedniej strony</span>
          </button>
        </div>

        {/* Fun Facts */}
        <div className="mt-8 text-muted-foreground/60 text-sm">
          <p><strong>Ciekawostka:</strong> Błąd 404 pochodzi z pokoju nr 404 w CERN, gdzie znajdował się pierwszy serwer WWW</p>
        </div>
      </div>
    </div>
  )
}
