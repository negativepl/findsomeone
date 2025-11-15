// Script to check category post counts
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCategories() {
  console.log('Checking popular categories function...\n')

  // Call the function
  const { data: popularCategories, error } = await supabase
    .rpc('get_popular_categories', { limit_count: 15 })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Popular categories (from function):')
  console.log('Category'.padEnd(25), 'Post Count')
  console.log('-'.repeat(40))
  popularCategories?.forEach(cat => {
    console.log(cat.name.padEnd(25), cat.post_count)
  })

  console.log('\n\nManual count (active + approved posts):')

  // Get all main categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .is('parent_id', null)

  console.log('Category'.padEnd(25), 'Post Count')
  console.log('-'.repeat(40))

  const counts = []
  for (const cat of categories || []) {
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', cat.id)
      .eq('status', 'active')
      .eq('is_deleted', false)
      .eq('moderation_status', 'approved')

    counts.push({ name: cat.name, count: count || 0 })
  }

  counts.sort((a, b) => b.count - a.count)
  counts.forEach(c => {
    console.log(c.name.padEnd(25), c.count)
  })
}

checkCategories()
