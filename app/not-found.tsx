import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F3] via-[#FFF5E6] to-[#FAF8F3] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8 relative">
          <div className="text-[180px] md:text-[240px] font-black text-[#C44E35]/10 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Animated Search Icon */}
              <div className="animate-bounce">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white shadow-2xl flex items-center justify-center">
                  <Search className="w-12 h-12 md:w-16 md:h-16 text-[#C44E35]" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">
            Ups! Nie znaleźliśmy tej strony
          </h1>

          <p className="text-lg md:text-xl text-black/60 max-w-lg mx-auto">
            Strona, której szukasz, nie istnieje lub została przeniesiona.
            Może ktoś usunął to ogłoszenie? 🤔
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/">
              <Button
                className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white px-8 py-6 text-lg font-semibold transition-colors shadow-lg w-full sm:w-auto"
              >
                Strona główna
              </Button>
            </Link>

            <Link href="/posts">
              <Button
                variant="outline"
                className="rounded-full border-2 border-[#C44E35] bg-white text-[#C44E35] hover:bg-[#C44E35]/10 hover:text-[#C44E35] px-8 py-6 text-lg font-semibold transition-colors w-full sm:w-auto"
              >
                Przeglądaj ogłoszenia
              </Button>
            </Link>
          </div>

          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-black/60 hover:text-black transition-colors mt-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Wróć do poprzedniej strony</span>
          </button>
        </div>

        {/* Fun Facts */}
        <div className="mt-8 text-black/40 text-sm">
          <p>💡 <strong>Ciekawostka:</strong> Błąd 404 pochodzi z pokoju nr 404 w CERN, gdzie znajdował się pierwszy serwer WWW</p>
        </div>
      </div>
    </div>
  )
}
