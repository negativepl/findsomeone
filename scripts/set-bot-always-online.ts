import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const BOT_USER_ID = '00000000-0000-0000-0000-000000000002'

async function setBotAlwaysOnline() {
  console.log('Setting bot to always appear online...')

  try {
    // Set last_seen to a date far in the future (year 2099)
    // This way the bot will always appear online without needing cron jobs
    const { error } = await supabase
      .from('user_presence')
      .upsert({
        user_id: BOT_USER_ID,
        status: 'online',
        last_seen: '2099-12-31T23:59:59.999Z' // Far future date
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Error:', error)
      throw error
    }

    console.log('✅ Bot will now always appear as online!')
    console.log('   The last_seen date is set to 2099, so it will remain online for ~75 years.')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

setBotAlwaysOnline()
