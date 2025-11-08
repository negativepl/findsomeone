import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Helper function to convert VAPID keys
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Send Web Push notification
async function sendWebPush(
  subscription: any,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
) {
  const endpoint = subscription.endpoint
  const keys = subscription.keys

  // Import VAPID keys
  const vapidPrivateKeyUint8 = urlBase64ToUint8Array(vapidPrivateKey)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    vapidPrivateKeyUint8,
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign']
  )

  // Create JWT for authentication
  const jwtHeader = btoa(JSON.stringify({ typ: 'JWT', alg: 'ES256' }))
  const jwtPayload = btoa(JSON.stringify({
    aud: new URL(endpoint).origin,
    exp: Math.floor(Date.now() / 1000) + 43200, // 12 hours
    sub: 'mailto:noreply@findsomeone.pl'
  }))

  const unsignedToken = `${jwtHeader}.${jwtPayload}`
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  )

  const jwt = `${unsignedToken}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`

  // Send push notification
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
      'TTL': '86400'
    },
    body: payload
  })

  if (!response.ok) {
    throw new Error(`Push failed: ${response.status} ${response.statusText}`)
  }

  return response
}

Deno.serve(async (req) => {
  try {
    // Verify the request is authorized
    const authHeader = req.headers.get('Authorization')
    const expectedAuth = `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`

    if (authHeader !== expectedAuth) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { userId, title, body, url, notificationId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user's push subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No subscriptions found for user',
          sentCount: 0
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get VAPID keys from environment
    const vapidPublicKey = Deno.env.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY') ?? ''
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured')
      return new Response(
        JSON.stringify({ error: 'VAPID keys not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title: title || 'FindSomeone',
      body: body || 'Masz nowe powiadomienie',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      url: url || '/dashboard',
      notificationId: notificationId,
      tag: 'notification'
    })

    // Send push to all user's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(sub =>
        sendWebPush(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload,
          vapidPublicKey,
          vapidPrivateKey
        )
      )
    )

    // Count successes and failures
    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    // Remove failed subscriptions (they're probably invalid/expired)
    if (failed > 0) {
      const failedIndices = results
        .map((r, i) => r.status === 'rejected' ? i : -1)
        .filter(i => i !== -1)

      const failedEndpoints = failedIndices.map(i => subscriptions[i].endpoint)

      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', failedEndpoints)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Push notifications sent',
        sentCount: succeeded,
        failedCount: failed,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-push-notification function:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
