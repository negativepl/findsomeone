'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogoWithText } from '@/components/Logo'

export function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section)
  }

  return (
    <footer className="border-t border-black/5 bg-white rounded-t-3xl pb-24 md:pb-0">
      <div className="container mx-auto px-6 pt-12 pb-6">
        <div className="grid md:grid-cols-4 gap-4 md:gap-8 mb-8">
          {/* Logo i opis */}
          <div className="md:col-span-1">
            <Link href="/">
              <LogoWithText />
            </Link>
            <p className="text-sm text-black/60 mt-4 leading-relaxed">
              Znajdź pomoc w okolicy lub pomóż innym. Wszystko w jednym miejscu.
            </p>
          </div>

          {/* Główne */}
          <div>
            <button
              onClick={() => toggleSection('main')}
              className="flex items-center justify-between w-full md:cursor-default py-2"
              aria-label="Rozwiń sekcję Główne"
              aria-expanded={openSection === 'main'}
            >
              <h4 className="font-semibold text-lg text-black">Główne</h4>
              <svg
                className={`w-5 h-5 text-black/60 transition-transform md:hidden ${
                  openSection === 'main' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ul
              className={`space-y-2 text-sm text-black/60 overflow-hidden transition-all md:!block ${
                openSection === 'main' ? 'max-h-48 mb-4' : 'max-h-0 md:max-h-none'
              }`}
            >
              <li><Link href="/posts" className="hover:text-black transition-colors inline-block py-2">Przeglądaj ogłoszenia</Link></li>
              <li><Link href="/how-it-works" className="hover:text-black transition-colors inline-block py-2">Jak to działa</Link></li>
              <li><Link href="/install" className="hover:text-black transition-colors inline-block py-2">Zainstaluj aplikację</Link></li>
              <li><Link href="/faq" className="hover:text-black transition-colors inline-block py-2">FAQ</Link></li>
            </ul>
          </div>

          {/* Kategorie */}
          <div>
            <button
              onClick={() => toggleSection('categories')}
              className="flex items-center justify-between w-full md:cursor-default py-2"
              aria-label="Rozwiń sekcję Kategorie"
              aria-expanded={openSection === 'categories'}
            >
              <h4 className="font-semibold text-lg text-black">Kategorie</h4>
              <svg
                className={`w-5 h-5 text-black/60 transition-transform md:hidden ${
                  openSection === 'categories' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ul
              className={`space-y-2 text-sm text-black/60 overflow-hidden transition-all md:!block ${
                openSection === 'categories' ? 'max-h-48 mb-4' : 'max-h-0 md:max-h-none'
              }`}
            >
              <li><Link href="/dashboard?category=hydraulika" className="hover:text-black transition-colors inline-block py-2">Hydraulika</Link></li>
              <li><Link href="/dashboard?category=elektryka" className="hover:text-black transition-colors inline-block py-2">Elektryka</Link></li>
              <li><Link href="/dashboard?category=sprzątanie" className="hover:text-black transition-colors inline-block py-2">Sprzątanie</Link></li>
              <li><Link href="/dashboard" className="hover:text-black transition-colors inline-block py-2">Zobacz wszystkie</Link></li>
            </ul>
          </div>

          {/* Firma */}
          <div>
            <button
              onClick={() => toggleSection('company')}
              className="flex items-center justify-between w-full md:cursor-default py-2"
              aria-label="Rozwiń sekcję Firma"
              aria-expanded={openSection === 'company'}
            >
              <h4 className="font-semibold text-lg text-black">Firma</h4>
              <svg
                className={`w-5 h-5 text-black/60 transition-transform md:hidden ${
                  openSection === 'company' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ul
              className={`space-y-2 text-sm text-black/60 overflow-hidden transition-all md:!block ${
                openSection === 'company' ? 'max-h-48 mb-4' : 'max-h-0 md:max-h-none'
              }`}
            >
              <li><Link href="/about" className="hover:text-black transition-colors inline-block py-2">O nas</Link></li>
              <li><Link href="/terms" className="hover:text-black transition-colors inline-block py-2">Regulamin</Link></li>
              <li><Link href="/privacy" className="hover:text-black transition-colors inline-block py-2">Polityka prywatności</Link></li>
              <li><Link href="/contact" className="hover:text-black transition-colors inline-block py-2">Kontakt</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-black/5 pt-6 text-center text-sm text-black/60">
          <p>&copy; 2025 FindSomeone. Wszystkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  )
}
