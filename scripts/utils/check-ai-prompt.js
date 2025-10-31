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

async function checkAIPrompt() {
  try {
    // Check ai_settings table
    const { data: settings, error } = await supabase
      .from('ai_settings')
      .select('*')
      .single()

    if (error) {
      console.error('Error:', error)
      return
    }

    console.log('=== AI Chat Assistant Settings ===\n')
    console.log('Enabled:', settings.chat_assistant_enabled)
    console.log('\n=== Welcome Message ===')
    console.log(settings.chat_assistant_welcome_message)
    console.log('\n=== Suggestions ===')
    console.log(JSON.stringify(settings.chat_assistant_suggestions, null, 2))
    console.log('\n=== Model ===')
    console.log(settings.chat_assistant_model)
    console.log('\n=== Max Results ===')
    console.log(settings.chat_assistant_max_results)
    console.log('\n=== Require City ===')
    console.log(settings.chat_assistant_require_city)
    console.log('\n=== System Prompt ===')
    console.log(settings.chat_assistant_system_prompt)

  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

checkAIPrompt()
