'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

interface ChatAssistantSettings {
  chat_assistant_enabled?: boolean
  chat_assistant_system_prompt?: string
  chat_assistant_welcome_message?: string
  chat_assistant_suggestions?: string[]
  chat_assistant_max_results?: number
  chat_assistant_require_city?: boolean
}

interface ChatAssistantManagerProps {
  initialSettings: ChatAssistantSettings | null
}

export function ChatAssistantManager({ initialSettings }: ChatAssistantManagerProps) {
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [chatEnabled, setChatEnabled] = useState(
    initialSettings?.chat_assistant_enabled ?? true
  )
  const [chatSystemPrompt, setChatSystemPrompt] = useState(
    initialSettings?.chat_assistant_system_prompt || ''
  )
  const [chatWelcomeMessage, setChatWelcomeMessage] = useState(
    initialSettings?.chat_assistant_welcome_message || ''
  )
  const [chatSuggestions, setChatSuggestions] = useState(
    initialSettings?.chat_assistant_suggestions?.join('\n') || ''
  )
  const [chatMaxResults, setChatMaxResults] = useState(
    initialSettings?.chat_assistant_max_results || 6
  )
  const [chatRequireCity, setChatRequireCity] = useState(
    initialSettings?.chat_assistant_require_city ?? true
  )

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/ai-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_assistant_enabled: chatEnabled,
          chat_assistant_system_prompt: chatSystemPrompt,
          chat_assistant_welcome_message: chatWelcomeMessage,
          chat_assistant_suggestions: chatSuggestions.split('\n').filter(s => s.trim()),
          chat_assistant_max_results: chatMaxResults,
          chat_assistant_require_city: chatRequireCity,
        }),
      })

      if (res.ok) {
        toast.success('Ustawienia zostały zapisane!', {
          description: 'Zmiany w asystencie czatu zostały zaktualizowane'
        })
      } else {
        const error = await res.json()
        toast.error('Nie udało się zapisać ustawień', {
          description: error.error || 'Spróbuj ponownie lub skontaktuj się z administratorem'
        })
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Błąd podczas zapisywania ustawień', {
        description: 'Wystąpił problem z połączeniem. Spróbuj ponownie.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat Assistant Settings */}
      <Card className="border bg-card rounded-3xl overflow-hidden flex-1 flex flex-col">
        <CardContent className="space-y-6 p-6 flex-1 overflow-y-auto">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">Konfiguracja asystenta</h2>
            <p className="text-sm text-muted-foreground mb-6">Ustawienia AI chatbota dla użytkowników (GPT-4o mini)</p>
          </div>
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted">
            <div>
              <h4 className="font-semibold text-foreground">Status asystenta</h4>
              <p className="text-sm text-muted-foreground">Włącz lub wyłącz chatbota na stronie</p>
            </div>
            <Switch
              checked={chatEnabled}
              onCheckedChange={setChatEnabled}
            />
          </div>

          {/* Max results */}
          <div>
            <Label htmlFor="chatMaxResults">Maksymalna liczba wyników</Label>
            <Input
              id="chatMaxResults"
              type="number"
              value={chatMaxResults}
              onChange={(e) => setChatMaxResults(parseInt(e.target.value))}
              min={1}
              max={20}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ile ogłoszeń pokazywać w wynikach wyszukiwania (rekomendowane: 6)
            </p>
          </div>

          {/* Require city toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted">
            <div>
              <h4 className="font-semibold text-foreground">Wymagaj miasta</h4>
              <p className="text-sm text-muted-foreground">Czy asystent powinien pytać o miasto jeśli nie podano?</p>
            </div>
            <Switch
              checked={chatRequireCity}
              onCheckedChange={setChatRequireCity}
            />
          </div>

          {/* Welcome message */}
          <div>
            <Label htmlFor="chatWelcome">Wiadomość powitalna</Label>
            <Textarea
              id="chatWelcome"
              value={chatWelcomeMessage}
              onChange={(e) => setChatWelcomeMessage(e.target.value)}
              rows={3}
              className="mt-2"
              placeholder="Cześć! Jestem tu aby pomóc&#10;&#10;Mogę pomóc Ci w nawigacji, odpowiedzieć na pytania o FindSomeone lub pomóc znaleźć odpowiednie ogłoszenia."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Pierwsza wiadomość pokazywana użytkownikom. Użyj Enter dla nowych linii.
            </p>
          </div>

          {/* Suggestions */}
          <div>
            <Label htmlFor="chatSuggestions">Sugerowane pytania</Label>
            <Textarea
              id="chatSuggestions"
              value={chatSuggestions}
              onChange={(e) => setChatSuggestions(e.target.value)}
              rows={5}
              className="mt-2"
              placeholder="Jedno pytanie na linię&#10;Jak dodać ogłoszenie?&#10;Jak znaleźć specjalistę?"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Jedno sugerowane pytanie na linię (3 rekomendowane)
            </p>
          </div>

          {/* System prompt */}
          <div>
            <Label htmlFor="chatPrompt">System Prompt</Label>
            <Textarea
              id="chatPrompt"
              value={chatSystemPrompt}
              onChange={(e) => setChatSystemPrompt(e.target.value)}
              rows={25}
              className="mt-2 font-mono text-sm"
              placeholder="Jesteś pomocnym asystentem FindSomeone..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Główny prompt określający zachowanie asystenta. Możesz użyć zmiennej <code className="bg-muted px-1 rounded">{'{CATEGORIES}'}</code> która zostanie automatycznie zastąpiona listą kategorii z bazy danych.
            </p>
          </div>
        </CardContent>

        {/* Actions */}
        <div className="px-6 pb-6 pt-6">
          <div className="border-t border-border pt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 font-semibold gap-1"
            >
              {isSaving ? 'Zapisywanie...' : 'Zapisz ustawienia'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
