'use client'

import { useEffect, useRef, useState } from 'react'
import Lottie from 'lottie-react'
import Image from 'next/image'

interface StepLottieIconProps {
  step: number
  animationPath: string
  svgPath: string
  className?: string
}

export function StepLottieIcon({ step, animationPath, svgPath, className = 'w-8 h-8' }: StepLottieIconProps) {
  const lottieRef = useRef<any>(null)
  const [animationData, setAnimationData] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showLottie, setShowLottie] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()
  const initialDelayRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Load animation on mount
    fetch(animationPath)
      .then(response => response.json())
      .then(data => {
        setAnimationData(data)
        setIsLoaded(true)
        // Wait a bit before showing Lottie to avoid flash
        setTimeout(() => {
          setShowLottie(true)
        }, 100)
      })
      .catch(error => {
        console.error(`Error loading animation for step ${step}:`, error)
      })

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (initialDelayRef.current) {
        clearTimeout(initialDelayRef.current)
      }
    }
  }, [animationPath, step])

  useEffect(() => {
    if (lottieRef.current && animationData && isLoaded && showLottie) {
      // Play animation with pauses
      const playWithPause = () => {
        if (lottieRef.current) {
          lottieRef.current.goToAndPlay(0, true)
        }
      }

      // Initial play with delay (wait 800ms before first animation)
      initialDelayRef.current = setTimeout(playWithPause, 800)

      // Repeat with pause every 5 seconds
      intervalRef.current = setInterval(playWithPause, 5000)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        if (initialDelayRef.current) {
          clearTimeout(initialDelayRef.current)
        }
      }
    }
  }, [animationData, isLoaded, showLottie])

  return (
    <div className={`${className} relative`}>
      {/* SVG - always visible until Lottie is ready */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          showLottie ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <Image
          src={svgPath}
          alt={`Step ${step} icon`}
          width={32}
          height={32}
          className="w-full h-full"
        />
      </div>

      {/* Lottie - fades in when ready */}
      {isLoaded && animationData && (
        <div
          className={`transition-opacity duration-300 ${
            showLottie ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={false}
            autoplay={false}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}
    </div>
  )
}
