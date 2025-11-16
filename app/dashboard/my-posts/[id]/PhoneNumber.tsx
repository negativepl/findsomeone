'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PhoneNumberProps {
  phone: string
}

export function PhoneNumber({ phone }: PhoneNumberProps) {
  const [isRevealed, setIsRevealed] = useState(false)

  const formatPhone = (phoneNumber: string) => {
    // Format phone number to be more readable
    const cleaned = phoneNumber.replace(/\D/g, '')
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    }
    return phoneNumber
  }

  const renderPhoneNumber = () => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length !== 9) return phone

    const part1 = cleaned.slice(0, 3) // Always visible
    const part2 = cleaned.slice(3, 6) // Hidden with •••
    const part3 = cleaned.slice(6, 9) // Hidden with •••

    return (
      <span className="inline-flex items-center">
        {/* First 3 digits - always visible, no animation */}
        <span className="inline-block">{part1}</span>
        <span className="inline-block" style={{ width: '0.4em' }}> </span>

        {/* Second 3 digits - animate from ••• to digits with fixed width */}
        <span className="inline-block relative" style={{ width: '3ch' }}>
          {isRevealed ? (
            <span className="inline-flex">
              {part2.split('').map((char, index) => (
                <motion.span
                  key={`part2-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ) : (
            <span>•••</span>
          )}
        </span>
        <span className="inline-block" style={{ width: '0.4em' }}> </span>

        {/* Third 3 digits - animate from ••• to digits with fixed width */}
        <span className="inline-block relative" style={{ width: '3ch' }}>
          {isRevealed ? (
            <span className="inline-flex">
              {part3.split('').map((char, index) => (
                <motion.span
                  key={`part3-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.2,
                    delay: 0.15 + (index * 0.05),
                    ease: "easeOut"
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ) : (
            <span>•••</span>
          )}
        </span>
      </span>
    )
  }

  return (
    <>
      {isRevealed ? (
        <a href={`tel:${phone}`}>
          <Button
            variant="outline"
            className="w-full rounded-full border border-border bg-muted hover:bg-accent py-6 text-base"
          >
            <Phone className="w-4 h-4 mr-2" />
            {renderPhoneNumber()}
          </Button>
        </a>
      ) : (
        <Button
          onClick={() => setIsRevealed(true)}
          variant="outline"
          className="w-full rounded-full border border-border hover:bg-accent py-6 text-base"
        >
          <Phone className="w-4 h-4 mr-2" />
          {renderPhoneNumber()}
        </Button>
      )}
    </>
  )
}
