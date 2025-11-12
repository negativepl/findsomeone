'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save, Settings, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface ContentBotSettingsProps {
  onSaved?: () => void
}

interface Settings {
  content_bot_model: string
  content_bot_posts_per_category: number
  content_bot_description_min_length: number
  content_bot_description_max_length: number
  content_bot_title_min_length: number
  content_bot_title_max_length: number
  content_bot_images_count: number
  content_bot_system_message: string
  content_bot_prompt: string
}

const DEFAULT_SYSTEM_MESSAGE = `Jesteś ekspertem w tworzeniu autentycznych, naturalnych ogłoszeń na platformie lokalnych usług. Generujesz treści, które brzmią jak napisane przez prawdziwych użytkowników - nie używasz formalnego ani korporacyjnego języka. Twoje ogłoszenia są krótkie, konkretne i przyjazne.`

const DEFAULT_PROMPT = `Wygeneruj autentyczne ogłoszenie dla następujących parametrów:

Kategoria: {categoryName}
Typ kategorii: {categoryType}
Miasto: {city}

Wygeneruj ogłoszenie w następującym formacie JSON (zwróć TYLKO JSON, bez żadnych dodatkowych komentarzy):

{
  "title": "Krótki, naturalny tytuł ogłoszenia",
  "description": "Opis 2-3 zdania, konkretny i naturalny. Bez zbędnych ozdobników, jak pisałby prawdziwy użytkownik",
  "price": 100,
  "price_type": "hourly|fixed|negotiable",
  "price_negotiable": false
}

KRYTYCZNE WYMAGANIA - MUSISZ ICH PRZESTRZEGAĆ:
1. Tytuł MUSI mieć między {titleMinLength} a {titleMaxLength} znaków (policz dokładnie!)
2. Opis MUSI mieć między {descMinLength} a {descMaxLength} znaków (policz dokładnie!)
3. Jeśli opis jest za krótki, dodaj więcej szczegółów lub dodatkowe zdanie
4. Jeśli opis jest za długi, skróć go usuwając zbędne słowa

WAŻNE zasady stylistyczne:
1. Tytuł powinien być konkretny i naturalny (np. "Szukam kogoś do przeglądu instalacji elektrycznej" zamiast "Profesjonalne usługi elektryczne")
2. Opis krótki, bez ozdobników (np. "Potrzebuję sprawdzić instalację w mieszkaniu, kilka kontaktów się obluzowało. Mieszkam na Bemowie." zamiast długich opisów)
3. Używaj polskiego, potocznego języka
4. Ceny realistyczne dla danej kategorii
5. NIE używaj formalnych zwrotów ani korporacyjnego języka
6. Zwróć TYLKO poprawny JSON, bez markdown, bez dodatkowych tekstów`

export function ContentBotSettings({ onSaved }: ContentBotSettingsProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState<Settings>({
    content_bot_model: 'gpt-4o-mini',
    content_bot_posts_per_category: 3,
    content_bot_description_min_length: 150,
    content_bot_description_max_length: 300,
    content_bot_title_min_length: 30,
    content_bot_title_max_length: 60,
    content_bot_images_count: 1,
    content_bot_system_message: DEFAULT_SYSTEM_MESSAGE,
    content_bot_prompt: DEFAULT_PROMPT
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/ai-settings')
      const data = await response.json()

      if (data.success && data.settings) {
        setSettings({
          content_bot_model: data.settings.content_bot_model || 'gpt-4o-mini',
          content_bot_posts_per_category: data.settings.content_bot_posts_per_category || 3,
          content_bot_description_min_length: data.settings.content_bot_description_min_length || 150,
          content_bot_description_max_length: data.settings.content_bot_description_max_length || 300,
          content_bot_title_min_length: data.settings.content_bot_title_min_length || 30,
          content_bot_title_max_length: data.settings.content_bot_title_max_length || 60,
          content_bot_images_count: data.settings.content_bot_images_count || 1,
          content_bot_system_message: data.settings.content_bot_system_message || DEFAULT_SYSTEM_MESSAGE,
          content_bot_prompt: data.settings.content_bot_prompt || DEFAULT_PROMPT
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Nie udało się załadować ustawień')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/ai-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Ustawienia zostały zapisane')
        onSaved?.()
      } else {
        toast.error('Nie udało się zapisać ustawień')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Błąd podczas zapisywania')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <div className="border bg-muted rounded-3xl overflow-hidden">
          <div className="px-6 py-6 flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
        <div className="border bg-muted rounded-3xl overflow-hidden">
          <div className="px-6 py-6 flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Podstawowe - Left Card */}
      <div className="border bg-muted rounded-3xl overflow-hidden flex flex-col max-h-[calc(100vh-12rem)]">
        <div className="px-6 py-6 flex-1 overflow-y-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Podstawowe</h2>
              <p className="text-sm text-muted-foreground">Konfiguracja modelu i długości</p>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="outline"
              size="sm"
              className="rounded-full text-xs border-border hover:bg-accent gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Zapisz
                </>
              )}
            </Button>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model AI</Label>
                <Select
                  value={settings.content_bot_model}
                  onValueChange={(value) => setSettings({ ...settings, content_bot_model: value })}
                >
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Wybierz model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Model OpenAI używany do generowania treści</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postsPerCategory">Ogłoszeń na kategorię</Label>
                <Input
                  id="postsPerCategory"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.content_bot_posts_per_category}
                  onChange={(e) => setSettings({ ...settings, content_bot_posts_per_category: parseInt(e.target.value) || 3 })}
                />
                <p className="text-xs text-muted-foreground">Ile ogłoszeń wygenerować dla każdej kategorii</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Długość tytułu (znaki)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={settings.content_bot_title_min_length || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setSettings({ ...settings, content_bot_title_min_length: val === '' ? 0 : parseInt(val) })
                    }}
                    placeholder="Min"
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={settings.content_bot_title_max_length || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setSettings({ ...settings, content_bot_title_max_length: val === '' ? 0 : parseInt(val) })
                    }}
                    placeholder="Max"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Długość opisu (znaki)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={settings.content_bot_description_min_length || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setSettings({ ...settings, content_bot_description_min_length: val === '' ? 0 : parseInt(val) })
                    }}
                    placeholder="Min"
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={settings.content_bot_description_max_length || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setSettings({ ...settings, content_bot_description_max_length: val === '' ? 0 : parseInt(val) })
                    }}
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prompty - Right Card */}
      <div className="border bg-muted rounded-3xl overflow-hidden flex flex-col max-h-[calc(100vh-12rem)]">
        <div className="px-6 py-6 flex-1 overflow-y-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Prompty</h2>
              <p className="text-sm text-muted-foreground">Instrukcje dla AI</p>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="outline"
              size="sm"
              className="rounded-full text-xs border-border hover:bg-accent gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Zapisz
                </>
              )}
            </Button>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="systemMessage">Wiadomość systemowa</Label>
              <Textarea
                id="systemMessage"
                value={settings.content_bot_system_message}
                onChange={(e) => setSettings({ ...settings, content_bot_system_message: e.target.value })}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Instrukcje systemowe dla AI</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promptTemplate">Szablon promptu</Label>
              <Textarea
                id="promptTemplate"
                value={settings.content_bot_prompt}
                onChange={(e) => setSettings({ ...settings, content_bot_prompt: e.target.value })}
                rows={16}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Dostępne zmienne: {'{categoryName}'}, {'{categoryType}'}, {'{city}'}, {'{titleMinLength}'}, {'{titleMaxLength}'}, {'{descMinLength}'}, {'{descMaxLength}'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
