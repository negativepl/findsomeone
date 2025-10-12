import { NextRequest, NextResponse } from 'next/server'

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

// Geocode city to coordinates using Nominatim (OpenStreetMap)
async function geocodeCity(city: string, district: string | null): Promise<{ lat: number; lon: number } | null> {
  try {
    const query = district ? `${district}, ${city}, Poland` : `${city}, Poland`
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'FindSomeone-App/1.0',
        },
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      }
    }

    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userLat, userLon, postCity, postDistrict } = await request.json()

    if (!userLat || !userLon || !postCity) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get coordinates for the post location
    const postCoords = await geocodeCity(postCity, postDistrict)

    if (!postCoords) {
      return NextResponse.json(
        { error: 'Could not geocode city' },
        { status: 400 }
      )
    }

    // Calculate distance
    const distance = calculateDistance(
      userLat,
      userLon,
      postCoords.lat,
      postCoords.lon
    )

    return NextResponse.json({ distance: Math.round(distance * 10) / 10 })
  } catch (error) {
    console.error('Distance calculation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
