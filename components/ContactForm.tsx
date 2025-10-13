'use client'

import { Card, CardContent } from '@/components/ui/card'
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
    category: 'general' as 'general' | 'support'
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
        category: 'general'
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
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="border-0 rounded-3xl bg-white">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-black mb-2">Email</h3>
            <p className="text-black/60 mb-4">
              Napisz do nas, odpowiemy w ciągu 24h
            </p>
            <a href="mailto:kontakt@findsomeone.app" className="text-[#C44E35] font-medium hover:underline">
              kontakt@findsomeone.app
            </a>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-3xl bg-white">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-black mb-2">Pomoc techniczna</h3>
            <p className="text-black/60 mb-4">
              Masz problem techniczny? Zgłoś go
            </p>
            <a href="mailto:pomoc@findsomeone.app" className="text-[#C44E35] font-medium hover:underline">
              pomoc@findsomeone.app
            </a>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 rounded-3xl bg-white">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-black mb-2">Formularz kontaktowy</h2>
          <p className="text-black/60 mb-8">
            Wypełnij formularz poniżej, a my odpowiemy na Twoją wiadomość w ciągu 24 godzin.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Twój email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white focus:border-[#C44E35] focus:outline-none transition-colors"
                placeholder="twoj@email.pl"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Kategoria *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white focus:border-[#C44E35] focus:outline-none transition-colors"
                disabled={loading}
                required
              >
                <option value="general">Kontakt ogólny (kontakt@findsomeone.app)</option>
                <option value="support">Pomoc techniczna (pomoc@findsomeone.app)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Temat *
              </label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white focus:border-[#C44E35] focus:outline-none transition-colors"
                placeholder="W czym możemy pomóc?"
                disabled={loading}
                minLength={3}
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Wiadomość *
              </label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white focus:border-[#C44E35] focus:outline-none transition-colors resize-none"
                placeholder="Opisz swój problem lub pytanie..."
                disabled={loading}
                minLength={10}
                maxLength={5000}
              />
              <p className="text-xs text-black/40 mt-1">
                {formData.message.length}/5000 znaków
              </p>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-black/5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-11 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
