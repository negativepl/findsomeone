import { createClient } from '@/lib/supabase/server'
import { AISettingsManager } from '@/components/admin/AISettingsManager'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: "Ustawienia AI - Panel administracyjny",
}

export default async function AISettingsPage() {
  const supabase = await createClient()

  // Fetch AI settings
  const { data: settings } = await supabase
    .from('ai_settings')
    .select('*')
    .single()

  return (
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-xl border bg-card p-0 gap-0 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="h-20 flex flex-row items-center justify-between space-y-0 px-8 border-b flex-shrink-0">
          <div>
            <CardTitle className="text-base font-bold">Ustawienia AI</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Zarządzaj promptami, modelami i parametrami sztucznej inteligencji
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-1 overflow-y-auto flex flex-col bg-background">
          <AISettingsManager initialSettings={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
