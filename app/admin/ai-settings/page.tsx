import { createClient } from '@/lib/supabase/server'
import { AISettingsManager } from '@/components/admin/AISettingsManager'
import { Metadata } from 'next'

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
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Ustawienia AI</h1>
        <p className="text-black/60">
          Zarządzaj promptami, modelami i parametrami sztucznej inteligencji
        </p>
      </div>

      <AISettingsManager initialSettings={settings} />
    </>
  )
}
