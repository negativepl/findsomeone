'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface BackgroundGradientAnimationProps {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  gradientBackgroundStart?: string
  gradientBackgroundEnd?: string
  firstColor?: string
  secondColor?: string
  thirdColor?: string
  fourthColor?: string
  fifthColor?: string
  pointerColor?: string
  size?: string
  blendingValue?: string
  interactive?: boolean
}

export function BackgroundGradientAnimation({
  children,
  className,
  containerClassName,
  gradientBackgroundStart = 'rgb(250, 248, 243)',
  gradientBackgroundEnd = 'rgb(245, 241, 232)',
  firstColor = '196, 78, 53',
  secondColor = '249, 115, 22',
  thirdColor = '251, 146, 60',
  fourthColor = '253, 186, 116',
  fifthColor = '254, 215, 170',
  pointerColor = '196, 78, 53',
  size = '50%',
  blendingValue = 'hard-light',
  interactive = true,
}: BackgroundGradientAnimationProps) {
  const interactiveRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!interactive) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactiveRef.current) return
      const rect = interactiveRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      interactiveRef.current.style.setProperty('--mouse-x', `${x}px`)
      interactiveRef.current.style.setProperty('--mouse-y', `${y}px`)
    }

    const element = interactiveRef.current
    if (element) {
      element.addEventListener('mousemove', handleMouseMove)
      return () => element.removeEventListener('mousemove', handleMouseMove)
    }
  }, [interactive])

  return (
    <div
      ref={interactiveRef}
      className={cn(
        'relative w-full h-full overflow-hidden',
        containerClassName
      )}
      style={{
        background: `linear-gradient(40deg, ${gradientBackgroundStart}, ${gradientBackgroundEnd})`,
      }}
    >
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div className={cn('absolute inset-0', className)}>
        <div
          className="gradients-container h-full w-full blur-lg"
          style={{
            filter: 'url(#blurMe) blur(40px)',
            width: '100%',
            height: '100%',
          }}
        >
          <div
            className="g1 absolute"
            style={{
              background: `radial-gradient(circle at center, rgba(${firstColor}, 0.5) 0, rgba(${firstColor}, 0) 50%) no-repeat`,
              mixBlendMode: blendingValue as any,
              width: size,
              height: size,
              top: 'calc(20% - ' + size + ' / 2)',
              left: 'calc(10% - ' + size + ' / 2)',
              animation: 'moveVertical 30s ease infinite',
            }}
          />
          <div
            className="g2 absolute"
            style={{
              background: `radial-gradient(circle at center, rgba(${secondColor}, 0.5) 0, rgba(${secondColor}, 0) 50%) no-repeat`,
              mixBlendMode: blendingValue as any,
              width: size,
              height: size,
              top: 'calc(60% - ' + size + ' / 2)',
              left: 'calc(80% - ' + size + ' / 2)',
              animation: 'moveInCircle 20s reverse infinite',
            }}
          />
          <div
            className="g3 absolute"
            style={{
              background: `radial-gradient(circle at center, rgba(${thirdColor}, 0.5) 0, rgba(${thirdColor}, 0) 50%) no-repeat`,
              mixBlendMode: blendingValue as any,
              width: size,
              height: size,
              top: 'calc(70% - ' + size + ' / 2)',
              left: 'calc(20% - ' + size + ' / 2)',
              animation: 'moveInCircle 40s linear infinite',
            }}
          />
          <div
            className="g4 absolute"
            style={{
              background: `radial-gradient(circle at center, rgba(${fourthColor}, 0.5) 0, rgba(${fourthColor}, 0) 50%) no-repeat`,
              mixBlendMode: blendingValue as any,
              width: size,
              height: size,
              top: 'calc(30% - ' + size + ' / 2)',
              left: 'calc(60% - ' + size + ' / 2)',
              animation: 'moveHorizontal 40s ease infinite',
              opacity: 0.7,
            }}
          />
          <div
            className="g5 absolute"
            style={{
              background: `radial-gradient(circle at center, rgba(${fifthColor}, 0.5) 0, rgba(${fifthColor}, 0) 50%) no-repeat`,
              mixBlendMode: blendingValue as any,
              width: size,
              height: size,
              top: 'calc(40% - ' + size + ' / 2)',
              left: 'calc(90% - ' + size + ' / 2)',
              animation: 'moveInCircle 20s ease infinite',
            }}
          />
          {interactive && (
            <div
              className="interactive absolute"
              style={{
                background: `radial-gradient(circle at center, rgba(${pointerColor}, 0.4) 0, rgba(${pointerColor}, 0) 50%) no-repeat`,
                mixBlendMode: blendingValue as any,
                width: '100%',
                height: '100%',
                top: 'calc(var(--mouse-y, 50%) - 50%)',
                left: 'calc(var(--mouse-x, 50%) - 50%)',
                opacity: 0.5,
              }}
            />
          )}
        </div>
      </div>
      {children && <div className={cn("relative z-10 w-full h-full", className)}>{children}</div>}
      <style jsx>{`
        @keyframes moveInCircle {
          0% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(180deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes moveVertical {
          0% {
            transform: translateY(-50%);
          }
          50% {
            transform: translateY(50%);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        @keyframes moveHorizontal {
          0% {
            transform: translateX(-50%) translateY(-10%);
          }
          50% {
            transform: translateX(50%) translateY(10%);
          }
          100% {
            transform: translateX(-50%) translateY(-10%);
          }
        }
      `}</style>
    </div>
  )
}
