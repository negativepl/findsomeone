'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'

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
          onClick={() => setIsRevealed(true)}
          variant="outline"
          className="w-full rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 py-6 text-base"
        >
          <Phone className="w-4 h-4 mr-2" />
          {maskedPhone()}
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
      )}
    </div>
  )
}
