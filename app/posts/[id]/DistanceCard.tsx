'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface DistanceCardProps {
  postCity: string
  postDistrict: string | null
}

export function DistanceCard({ postCity, postDistrict }: DistanceCardProps) {
  const [distance, setDistance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const calculateDistance = async () => {
      try {
        // Get user's current location
        if (!navigator.geolocation) {
          setError(true)
          setLoading(false)
          return
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const userLat = position.coords.latitude
            const userLon = position.coords.longitude

            // Call API to calculate distance
            const response = await fetch('/api/distance', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userLat,
                userLon,
                postCity,
                postDistrict,
              }),
            })

            if (response.ok) {
              const data = await response.json()
              setDistance(data.distance)
            } else {
              setError(true)
            }
            setLoading(false)
          },
          () => {
            setError(true)
            setLoading(false)
          }
        )
      } catch (err) {
        setError(true)
        setLoading(false)
      }
    }

    calculateDistance()
  }, [postCity, postDistrict])

  if (loading) {
    return (
      <Card className="border border-border rounded-3xl bg-card shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#C44E35] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Obliczam odległość...</p>
              <p className="text-sm text-muted-foreground">Sprawdzam lokalizację</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || distance === null) {
    return null // Don't show card if there's an error or no permission
  }

  return (
    <Card className="border border-border rounded-3xl bg-card shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Odległość od Ciebie</p>
            <p className="text-sm text-muted-foreground">
              {distance < 1
                ? 'Mniej niż 1 km'
                : distance < 5
                ? `${distance.toFixed(1)} km`
                : `${Math.round(distance)} km`
              } • {postCity}{postDistrict ? `, ${postDistrict}` : ''}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
