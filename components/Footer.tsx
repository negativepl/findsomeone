'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogoWithText } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section)
  }

  return (
    <footer className="border-t border-border bg-card rounded-t-3xl">
      <div className="container mx-auto px-6 pt-8 md:pt-12">
        <div className="grid md:grid-cols-4 gap-4 md:gap-8 mb-8">
          {/* Logo i opis */}
          <div className="md:col-span-1">
            <Link href="/">
              <LogoWithText />
            </Link>

            {/* Kontakt */}
            <div className="mt-6">
              <div className="text-sm font-semibold text-foreground mb-3">Kontakt</div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="mailto:kontakt@findsomeone.app" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  kontakt@findsomeone.app
                </a>
                <a href="mailto:pomoc@findsomeone.app" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  pomoc@findsomeone.app
                </a>
              </div>
            </div>

          </div>

          {/* Główne */}
          <div>
            <button
              onClick={() => toggleSection('main')}
              className="flex items-center justify-between w-full md:cursor-default py-2"
              aria-label="Rozwiń sekcję Główne"
              aria-expanded={openSection === 'main'}
            >
              <div className="font-semibold text-lg text-foreground">Główne</div>
              <svg
                className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ease-out md:hidden ${
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
              className={`space-y-2 text-sm text-muted-foreground md:!block ${
                openSection === 'main' ? 'block mb-4' : 'hidden md:max-h-none'
              }`}
            >
              <li><Link href="/how-it-works" className="hover:text-foreground transition-colors inline-block py-2">Jak to działa</Link></li>
              <li><Link href="/install" className="hover:text-foreground transition-colors inline-block py-2">Zainstaluj aplikację</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors inline-block py-2">FAQ</Link></li>
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
              <div className="font-semibold text-lg text-foreground">Kategorie</div>
              <svg
                className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ease-out md:hidden ${
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
              className={`space-y-2 text-sm text-muted-foreground md:!block ${
                openSection === 'categories' ? 'block mb-4' : 'hidden md:max-h-none'
              }`}
            >
              <li><Link href="/posts?category=elektronika" className="hover:text-foreground transition-colors inline-block py-2">Elektronika</Link></li>
              <li><Link href="/posts?category=dom-i-ogrod" className="hover:text-foreground transition-colors inline-block py-2">Dom i ogród</Link></li>
              <li><Link href="/posts?category=sport-i-hobby" className="hover:text-foreground transition-colors inline-block py-2">Sport i hobby</Link></li>
              <li><Link href="/posts" className="hover:text-foreground transition-colors inline-block py-2">Zobacz wszystkie</Link></li>
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
              <div className="font-semibold text-lg text-foreground">Firma</div>
              <svg
                className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ease-out md:hidden ${
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
              className={`space-y-2 text-sm text-muted-foreground md:!block ${
                openSection === 'company' ? 'block mb-4' : 'hidden md:max-h-none'
              }`}
            >
              <li><Link href="/about" className="hover:text-foreground transition-colors inline-block py-2">O nas</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors inline-block py-2">Regulamin</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors inline-block py-2">Polityka prywatności</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors inline-block py-2">Kontakt</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright & Social */}
        <div className="border-t border-border py-6 pb-24 md:pb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Zaprojektowane przez <a href="mailto:mbaszewski@findsomeone.app" className="hover:text-foreground transition-colors">Marcina Baszewskiego</a>
          </p>

          <p className="text-sm text-muted-foreground">© FindSomeone</p>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* Separator */}
            <div className="w-px h-6 bg-border" />

            {/* Social Media Icons */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="transition-transform hover:scale-110"
            >
              <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="transition-transform hover:scale-110"
            >
              <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition-transform hover:scale-110"
            >
              <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="transition-transform hover:scale-110"
            >
              <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/negativepl/findsomeone"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="transition-transform hover:scale-110"
            >
              <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
