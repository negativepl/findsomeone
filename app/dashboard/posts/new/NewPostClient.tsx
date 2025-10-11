'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/ImageUpload'
import { RichTextEditor } from '@/components/RichTextEditor'

const CATEGORIES = [
  { id: 'hydraulika', name: 'Hydraulika' },
  { id: 'elektryka', name: 'Elektryka' },
  { id: 'sprzatanie', name: 'Sprzątanie' },
  { id: 'budowa-remont', name: 'Budowa i remont' },
  { id: 'ogrody', name: 'Ogrody' },
  { id: 'transport', name: 'Transport' },
  { id: 'it-komputery', name: 'IT i komputery' },
  { id: 'nauka-korepetycje', name: 'Nauka i korepetycje' },
  { id: 'opieka', name: 'Opieka' },
  { id: 'inne', name: 'Inne' },
]

export function NewPostClient() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'seeking' as 'seeking' | 'offering',
    category: '',
    city: '',
    district: '',
    priceMin: '',
    priceMax: '',
    priceType: 'negotiable' as 'hourly' | 'fixed' | 'negotiable',
  })

  const [images, setImages] = useState<string[]>([])
  const [userId, setUserId] = useState<string>('')

  // Get user ID on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Musisz być zalogowany aby dodać ogłoszenie')
      }

      // Get category ID from slug
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', formData.category)
        .single()

      const { error: insertError } = await supabase.from('posts').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category_id: category?.id || null,
        city: formData.city,
        district: formData.district || null,
        price_min: formData.priceMin ? parseFloat(formData.priceMin) : null,
        price_max: formData.priceMax ? parseFloat(formData.priceMax) : null,
        price_type: formData.priceType,
        images: images.length > 0 ? images : null,
        status: 'active',
      })

      if (insertError) throw insertError

      router.push('/dashboard/my-listings')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd')
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-6 py-10">
      <Card className="border-0 rounded-3xl bg-white">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl font-bold text-black">Dodaj nowe ogłoszenie</CardTitle>
          <CardDescription className="text-base text-black/60">
            Wypełnij formularz aby dodać ogłoszenie o poszukiwaniu lub oferowaniu usługi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-black">Typ ogłoszenia *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'seeking' | 'offering') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="rounded-2xl border-2 border-black/10 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seeking">Szukam usługi</SelectItem>
                  <SelectItem value="offering">Oferuję usługę</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-base font-semibold text-black">
                Tytuł ogłoszenia *
              </Label>
              <Input
                id="title"
                placeholder={
                  formData.type === 'seeking'
                    ? 'np. Szukam hydraulika do naprawy kranu'
                    : 'np. Oferuję usługi hydrauliczne - naprawy, instalacje'
                }
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30"
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-black">
                Opis *
              </Label>
              <RichTextEditor
                content={formData.description}
                onChange={(content) => setFormData({ ...formData, description: content })}
                placeholder={
                  formData.type === 'seeking'
                    ? 'Opisz szczegółowo czego szukasz: jakie prace, kiedy, jakie wymagania...'
                    : 'Opisz szczegółowo co oferujesz: zakres usług, doświadczenie, dostępność...'
                }
              />
            </div>

            {/* Images */}
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              userId={userId}
              maxImages={6}
            />

            {/* Category */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-black">Kategoria (opcjonalnie)</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="rounded-2xl border-2 border-black/10 h-12">
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="city" className="text-base font-semibold text-black">
                  Miasto *
                </Label>
                <Input
                  id="city"
                  placeholder="np. Warszawa"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="district" className="text-base font-semibold text-black">
                  Dzielnica (opcjonalnie)
                </Label>
                <Input
                  id="district"
                  placeholder="np. Śródmieście"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30"
                />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-black">Budżet (opcjonalnie)</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="priceMin" className="text-sm text-black/60">
                    Cena minimalna (zł)
                  </Label>
                  <Input
                    id="priceMin"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.priceMin}
                    onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                    className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="priceMax" className="text-sm text-black/60">
                    Cena maksymalna (zł)
                  </Label>
                  <Input
                    id="priceMax"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.priceMax}
                    onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                    className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30"
                  />
                </div>
              </div>
              <Select
                value={formData.priceType}
                onValueChange={(value: 'hourly' | 'fixed' | 'negotiable') =>
                  setFormData({ ...formData, priceType: value })
                }
              >
                <SelectTrigger className="rounded-2xl border-2 border-black/10 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Za godzinę</SelectItem>
                  <SelectItem value="fixed">Stała cena</SelectItem>
                  <SelectItem value="negotiable">Do negocjacji</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-3 pt-4">
              <Link href="/dashboard" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 h-12 text-base"
                >
                  Anuluj
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-12 text-base font-semibold"
              >
                {loading ? 'Dodawanie...' : 'Opublikuj ogłoszenie'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
