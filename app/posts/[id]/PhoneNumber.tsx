'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PhoneNumberProps {
  phone: string
  postId: string
  disabled?: boolean
}

export function PhoneNumber({ phone, postId, disabled = false }: PhoneNumberProps) {
  const [isRevealed, setIsRevealed] = useState(false)

  const handleReveal = async () => {
    if (disabled) return
    setIsRevealed(true)

    // Check if this phone number was already revealed in this session/browser
    const phoneClicksKey = 'phone_clicks'
    const phoneClicks = JSON.parse(localStorage.getItem(phoneClicksKey) || '{}')

    // Check if we already counted a click for this post
    // We store timestamp to allow counting again after 24 hours
    const lastClickTime = phoneClicks[postId]
    const now = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000

    if (lastClickTime && (now - lastClickTime) < twentyFourHours) {
      // Already clicked within last 24 hours, don't count again
      return
    }

    // Track phone click
    try {
      const response = await fetch(`/api/posts/${postId}/phone-click`, {
        method: 'POST',
      })

      if (response.ok) {
        // Store the click timestamp in localStorage
        phoneClicks[postId] = now
        localStorage.setItem(phoneClicksKey, JSON.stringify(phoneClicks))
      }
    } catch (error) {
      console.error('Error tracking phone click:', error)
    }
  }

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
      {disabled ? (
        <Button
          onClick={handleReveal}
          variant="outline"
          disabled={disabled}
          className="w-full rounded-full border border-border bg-muted py-6 text-base opacity-50 cursor-not-allowed"
        >
          <Phone className="w-4 h-4 mr-2" />
          {renderPhoneNumber()}
        </Button>
      ) : isRevealed ? (
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
          onClick={handleReveal}
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
