import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/20250131000000_fix_search_posts_columns.sql'
  )

  console.log('Reading migration file...')
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  console.log('Running migration...')
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

  if (error) {
    // Try direct execution via REST API
    console.log('Trying direct SQL execution...')
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    })

    if (!response.ok) {
      console.error('Migration failed:', error)
      console.log('\nPlease run this SQL manually in Supabase SQL Editor:')
      console.log('\n' + sql)
      process.exit(1)
    }
  }

  console.log('✅ Migration completed successfully!')
}

runMigration()
