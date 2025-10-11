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
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F3]">
        <div className="flex-1">
          <p className="text-sm font-medium text-black">Język</p>
          <p className="text-sm text-black/60">Wybierz język aplikacji</p>
        </div>
        <Select value={language} onValueChange={handleLanguageChange} disabled={loading}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pl">Polski</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F3]">
        <div className="flex-1">
          <p className="text-sm font-medium text-black">Motyw</p>
          <p className="text-sm text-black/60">Dostosuj wygląd aplikacji</p>
        </div>
        <Select value={theme} onValueChange={handleThemeChange} disabled={loading}>
          <SelectTrigger className="w-32">
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
