'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LottieIcon } from '@/components/LottieIcon'

export function CTASection() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="container mx-auto px-6 py-12 md:py-14">
      <div
        className="bg-[#1A1A1A] rounded-[3rem] p-12 md:p-16 text-white relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Dekoracyjny gradient w tle */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4A261]/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Animowana ikona */}
          <div className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0 md:rotate-12">
            <LottieIcon
              animationPath="/animations/demand-white.json"
              className="w-full h-full"
              isHovered={isHovered}
            />
          </div>

          {/* Tekst i przycisk */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6">Czas zacząć!</h3>
            <p className="text-lg md:text-xl mb-8 md:mb-10 text-white/70 max-w-2xl mx-auto md:mx-0">
              Dołącz do tysięcy użytkowników, którzy znajdują i oferują lokalne usługi
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-lg px-10 py-6 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 transition-all">
                Utwórz darmowe konto
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
