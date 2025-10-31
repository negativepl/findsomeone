/**
 * Setup script for site content embeddings
 * 1. Creates the database table (if not exists)
 * 2. Generates and stores embeddings for all site content
 *
 * Run with: tsx scripts/setup-site-embeddings.ts
 */

import { createClient } from '@/lib/supabase/server-admin'
import { readFileSync } from 'fs'
import { join } from 'path'

async function setupDatabase() {
  console.log('📊 Setting up database table for site content embeddings...')

  const supabase = createClient()

  // Read the migration file
  const migrationPath = join(
    process.cwd(),
    'supabase',
    'migrations',
    '20250131200000_add_site_content_embeddings.sql'
  )

  const sql = readFileSync(migrationPath, 'utf8')

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`   Found ${statements.length} SQL statements to execute`)

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    console.log(`   Executing statement ${i + 1}/${statements.length}...`)

    try {
      // Execute each statement
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      }).throwOnError()

      if (error) {
        // Many statements will fail because objects already exist - that's OK
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️  Object already exists (skipping)`)
        } else {
          console.log(`   ⚠️  Statement failed:`, error.message)
        }
      }
    } catch (err: any) {
      // Check if it's an "already exists" error - that's fine
      if (err?.message?.includes('already exists')) {
        console.log(`   ⚠️  Object already exists (skipping)`)
      } else if (err?.message?.includes('function "exec_sql" does not exist')) {
        console.log(`\n⚠️  Direct SQL execution not available via RPC.`)
        console.log(`   Please run the migration manually using:`)
        console.log(`   psql $DB_URL -f supabase/migrations/20250131200000_add_site_content_embeddings.sql`)
        console.log(`\n   Or continue anyway if the table already exists...`)
        break
      } else {
        console.log(`   ⚠️  Unexpected error:`, err?.message)
      }
    }
  }

  // Verify the table exists
  const { data, error } = await supabase
    .from('site_content_embeddings')
    .select('id')
    .limit(1)

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows, which is fine
    console.error('\n❌ Table verification failed:', error)
    console.log('\nPlease run the migration manually:')
    console.log('psql $DB_URL -f supabase/migrations/20250131200000_add_site_content_embeddings.sql')
    process.exit(1)
  }

  console.log('✅ Database table is ready!')
}

async function main() {
  console.log('\n🚀 Site Content Embeddings Setup\n')
  console.log('This script will:')
  console.log('  1. Create database table (if needed)')
  console.log('  2. Generate embeddings for FAQ, Privacy, Terms, etc.')
  console.log('  3. Store embeddings in the database\n')

  await setupDatabase()

  console.log('\n📝 Now generating embeddings...')
  console.log('   (This is handled by generate-site-embeddings.ts)\n')

  // Import and run the embeddings generation
  const { default: generateEmbeddings } = await import('./generate-site-embeddings')

  console.log('\n✨ Setup complete!')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n💥 Setup failed:', error)
    process.exit(1)
  })
