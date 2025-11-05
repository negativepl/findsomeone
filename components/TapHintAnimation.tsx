'use client'

import { useEffect, useState, useRef } from 'react'
import Lottie from 'lottie-react'
import { useTheme } from '@/contexts/ThemeContext'

export function TapHintAnimation() {
  const [animationData, setAnimationData] = useState<any>(null)
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
  const [isPaused, setIsPaused] = useState(false)
  const lottieRef = useRef<any>(null)
  const { theme } = useTheme()

  // Detect theme
  useEffect(() => {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setCurrentTheme(isDark ? 'dark' : 'light')
  }, [theme])

  // Load animation based on theme
  useEffect(() => {
    const animationPath = currentTheme === 'dark'
      ? '/lottie/tap-dark.json'
      : '/lottie/tap-light.json'

    fetch(animationPath)
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error))
  }, [currentTheme])

  // Handle animation complete - add 2 second pause between loops
  const handleComplete = () => {
    if (lottieRef.current) {
      setIsPaused(true)
      lottieRef.current.pause()

      setTimeout(() => {
        if (lottieRef.current) {
          lottieRef.current.goToAndPlay(0)
          setIsPaused(false)
        }
      }, 4000) // 4 second pause
    }
  }

  if (!animationData) {
    return <div className="w-12 h-12" />
  }

  return (
    <div className="-rotate-12">
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={true}
        onComplete={handleComplete}
        className="w-12 h-12"
      />
    </div>
  )
}
