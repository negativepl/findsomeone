import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This function should be called by a cron job to notify users about expiring posts
// It checks for posts expiring in 7, 3, and 1 days
Deno.serve(async (req) => {
  try {
    // Verify the request is authorized
    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const notificationResults = {
      day7: 0,
      day3: 0,
      day1: 0,
      errors: []
    }

    // Check for posts expiring in 7 days
    const { data: posts7Days } = await supabase.rpc('get_posts_expiring_soon', {
      days_before: 7
    })

    if (posts7Days && posts7Days.length > 0) {
      for (const post of posts7Days) {
        const daysUntilExpiry = Math.ceil(
          (new Date(post.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )

        // Only notify if it's approximately 7, 3, or 1 day away
        if (daysUntilExpiry === 7 || daysUntilExpiry === 3 || daysUntilExpiry === 1) {
          try {
            // Here you would send an email or push notification
            // For now, we'll just log it and update the notification timestamp
            console.log(`Notifying user ${post.user_email} about post "${post.title}" expiring in ${daysUntilExpiry} days`)

            // TODO: Send actual notification via email service (Resend, SendGrid, etc.)
            // Example:
            // await sendEmail({
            //   to: post.user_email,
            //   subject: `Twoje ogłoszenie wygasa za ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'dzień' : 'dni'}`,
            //   body: `Cześć ${post.user_full_name},\n\nTwoje ogłoszenie "${post.title}" wygaśnie za ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'dzień' : 'dni'}.\n\nMożesz je przedłużyć klikając tutaj: ${supabaseUrl}/dashboard/my-posts`
            // })

            // Update notification timestamp
            await supabase
              .from('posts')
              .update({ expiration_notified_at: new Date().toISOString() })
              .eq('id', post.id)

            if (daysUntilExpiry === 7) notificationResults.day7++
            else if (daysUntilExpiry === 3) notificationResults.day3++
            else if (daysUntilExpiry === 1) notificationResults.day1++
          } catch (error) {
            console.error(`Error notifying user for post ${post.id}:`, error)
            notificationResults.errors.push({
              postId: post.id,
              error: error.message
            })
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notifications sent successfully',
        results: notificationResults,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in notify-expiring-posts function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
