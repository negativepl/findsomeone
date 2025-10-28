'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updatePreferences } from './actions'
import { toast } from 'sonner'

interface PreferencesSettingsProps {
  language?: string
  theme?: string
}

export function PreferencesSettings({
  language: initialLanguage = 'pl',
  theme: initialTheme = 'light'
}: PreferencesSettingsProps) {
  const [language, setLanguage] = useState(initialLanguage)
  const [theme, setTheme] = useState(initialTheme)
  const [loading, setLoading] = useState(false)

  async function handleLanguageChange(value: string) {
    setLanguage(value)
    setLoading(true)

    const formData = new FormData()
    formData.append('language', value)
    formData.append('theme', theme)

    const result = await updatePreferences(formData)
    setLoading(false)

    if (result.success) {
      toast.success('Język został zmieniony')
    } else {
      setLanguage(initialLanguage) // revert on error
      toast.error(result.error)
    }
  }

  async function handleThemeChange(value: string) {
    setTheme(value)
    setLoading(true)

    const formData = new FormData()
    formData.append('language', language)
    formData.append('theme', value)

    const result = await updatePreferences(formData)
    setLoading(false)

    if (result.success) {
      toast.success('Motyw został zmieniony')
    } else {
      setTheme(initialTheme) // revert on error
      toast.error(result.error)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-5 rounded-2xl bg-[#FAF8F3] opacity-50">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-base font-semibold text-black/60">Język</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/10 text-black/50 font-medium">
              Wkrótce
            </span>
          </div>
          <p className="text-sm text-black/40">Wybierz język aplikacji</p>
        </div>
        <Select value={language} onValueChange={handleLanguageChange} disabled={true}>
          <SelectTrigger className="w-36 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pl">Polski</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between p-5 rounded-2xl bg-[#FAF8F3] opacity-50">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-base font-semibold text-black/60">Motyw</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/10 text-black/50 font-medium">
              Wkrótce
            </span>
          </div>
          <p className="text-sm text-black/40">Dostosuj wygląd aplikacji</p>
        </div>
        <Select value={theme} onValueChange={handleThemeChange} disabled={true}>
          <SelectTrigger className="w-36 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Jasny</SelectItem>
            <SelectItem value="dark">Ciemny</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
