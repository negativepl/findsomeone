const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAISettings() {
  console.log('🔍 Checking AI Chat Settings\n');

  const { data, error } = await supabase
    .from('ai_settings')
    .select('*')
    .single();

  if (error) {
    console.error('❌ Error fetching settings:', error.message);
    process.exit(1);
  }

  console.log('✅ AI Settings found:\n');
  console.log('Enabled:', data.chat_assistant_enabled);
  console.log('Model:', data.chat_assistant_model);
  console.log('Max Results:', data.chat_assistant_max_results);
  console.log('Require City:', data.chat_assistant_require_city);
  console.log('System Prompt Length:', data.chat_assistant_system_prompt?.length || 0);

  if (!data.chat_assistant_system_prompt || data.chat_assistant_system_prompt.length === 0) {
    console.log('\n❌ PROBLEM: System prompt is missing or empty!');
    console.log('This is why the chatbot fails with "not properly configured"');
  } else {
    console.log('\n✅ System prompt exists');
    console.log('\nFirst 200 chars of prompt:');
    console.log(data.chat_assistant_system_prompt.substring(0, 200) + '...');
  }
}

checkAISettings().catch(console.error);
