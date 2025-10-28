'use client'

import { useEffect, useState } from 'react'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

interface CookiePreferences {
  required: boolean
  analytics: boolean
  advertising: boolean
  personalization: boolean
  security: boolean
}

export function ConditionalAnalytics() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Read preferences from localStorage
    const savedPreferences = localStorage.getItem('cookiePreferences')
    if (savedPreferences) {
      try {
        const prefs = JSON.parse(savedPreferences) as CookiePreferences
        setPreferences(prefs)
      } catch (e) {
        console.error('Failed to parse cookie preferences:', e)
      }
    }
    setLoaded(true)
  }, [])

  // Don't render anything until we've checked localStorage
  if (!loaded) {
    return null
  }

  // Don't load analytics if user hasn't accepted or explicitly rejected
  if (!preferences || !preferences.analytics) {
    return null
  }

  // Only load analytics if user explicitly accepted
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
