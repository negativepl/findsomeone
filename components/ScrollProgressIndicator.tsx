'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'

export function ScrollProgressIndicator() {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollYProgress } = useScroll()

  // Smooth spring animation for the progress
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // Transform scroll progress (0-1) to dot position (0-256px, since h-64 = 256px)
  const dotPosition = useTransform(scrollYProgress, [0, 1], [0, 256])

  // Show indicator only when scrolled past 100px and not near the bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const documentHeight = document.documentElement.scrollHeight
      const windowHeight = window.innerHeight
      const distanceFromBottom = documentHeight - (scrollTop + windowHeight)

      // Show only if scrolled past 100px AND more than 100px from bottom
      setIsVisible(scrollTop > 100 && distanceFromBottom > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden xl:block"
    >
      {/* Vertical line */}
      <div className="relative h-64 w-0.5 bg-border rounded-full overflow-hidden">
        {/* Progress line */}
        <motion.div
          className="absolute top-0 left-0 right-0 bg-brand origin-top"
          style={{ scaleY }}
        />
      </div>

      {/* Moving dot */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-brand rounded-full shadow-lg"
        style={{
          top: dotPosition,
          y: '-50%',
        }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-brand rounded-full animate-ping opacity-75" />
      </motion.div>
    </motion.div>
  )
}
