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

async function runMigration(migrationFile) {
  try {
    console.log(`\n🚀 Running migration: ${migrationFile}\n`)

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)
    const sql = fs.readFileSync(migrationPath, 'utf8')

    // Execute SQL using Supabase REST API
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error('❌ Migration failed:', error)

      // Try direct update as fallback
      console.log('\n⚠️  Trying direct update method...\n')

      // Extract the prompt from migration file
      const promptMatch = sql.match(/SET chat_assistant_system_prompt = '([\s\S]*?)';/)
      if (promptMatch) {
        const newPrompt = promptMatch[1]

        // First check if there are any rows
        const { data: existing, error: selectError } = await supabase
          .from('ai_settings')
          .select('id')
          .limit(1)
          .single()

        if (selectError) {
          console.error('❌ Could not find ai_settings row:', selectError)
          return
        }

        // Update using the actual ID
        const { data: updateData, error: updateError } = await supabase
          .from('ai_settings')
          .update({ chat_assistant_system_prompt: newPrompt })
          .eq('id', existing.id)

        if (updateError) {
          console.error('❌ Direct update also failed:', updateError)
        } else {
          console.log('✅ Migration completed successfully using direct update!')
          console.log('Updated ai_settings.chat_assistant_system_prompt')
        }
      }
    } else {
      console.log('✅ Migration completed successfully!')
      console.log(data)
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2]
if (!migrationFile) {
  console.error('Usage: node run-migration.js <migration-file>')
  process.exit(1)
}

runMigration(migrationFile)
