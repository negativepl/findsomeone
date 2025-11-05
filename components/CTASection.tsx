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
              animationPathLight="/animations/cta-light.json"
              animationPathDark="/animations/cta-dark.json"
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
