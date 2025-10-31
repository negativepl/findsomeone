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

async function checkPosts() {
  try {
    // Check total posts count
    const { data: posts, error, count } = await supabase
      .from('posts')
      .select('id, title, city, status', { count: 'exact' })
      .eq('status', 'active')
      .limit(10)

    if (error) {
      console.error('Error:', error)
      return
    }

    console.log('=== Active Posts in Database ===\n')
    console.log(`Total active posts: ${count}`)
    console.log('\nFirst 10 posts:')
    console.log(JSON.stringify(posts, null, 2))

  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

checkPosts()
