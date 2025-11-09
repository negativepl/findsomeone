import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

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

    // Configure web-push with VAPID keys
    webpush.setVapidDetails(
      'mailto:noreply@findsomeone.pl',
      vapidPublicKey,
      vapidPrivateKey
    )

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
    console.log('Sending push to', subscriptions.length, 'subscriptions')
    console.log('Payload:', payload)

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        console.log('Attempting to send to endpoint:', sub.endpoint.substring(0, 50) + '...')
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: sub.keys
          }

          // Log subscription keys for debugging
          console.log('Subscription keys:', sub.keys ? 'present' : 'missing')

          const result = await webpush.sendNotification(pushSubscription, payload)
          console.log('Successfully sent to:', sub.endpoint.substring(0, 50) + '...')
          return result
        } catch (error) {
          console.error('Failed to send to:', sub.endpoint.substring(0, 50) + '...', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          throw error
        }
      })
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
