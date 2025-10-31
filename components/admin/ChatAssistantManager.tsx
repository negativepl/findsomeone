'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { MODELS } from '@/lib/ai-models'

interface ChatAssistantSettings {
  chat_assistant_enabled?: boolean
  chat_assistant_system_prompt?: string
  chat_assistant_model?: string
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
  const [chatModel, setChatModel] = useState(
    initialSettings?.chat_assistant_model || 'gpt-5-nano'
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
          chat_assistant_model: chatModel,
          chat_assistant_welcome_message: chatWelcomeMessage,
          chat_assistant_suggestions: chatSuggestions.split('\n').filter(s => s.trim()),
          chat_assistant_max_results: chatMaxResults,
          chat_assistant_require_city: chatRequireCity,
        }),
      })

      if (res.ok) {
        alert('✅ Ustawienia zostały zapisane!')
      } else {
        const error = await res.json()
        alert(error.error || 'Nie udało się zapisać ustawień')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Błąd podczas zapisywania ustawień')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Chat Assistant Settings */}
      <Card className="border-0 rounded-3xl bg-white shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-black/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black mb-1">Konfiguracja asystenta</h2>
              <p className="text-sm text-black/60">Ustawienia AI chatbota dla użytkowników</p>
            </div>
            <Badge variant="outline" className="rounded-full border-[#C44E35]/20 bg-[#C44E35]/5 text-[#C44E35]">
              {chatModel}
            </Badge>
          </div>
        </div>
        <CardContent className="space-y-6 p-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5">
            <div>
              <h4 className="font-semibold text-black">Status asystenta</h4>
              <p className="text-sm text-black/60">Włącz lub wyłącz chatbota na stronie</p>
            </div>
            <Switch
              checked={chatEnabled}
              onCheckedChange={setChatEnabled}
            />
          </div>

          {/* Model selection */}
          <div>
            <Label htmlFor="chatModel">Model AI</Label>
            <Select value={chatModel} onValueChange={setChatModel}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Wybierz model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MODELS.GPT_5_NANO}>GPT-5 Nano (ultra-tani, wystarczający)</SelectItem>
                <SelectItem value={MODELS.GPT_5_MINI}>GPT-5 Mini (lepsza jakość konwersacji)</SelectItem>
                <SelectItem value={MODELS.GPT_5}>GPT-5 (najlepszy, najdroższy)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-black/40 mt-1">
              GPT-5 Nano jest wystarczający dla prostego asystenta
            </p>
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
            <p className="text-xs text-black/40 mt-1">
              Ile ogłoszeń pokazywać w wynikach wyszukiwania (rekomendowane: 6)
            </p>
          </div>

          {/* Require city toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5">
            <div>
              <h4 className="font-semibold text-black">Wymagaj miasta</h4>
              <p className="text-sm text-black/60">Czy asystent powinien pytać o miasto jeśli nie podano?</p>
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
            <p className="text-xs text-black/40 mt-1">
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
            <p className="text-xs text-black/40 mt-1">
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
            <p className="text-xs text-black/40 mt-1">
              Główny prompt określający zachowanie asystenta. Możesz użyć zmiennej <code className="bg-black/5 px-1 rounded">{'{CATEGORIES}'}</code> która zostanie automatycznie zastąpiona listą kategorii z bazy danych.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A]"
            >
              {isSaving ? 'Zapisywanie...' : 'Zapisz ustawienia'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-0 rounded-3xl bg-gradient-to-br from-[#C44E35]/10 to-[#C44E35]/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[#C44E35]/20">
              <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-black mb-2">O asystencie czatu</h3>
              <p className="text-sm text-black/70 leading-relaxed">
                Asystent AI pomaga użytkownikom w nawigacji po serwisie i wyszukiwaniu ogłoszeń.
                Wykorzystuje GPT do wykrywania intencji użytkownika i automatycznego wyszukiwania odpowiednich usług.
                Może pytać o brakujące informacje (np. miasto) i sugerować alternatywne kategorie.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
