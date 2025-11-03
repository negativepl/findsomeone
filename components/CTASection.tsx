'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LottieIcon } from '@/components/LottieIcon'

export function CTASection() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="container mx-auto px-6 py-3 md:py-14">
      <div
        className="border border-border bg-card rounded-[3rem] p-12 md:p-16"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Animowana ikona */}
          <div className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0 md:rotate-12">
            <LottieIcon
              animationPathLight="/animations/marketing-campaign-light.json"
              animationPathDark="/animations/marketing-campaign-dark.json"
              fallbackSvgLight={
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 430 430">
                  <g strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="#c44e35" strokeWidth="12" d="M45.974 313.511c-6.815-11.805-2.77-26.899 9.034-33.715l37.405-21.595 37.021 64.122-37.405 21.596c-11.804 6.815-26.899 2.77-33.714-9.034zm127.418-87.814 10.687-6.17c11.804-6.816 26.899-2.771 33.714 9.033 6.815 11.805 2.771 26.899-9.034 33.715l-10.687 6.17"/>
                    <path stroke="#c44e35" strokeWidth="12" d="m92.029 343.918 39.279 55.694 8.656-4.998c12.569-7.256 16.193-23.738 7.829-35.598l-23.703-33.608m-31.677-67.207 59.383-69.909 67.872 117.557-90.234 16.474"/>
                    <path stroke="#121331" strokeMiterlimit="10" strokeWidth="12" d="M300 195c33.137 0 60-26.863 60-60s-26.863-60-60-60-60 26.863-60 60 26.863 60 60 60"/>
                    <path stroke="#c44e35" strokeMiterlimit="10" strokeWidth="12" d="m286 109 40 25.065L286 159z"/>
                    <path stroke="#121331" strokeMiterlimit="10" strokeWidth="12" d="M169.88 155H90.12C81.804 155 75 148.196 75 139.88V60.12C75 51.804 81.804 45 90.12 45h79.76c8.316 0 15.12 6.804 15.12 15.12v79.76c0 8.316-6.804 15.12-15.12 15.12"/>
                    <path stroke="#c44e35" strokeMiterlimit="10" strokeWidth="12" d="M155 85h-50m25 30h-25m275 207.811L350.169 286l-31.159 38.25L300.169 301 270 338.035"/>
                    <path stroke="#121331" strokeMiterlimit="10" strokeWidth="12" d="M364.88 360h-79.76c-8.316 0-15.12-6.804-15.12-15.12v-79.76c0-8.316 6.804-15.12 15.12-15.12h79.76c8.316 0 15.12 6.804 15.12 15.12v79.76c0 8.316-6.804 15.12-15.12 15.12"/>
                    <path stroke="#c44e35" strokeMiterlimit="10" strokeWidth="15" d="M317.492 277.5h.008"/>
                  </g>
                </svg>
              }
              fallbackSvgDark={
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 430 430">
                  <g strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="#c44e35" strokeWidth="12" d="M45.974 313.511c-6.815-11.805-2.77-26.899 9.034-33.715l37.405-21.595 37.021 64.122-37.405 21.596c-11.804 6.815-26.899 2.77-33.714-9.034zm127.418-87.814 10.687-6.17c11.804-6.816 26.899-2.771 33.714 9.033 6.815 11.805 2.771 26.899-9.034 33.715l-10.687 6.17"/>
                    <path stroke="#c44e35" strokeWidth="12" d="m92.029 343.918 39.279 55.694 8.656-4.998c12.569-7.256 16.193-23.738 7.829-35.598l-23.703-33.608m-31.677-67.207 59.383-69.909 67.872 117.557-90.234 16.474"/>
                    <path stroke="#fff" strokeMiterlimit="10" strokeWidth="12" d="M300 195c33.137 0 60-26.863 60-60s-26.863-60-60-60-60 26.863-60 60 26.863 60 60 60"/>
                    <path stroke="#c44e35" strokeMiterlimit="10" strokeWidth="12" d="m286 109 40 25.065L286 159z"/>
                    <path stroke="#fff" strokeMiterlimit="10" strokeWidth="12" d="M169.88 155H90.12C81.804 155 75 148.196 75 139.88V60.12C75 51.804 81.804 45 90.12 45h79.76c8.316 0 15.12 6.804 15.12 15.12v79.76c0 8.316-6.804 15.12-15.12 15.12"/>
                    <path stroke="#c44e35" strokeMiterlimit="10" strokeWidth="12" d="M155 85h-50m25 30h-25m275 207.811L350.169 286l-31.159 38.25L300.169 301 270 338.035"/>
                    <path stroke="#fff" strokeMiterlimit="10" strokeWidth="12" d="M364.88 360h-79.76c-8.316 0-15.12-6.804-15.12-15.12v-79.76c0-8.316 6.804-15.12 15.12-15.12h79.76c8.316 0 15.12 6.804 15.12 15.12v79.76c0 8.316-6.804 15.12-15.12 15.12"/>
                    <path stroke="#c44e35" strokeMiterlimit="10" strokeWidth="15" d="M317.492 277.5h.008"/>
                  </g>
                </svg>
              }
              className="w-full h-full"
              isHovered={isHovered}
            />
          </div>

          {/* Tekst i przycisk */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-foreground">Czas zacząć!</h3>
            <p className="text-lg md:text-xl mb-8 md:mb-10 text-muted-foreground max-w-2xl mx-auto md:mx-0">
              Dołącz do tysięcy użytkowników, którzy znajdują i oferują lokalne usługi
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-lg px-10 py-6 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 transition-all">
                Utwórz darmowe konto
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
