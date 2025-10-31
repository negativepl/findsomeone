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

async function changeModel() {
  try {
    console.log('🔧 Zmieniamy model AI z gpt-4o-mini na gpt-4o...\n')

    const { data: current, error: fetchError } = await supabase
      .from('ai_settings')
      .select('*')
      .single()

    if (fetchError) {
      console.error('❌ Error:', fetchError)
      return
    }

    console.log('Obecny model:', current.chat_assistant_model)

    const { data, error } = await supabase
      .from('ai_settings')
      .update({
        chat_assistant_model: 'gpt-4o-mini'
      })
      .eq('id', current.id)
      .select()

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    console.log('✅ Model zmieniony na: gpt-4o')
    console.log('\nGPT-4o jest bardziej stabilny i lepiej przestrzega formatów strukturalnych.')
    console.log('Dzięki temu chatbot zawsze będzie zwracał SEARCH_INTENT zamiast samego tekstu.')

  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

changeModel()
