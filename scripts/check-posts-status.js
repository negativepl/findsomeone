// Check posts status distribution
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPosts() {
  console.log('Checking posts status distribution...\n')

  // Count posts by status
  const { data: allPosts } = await supabase
    .from('posts')
    .select('status, moderation_status, is_deleted')

  console.log('Total posts:', allPosts?.length || 0)
  console.log()

  const statusCount = {}
  const moderationCount = {}
  const deletedCount = { true: 0, false: 0 }

  allPosts?.forEach(post => {
    statusCount[post.status] = (statusCount[post.status] || 0) + 1
    moderationCount[post.moderation_status] = (moderationCount[post.moderation_status] || 0) + 1
    deletedCount[post.is_deleted] = (deletedCount[post.is_deleted] || 0) + 1
  })

  console.log('Status distribution:')
  Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`)
  })

  console.log('\nModeration status distribution:')
  Object.entries(moderationCount).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`)
  })

  console.log('\nDeleted status:')
  console.log(`  is_deleted=true: ${deletedCount.true}`)
  console.log(`  is_deleted=false: ${deletedCount.false}`)

  console.log('\n\nPosts with status=active AND moderation_status=approved AND is_deleted=false:')
  const { data: goodPosts } = await supabase
    .from('posts')
    .select('id')
    .eq('status', 'active')
    .eq('moderation_status', 'approved')
    .eq('is_deleted', false)

  console.log('Count:', goodPosts?.length || 0)
}

checkPosts()
