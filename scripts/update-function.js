// Update get_popular_categories function
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateFunction() {
  const sql = `
CREATE OR REPLACE FUNCTION get_popular_categories(limit_count INT DEFAULT 8)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  icon TEXT,
  description TEXT,
  post_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name::TEXT,
    c.slug::TEXT,
    c.icon::TEXT,
    c.description::TEXT,
    (
      -- Count posts directly in this category
      SELECT COUNT(*)::BIGINT
      FROM posts p
      WHERE p.category_id = c.id
        AND p.status = 'active'
        AND p.moderation_status = 'approved'
        AND p.is_deleted = false
    ) + (
      -- Count posts in all subcategories
      SELECT COALESCE(COUNT(*), 0)::BIGINT
      FROM posts p
      INNER JOIN categories sub ON p.category_id = sub.id
      WHERE sub.parent_id = c.id
        AND p.status = 'active'
        AND p.moderation_status = 'approved'
        AND p.is_deleted = false
    ) as post_count
  FROM categories c
  WHERE c.parent_id IS NULL  -- Only main categories
  ORDER BY post_count DESC, c.name ASC
  LIMIT limit_count;
END;
$$;
`

  console.log('Updating get_popular_categories function...')
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).single()

  if (error) {
    console.error('Error:', error)

    // Try direct approach
    console.log('\nTrying alternative method...')
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ sql_query: sql })
    })

    if (!response.ok) {
      console.error('Failed:', await response.text())
    } else {
      console.log('Success!')
    }
  } else {
    console.log('Function updated successfully!')
  }

  // Test it
  console.log('\nTesting function...')
  const { data, error: testError } = await supabase.rpc('get_popular_categories', { limit_count: 10 })

  if (testError) {
    console.error('Test error:', testError)
  } else {
    console.log('\nResults:')
    data?.forEach(cat => {
      console.log(`${cat.name}: ${cat.post_count} ogłoszeń`)
    })
  }
}

updateFunction()
