import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    // Verify the request is authorized (you can use a secret token)
    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Call the expire_old_posts function
    const { error: expireError } = await supabase.rpc('expire_old_posts')

    if (expireError) {
      console.error('Error expiring posts:', expireError)
      return new Response(
        JSON.stringify({ error: 'Failed to expire posts', details: expireError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get count of expired posts for logging
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'closed')
      .gte('updated_at', new Date(Date.now() - 60000).toISOString()) // Last minute

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Posts expired successfully',
        expiredCount: count || 0,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in expire-posts function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
