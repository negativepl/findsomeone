'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'

interface HeroSectionProps {
  user: User | null
}

export function HeroSection({ user }: HeroSectionProps) {
  const headingText = "Znajdź pomoc w okolicy"

  return (
    <section className="relative overflow-hidden">
      {/* Gradient overlay - only in hero section */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 120% 60% at 50% 0%, rgba(196, 78, 53, 0.15) 0%, rgba(196, 78, 53, 0.08) 30%, transparent 70%)',
        }}
      />
      
      <div className="container relative mx-auto px-6 py-16 sm:py-18 md:py-24 lg:px-16 xl:px-20">
        <div className="relative z-10 pt-16 lg:min-h-[300px] flex flex-col items-center justify-center sm:mx-auto md:w-3/4 lg:mx-0 lg:w-full gap-4 lg:gap-8">
        <h1 className="text-4xl md:text-7xl font-bold text-foreground leading-tight text-center">
          {headingText.split(" ").map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
              className="inline-block mr-2"
            >
              {word === "okolicy" ? (
                <span className="relative inline-block">
                  {word}
                  <svg
                    className="absolute left-0 -bottom-2 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6C50 4 100 2 150 5C200 8 250 4 298 6"
                      stroke="#C44E35"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M2 9C50 7 100 5 150 8C200 11 250 7 298 9"
                      stroke="#C44E35"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  </svg>
                </span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </h1>

        <div className="max-w-2xl text-center space-y-4">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="text-base md:text-xl text-muted-foreground leading-relaxed"
          >
            Sprzedaż, kupno, wynajem. Poszukiwanie fachowców i oferowanie usług.
            Lokalne ogłoszenia drobne i wsparcie sąsiedzkie. Wszystko w jednym miejscu, w Twojej okolicy.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="text-2xl md:text-3xl text-[#C44E35] font-[family-name:var(--font-dancing-script)]"
          >
            FindSomeone łączy ludzi i ogłoszenia w Twoim mieście.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="flex flex-row gap-2 md:gap-6 justify-center items-center w-full md:w-auto px-4 md:px-0"
        >
          <Link href="/posts" className="flex-1 md:flex-none md:w-auto">
            <Button
              variant="outline"
              className="w-full md:w-auto text-sm md:text-lg px-4 md:px-12 py-3 md:py-8 rounded-full border-2 border-border hover:border-[#C44E35] hover:bg-[#C44E35]/10 transition-all h-[44px] md:h-[56px] md:min-w-[200px] bg-card text-foreground"
            >
              Przeglądaj ogłoszenia
            </Button>
          </Link>
          <Link href={user ? "/dashboard/my-posts/new" : "/signup"} className="flex-1 md:flex-none md:w-auto">
            <Button
              className="w-full md:w-auto text-sm md:text-lg px-4 md:px-12 py-3 md:py-8 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 transition-all h-[44px] md:h-[56px] md:min-w-[200px]"
            >
              Dodaj ogłoszenie
            </Button>
          </Link>
        </motion.div>
        </div>
      </div>
    </section>
  )
}
