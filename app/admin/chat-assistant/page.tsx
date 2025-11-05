import { createClient } from '@/lib/supabase/server'
import { ChatAssistantManager } from '@/components/admin/ChatAssistantManager'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Asystent czatu - Panel administracyjny",
}

export default async function ChatAssistantPage() {
  const supabase = await createClient()

  // Fetch AI settings (chat assistant fields)
  const { data: settings } = await supabase
    .from('ai_settings')
    .select('chat_assistant_enabled, chat_assistant_system_prompt, chat_assistant_welcome_message, chat_assistant_suggestions, chat_assistant_max_results, chat_assistant_require_city')
    .single()

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Asystent czatu</h1>
        <p className="text-muted-foreground">
          Zarządzaj AI chatbotem dla użytkowników
        </p>
      </div>

      <ChatAssistantManager initialSettings={settings} />
    </>
  )
}
