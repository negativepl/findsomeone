const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    env[match[1].trim()] = match[2].trim()
  }
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function disablePostNotifications() {
  try {
    console.log('\n🚀 Disabling post_created notifications...\n')

    // Method 1: Delete existing post_created activity logs
    const { error: deleteError } = await supabase
      .from('activity_logs')
      .delete()
      .eq('activity_type', 'post_created')

    if (deleteError) {
      console.error('❌ Failed to delete post_created activities:', deleteError)
    } else {
      console.log('✅ Deleted all post_created activity logs')
    }

    console.log('\n⚠️  Note: The trigger and function need to be removed via SQL editor in Supabase Dashboard:')
    console.log('   DROP TRIGGER IF EXISTS on_post_created ON posts;')
    console.log('   DROP FUNCTION IF EXISTS log_post_created();')
    console.log('\nOr run the migration file manually in the SQL editor.')

  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

disablePostNotifications()
