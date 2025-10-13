'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'

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

  const maskedPhone = () => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length >= 6) {
      return `${cleaned.slice(0, 3)} ••• •••`
    }
    return '••• ••• •••'
  }

  return (
    <div>
      {!isRevealed ? (
        <Button
          onClick={handleReveal}
          variant="outline"
          disabled={disabled}
          className={`w-full rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 py-6 text-base ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Phone className="w-4 h-4 mr-2" />
          {maskedPhone()}
        </Button>
      ) : (
        disabled ? (
          <Button
            variant="outline"
            disabled
            className="w-full rounded-full border-2 border-green-500 bg-green-50 text-green-700 py-6 text-base opacity-50 cursor-not-allowed"
          >
            <Phone className="w-4 h-4 mr-2" />
            {formatPhone(phone)}
          </Button>
        ) : (
          <a href={`tel:${phone}`}>
            <Button
              variant="outline"
              className="w-full rounded-full border-2 border-green-500 bg-green-50 hover:bg-green-100 text-green-700 py-6 text-base"
            >
              <Phone className="w-4 h-4 mr-2" />
              {formatPhone(phone)}
            </Button>
          </a>
        )
      )}
    </div>
  )
}
