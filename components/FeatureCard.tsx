'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'
import { X } from 'lucide-react'

// Lazy load framer-motion komponentów
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: true })
const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), { ssr: true })

interface FeatureCardProps {
  title: string
  description: string
  expandedContent?: string
}

export function FeatureCard({
  title,
  description,
  expandedContent
}: FeatureCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  return (
    <>
      <MotionDiv
        {...(!isMobile && { layoutId: `feature-${title}` })}
        onClick={() => setIsOpen(true)}
        className="cursor-pointer h-full"
      >
        <Card className="border border-border rounded-2xl bg-card hover:border-brand/40 transition-colors h-full">
          <CardContent className="p-6 h-full flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-3">
              {title}
            </h3>
            <p className="text-muted-foreground leading-relaxed text-[15px] flex-1">
              {description}
            </p>
          </CardContent>
        </Card>
      </MotionDiv>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Expanded Card */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <MotionDiv
                {...(!isMobile && { layoutId: `feature-${title}` })}
                initial={isMobile ? { opacity: 0, scale: 0.95 } : undefined}
                animate={isMobile ? { opacity: 1, scale: 1 } : undefined}
                exit={isMobile ? { opacity: 0, scale: 0.95 } : undefined}
                className="pointer-events-auto w-full max-w-lg"
              >
                <Card className="border border-border rounded-2xl bg-card shadow-2xl">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <h3 className="text-2xl font-bold text-foreground">
                        {title}
                      </h3>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-muted rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>

                    <p className="text-muted-foreground leading-relaxed text-base mb-4">
                      {description}
                    </p>

                    {expandedContent && (
                      <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="pt-4 border-t border-border"
                      >
                        <p className="text-foreground leading-relaxed">
                          {expandedContent}
                        </p>
                      </MotionDiv>
                    )}
                  </CardContent>
                </Card>
              </MotionDiv>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
