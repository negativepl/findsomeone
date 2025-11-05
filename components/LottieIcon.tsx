'use client'

import { useEffect, useRef, useState } from 'react'
import Lottie from 'lottie-react'
import { useTheme } from '@/contexts/ThemeContext'

interface LottieIconProps {
  animationPath?: string // Legacy support - for single animation
  animationPathLight?: string // Animation for light mode
  animationPathDark?: string // Animation for dark mode
  fallbackSvg?: React.ReactNode // Legacy support
  fallbackSvgLight?: React.ReactNode // SVG for light mode
  fallbackSvgDark?: React.ReactNode // SVG for dark mode
  className?: string
  isHovered?: boolean
}

export function LottieIcon({
  animationPath,
  animationPathLight,
  animationPathDark,
  fallbackSvg,
  fallbackSvgLight,
  fallbackSvgDark,
  className,
  isHovered = false
}: LottieIconProps) {
  const lottieRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [animationData, setAnimationData] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false)
  const prevHoveredRef = useRef(false)
  const { theme } = useTheme()

  // Mount detection
  useEffect(() => {
    setMounted(true)
    // Also set initial theme from DOM
    const isDark = document.documentElement.classList.contains('dark')
    setCurrentTheme(isDark ? 'dark' : 'light')
  }, [])

  // Detect theme changes for animation loading
  useEffect(() => {
    if (!mounted) return
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setCurrentTheme(isDark ? 'dark' : 'light')
  }, [theme, mounted])

  // Determine which animation path to use based on theme
  const currentAnimationPath = animationPathLight && animationPathDark
    ? (currentTheme === 'dark' ? animationPathDark : animationPathLight)
    : animationPath // Fallback to legacy single path

  const currentFallbackSvg = fallbackSvgLight && fallbackSvgDark
    ? (currentTheme === 'dark' ? fallbackSvgDark : fallbackSvgLight)
    : fallbackSvg // Fallback to legacy single SVG

  // Load animation immediately on mount
  useEffect(() => {
    if (mounted && currentAnimationPath && !animationData) {
      fetch(currentAnimationPath)
        .then(response => response.json())
        .then(data => {
          setAnimationData(data)
        })
        .catch(error => console.error('Error loading animation:', error))
    }
  }, [mounted, currentAnimationPath, animationData])

  // Reload animation when theme changes
  useEffect(() => {
    if (mounted && currentAnimationPath && animationData) {
      fetch(currentAnimationPath)
        .then(response => response.json())
        .then(data => {
          setAnimationData(data)
          if (lottieRef.current) {
            lottieRef.current.goToAndStop(0)
          }
          setIsPlaying(false)
        })
        .catch(error => console.error('Error loading animation:', error))
    }
  }, [theme, currentAnimationPath])

  // Intersection Observer - play when entering viewport
  useEffect(() => {
    if (!containerRef.current || !animationData || hasPlayedOnce) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && lottieRef.current && !isPlaying) {
            lottieRef.current.goToAndPlay(0)
            setIsPlaying(true)
            setHasPlayedOnce(true)
          }
        })
      },
      { threshold: 0.5 } // Trigger when 50% visible
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [animationData, isPlaying, hasPlayedOnce])

  useEffect(() => {
    // Only play when transitioning from not-hovered to hovered
    const justHovered = isHovered && !prevHoveredRef.current

    if (lottieRef.current && animationData && justHovered && !isPlaying) {
      // Reset to beginning and start animation
      lottieRef.current.goToAndPlay(0)
      setIsPlaying(true)
    }

    // Update previous hover state
    prevHoveredRef.current = isHovered
  }, [isHovered, animationData, isPlaying])

  // Handle animation complete
  const handleComplete = () => {
    setIsPlaying(false)
    // Reset animation to beginning when complete
    if (lottieRef.current) {
      lottieRef.current.goToAndStop(0)
    }
  }

  // Show SVG fallback if animation not loaded yet
  if (!animationData) {
    // If we have both light and dark versions, render both and let CSS control visibility
    if (fallbackSvgLight && fallbackSvgDark) {
      return (
        <div ref={containerRef} className={className}>
          <div className="dark:hidden">{fallbackSvgLight}</div>
          <div className="hidden dark:block">{fallbackSvgDark}</div>
        </div>
      )
    }
    // Single fallback (universal color) - show immediately, no need to wait for mounted
    return <div ref={containerRef} className={className}>{fallbackSvg || currentFallbackSvg}</div>
  }

  return (
    <div ref={containerRef} className={className}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
        onComplete={handleComplete}
      />
    </div>
  )
}
