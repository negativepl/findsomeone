'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { toast } from 'sonner'

interface ContactFormProps {
  userEmail?: string | null
}

export function ContactForm({ userEmail }: ContactFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: userEmail || '',
    subject: '',
    message: '',
    category: 'general' as 'general' | 'support',
    gdprConsent: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Nie udało się wysłać wiadomości')
      }

      toast.success('Wiadomość została wysłana!', {
        description: 'Odpowiemy na nią w ciągu 24 godzin.'
      })

      // Reset form
      setFormData({
        email: userEmail || '',
        subject: '',
        message: '',
        category: 'general',
        gdprConsent: false
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Nie udało się wysłać wiadomości', {
        description: error instanceof Error ? error.message : 'Spróbuj ponownie później'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <>
      {/* Mobile: flat design */}
      <div className="md:hidden">
        <h2 className="text-xl font-bold text-foreground mb-4">Formularz kontaktowy</h2>
        <div className="bg-card rounded-2xl p-5">
          <p className="text-sm text-muted-foreground mb-6">
            Wypełnij formularz poniżej, a my odpowiemy na Twoją wiadomość w ciągu 24 godzin.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Twój email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card focus:border-brand focus:outline-none transition-colors text-sm"
                placeholder="twoj@email.pl"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Kategoria *
              </label>
              <Select
                name="category"
                value={formData.category}
                onValueChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    category: value
                  }))
                }}
                disabled={loading}
                required
              >
                <SelectTrigger className="w-full px-4 rounded-xl border border-border bg-card focus:border-brand focus:ring-brand transition-colors !h-11 text-sm" aria-label="Kategoria kontaktu">
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Kontakt ogólny</SelectItem>
                  <SelectItem value="support">Pomoc techniczna</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Temat *
              </label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card focus:border-brand focus:outline-none transition-colors text-sm"
                placeholder="W czym możemy pomóc?"
                disabled={loading}
                minLength={3}
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Wiadomość *
              </label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card focus:border-brand focus:outline-none transition-colors resize-none text-sm"
                placeholder="Opisz swój problem lub pytanie..."
                disabled={loading}
                minLength={10}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.message.length}/5000 znaków
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <Checkbox
                id="gdpr-consent-mobile"
                checked={formData.gdprConsent}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gdprConsent: checked as boolean }))}
                required
                disabled={loading}
                className="mt-0.5"
              />
              <label htmlFor="gdpr-consent-mobile" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                Wyrażam zgodę na przetwarzanie moich danych osobowych w celu obsługi zapytania kontaktowego zgodnie z{' '}
                <a href="/privacy" className="text-brand hover:underline" target="_blank" rel="noopener noreferrer">
                  Polityką Prywatności
                </a>
                . *
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.gdprConsent}
              className="w-full px-8 py-2.5 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-11 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Wysyłanie...' : 'Wyślij wiadomość'}
            </button>
          </form>
        </div>
      </div>

      {/* Desktop: card design */}
      <Card className="hidden md:block border border-border rounded-3xl bg-card">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Formularz kontaktowy</h2>
          <p className="text-muted-foreground mb-8">
            Wypełnij formularz poniżej, a my odpowiemy na Twoją wiadomość w ciągu 24 godzin.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Twój email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:border-brand focus:outline-none transition-colors"
                placeholder="twoj@email.pl"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Kategoria *
              </label>
              <Select
                name="category"
                value={formData.category}
                onValueChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    category: value
                  }))
                }}
                disabled={loading}
                required
              >
                <SelectTrigger className="w-full px-4 rounded-xl border border-border bg-card focus:border-brand focus:ring-brand transition-colors !h-12" aria-label="Kategoria kontaktu">
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Kontakt ogólny</SelectItem>
                  <SelectItem value="support">Pomoc techniczna</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Temat *
              </label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:border-brand focus:outline-none transition-colors"
                placeholder="W czym możemy pomóc?"
                disabled={loading}
                minLength={3}
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Wiadomość *
              </label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:border-brand focus:outline-none transition-colors resize-none"
                placeholder="Opisz swój problem lub pytanie..."
                disabled={loading}
                minLength={10}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.message.length}/5000 znaków
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="gdpr-consent-desktop"
                checked={formData.gdprConsent}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gdprConsent: checked as boolean }))}
                required
                disabled={loading}
                className="mt-1"
              />
              <label htmlFor="gdpr-consent-desktop" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                Wyrażam zgodę na przetwarzanie moich danych osobowych w celu obsługi zapytania kontaktowego zgodnie z{' '}
                <a href="/privacy" className="text-brand hover:underline" target="_blank" rel="noopener noreferrer">
                  Polityką Prywatności
                </a>
                . *
              </label>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-black/5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !formData.gdprConsent}
                  className="w-full md:w-auto px-8 py-3 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-11 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
