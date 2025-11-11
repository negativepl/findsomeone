import { createClient } from '@/lib/supabase/server'
import { ChatAssistantManager } from '@/components/admin/ChatAssistantManager'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-3xl border p-0 gap-0 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-8 py-4 border-b">
          <div>
            <CardTitle className="text-base font-bold">Asystent czatu</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Zarządzaj AI chatbotem dla użytkowników
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-1 overflow-y-auto flex flex-col">
          <ChatAssistantManager initialSettings={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
