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
      <div className="container mx-auto px-6 py-3 md:pt-14 md:pb-2 text-center">
        <h2 className="text-4xl md:text-7xl font-bold mb-4 md:mb-6 text-black leading-tight">
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
        </h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="text-base md:text-xl text-black/60 mb-6 md:mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Sprzedajesz, kupujesz, wynajmujesz? Szukasz fachowca lub oferujesz usługi?
          A może potrzebujesz pomocy albo sam chcesz pomóc?{' '}
          <span className="font-semibold bg-gradient-to-r from-[#1A1A1A] to-[#C44E35] bg-clip-text text-transparent">
            FindSomeone łączy ludzi i ogłoszenia w okolicy.
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="flex flex-row gap-2 md:gap-6 justify-center items-center w-full md:w-auto px-4 md:px-0"
        >
          <Link href="/posts" className="flex-1 md:flex-none md:w-auto">
            <Button
              variant="outline"
              className="w-full md:w-auto text-sm md:text-lg px-4 md:px-12 py-3 md:py-8 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 transition-all h-[44px] md:h-[56px] md:min-w-[200px] transform hover:-translate-y-0.5"
            >
              Przeglądaj ogłoszenia
            </Button>
          </Link>
          <Link href={user ? "/dashboard/my-posts/new" : "/signup"} className="flex-1 md:flex-none md:w-auto">
            <Button
              className="w-full md:w-auto text-sm md:text-lg px-4 md:px-12 py-3 md:py-8 rounded-full bg-black hover:bg-black/80 text-white border-0 transition-all h-[44px] md:h-[56px] md:min-w-[200px] transform hover:-translate-y-0.5"
            >
              Dodaj ogłoszenie
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
