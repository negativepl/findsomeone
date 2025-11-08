'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { updateVibrationPreference } from './actions'
import { toast } from 'sonner'

interface PreferencesSettingsProps {
  vibrationEnabled?: boolean
}

// Detect if device is iOS
function isIOS(): boolean {
  if (typeof window === 'undefined') return false

  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}

// Detect if device is mobile (Android or iOS)
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false

  const userAgent = window.navigator.userAgent.toLowerCase()
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
}

// Check if vibration API is supported
function isVibrationSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'vibrate' in navigator
}

export function PreferencesSettings({
  vibrationEnabled: initialVibration = false
}: PreferencesSettingsProps) {
  const [vibrationEnabled, setVibrationEnabled] = useState(initialVibration)
  const [loading, setLoading] = useState(false)
  const [isiOS, setIsIOS] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [vibrationSupported, setVibrationSupported] = useState(false)

  useEffect(() => {
    setIsIOS(isIOS())
    setIsMobile(isMobileDevice())
    setVibrationSupported(isVibrationSupported())
  }, [])

  async function handleVibrationChange(checked: boolean) {
    setVibrationEnabled(checked)
    setLoading(true)

    const formData = new FormData()
    formData.append('vibrationEnabled', String(checked))

    const result = await updateVibrationPreference(formData)
    setLoading(false)

    if (result.success) {
      toast.success('Ustawienia zapisane')
      // Test vibration if enabled (only on mobile, non-iOS devices)
      if (checked && vibrationSupported && !isiOS && isMobile) {
        navigator.vibrate(200)
      }
    } else {
      setVibrationEnabled(!checked) // revert on error
      toast.error(result.error)
    }
  }

  // Determine if vibration should be disabled
  const isDisabled = loading || isiOS || !vibrationSupported || !isMobile

  // Get status message
  const getStatusMessage = () => {
    if (!isMobile) return 'Dostępne tylko na urządzeniach mobilnych'
    if (isiOS) return 'Nieobsługiwane na iOS'
    if (!vibrationSupported) return 'Nieobsługiwane przez tę przeglądarkę'
    return 'Wibracje przy interakcjach'
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className={`flex items-center justify-between p-5 rounded-2xl ${isDisabled ? 'bg-muted/50 opacity-50' : 'bg-background'}`}>
        <div className="flex-1 pr-4">
          <p className={`text-base font-semibold mb-1 ${isDisabled ? 'text-muted-foreground' : 'text-foreground'}`}>
            Wibracje
          </p>
          <p className={`text-sm ${isDisabled ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
            {getStatusMessage()}
          </p>
        </div>
        <Switch
          checked={vibrationEnabled}
          onCheckedChange={handleVibrationChange}
          disabled={isDisabled}
        />
      </div>
    </div>
  )
}
