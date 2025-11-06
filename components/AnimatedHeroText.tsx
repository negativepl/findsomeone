'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

const PHRASES = [
  'wymarzony samochód',
  'upatrzony telefon',
  'pracę, w której się spełnisz',
  'mieszkanie swoich marzeń',
  'korepetycje dla dziecka',
  'sprawdzonego fachowca',
  'grafika do projektu',
  'sprzęt fotograficzny',
  'rower na wycieczkę',
  'usługi remontowe'
]

export function AnimatedHeroText() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [lineKey, setLineKey] = useState(0)

  // Rotate text and trigger line bounce with synchronized animation
  useEffect(() => {
    const interval = setInterval(async () => {
      // Start exit animation - text moves up
      setIsExiting(true)

      // Wait for text to move up and hit the line (650ms)
      await new Promise(resolve => setTimeout(resolve, 650))

      // Trigger line bounce
      setLineKey(prev => prev + 1)

      // After bounce starts, show new text from top
      await new Promise(resolve => setTimeout(resolve, 100))
      setIsExiting(false)
      setCurrentIndex((prev) => (prev + 1) % PHRASES.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full">
      <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 text-center">
        Łączymy ludzi <span className="text-brand">lokalnie</span>
      </h1>

      <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center">
        FindSomeone to więcej niż tablica ogłoszeń. To miejsce, gdzie design spotyka się z funkcjonalnością,
        a lokalne społeczności zyskują nowe możliwości.
      </p>
    </div>
  )
}
