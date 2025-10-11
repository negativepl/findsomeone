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

interface Category {
  id: string
  name: string
  slug: string
}

export function NewPostClient() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModerationModal, setShowModerationModal] = useState(false)
  const [moderationStep, setModerationStep] = useState<'saving' | 'validating' | 'ai' | 'done'>('saving')
  const [moderationResult, setModerationResult] = useState<{
    status: string
    score: number
    reasons: string[]
  } | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

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

  // Get user ID and categories on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })

    // Fetch categories from database
    supabase
      .from('categories')
      .select('id, name, slug')
      .is('parent_id', null) // Only main categories, no subcategories
      .order('name')
      .then(({ data }) => {
        if (data) setCategories(data)
      })
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setShowModerationModal(true)
    setModerationStep('saving')

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

      const { data: newPost, error: insertError } = await supabase.from('posts').insert({
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
        status: 'pending',
        moderation_status: 'checking',
      }).select().single()

      if (insertError) throw insertError

      setModerationStep('validating')

      // Trigger moderation and wait for result
      if (newPost) {
        setModerationStep('ai')
        const moderationResponse = await fetch('/api/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: newPost.id }),
        })

        const moderationData = await moderationResponse.json()
        setModerationResult(moderationData)
        setModerationStep('done')

        // Wait 2 seconds to show result
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      router.push('/dashboard/my-listings')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd')
      setLoading(false)
      setShowModerationModal(false)
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
            {/* Title, Category and Type in one row */}
            <div className="grid md:grid-cols-[1fr_280px_280px] gap-4">
              {/* Title */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base font-semibold text-black">
                  Tytuł ogłoszenia *
                </Label>
                <div className="relative">
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
                    maxLength={80}
                    className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-black/40">
                    {formData.title.length}/80
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-black">Kategoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="rounded-2xl border-2 border-black/10 !h-12 w-full">
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-black">Typ ogłoszenia *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'seeking' | 'offering') =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="rounded-2xl border-2 border-black/10 !h-12 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seeking">Szukam usługi</SelectItem>
                    <SelectItem value="offering">Oferuję usługi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <div className="space-y-3">
              <Label className="text-base font-semibold text-black">Budżet (opcjonalnie)</Label>
              <div className="grid md:grid-cols-[1fr_1fr_280px] gap-4">
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
                <div className="space-y-3">
                  <Label className="text-sm text-black/60">Typ ceny</Label>
                  <Select
                    value={formData.priceType}
                    onValueChange={(value: 'hourly' | 'fixed' | 'negotiable') =>
                      setFormData({ ...formData, priceType: value })
                    }
                  >
                    <SelectTrigger className="rounded-2xl border-2 border-black/10 !h-12 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Za godzinę</SelectItem>
                      <SelectItem value="fixed">Stała cena</SelectItem>
                      <SelectItem value="negotiable">Do negocjacji</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-2xl text-sm">
                {error}
              </div>
            )}

            {/* Footer with buttons */}
            <div className="mt-8 pt-6 border-t-2 border-black/5 rounded-b-3xl">
              <div className="flex flex-col md:flex-row gap-3 md:justify-end">
                <Link href="/dashboard">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full md:w-auto rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 h-11 px-6 text-sm"
                  >
                    Anuluj
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-11 px-8 text-sm font-semibold"
                >
                  {loading ? 'Dodawanie...' : 'Opublikuj ogłoszenie'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Moderation Modal */}
      {showModerationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            {moderationStep !== 'done' ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-[#C44E35]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#C44E35] animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-2">
                    Sprawdzanie ogłoszenia
                  </h3>
                  <p className="text-black/60">
                    Proszę czekać, weryfikujemy treść...
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {moderationStep === 'saving' ? (
                      <div className="w-5 h-5 border-2 border-[#C44E35] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className="text-black">Zapisywanie ogłoszenia</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {moderationStep === 'validating' ? (
                      <div className="w-5 h-5 border-2 border-[#C44E35] border-t-transparent rounded-full animate-spin"></div>
                    ) : moderationStep === 'saving' ? (
                      <div className="w-5 h-5 border-2 border-black/20 rounded-full"></div>
                    ) : (
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className="text-black">Walidacja podstawowa</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {moderationStep === 'ai' ? (
                      <div className="w-5 h-5 border-2 border-[#C44E35] border-t-transparent rounded-full animate-spin"></div>
                    ) : moderationStep === 'saving' || moderationStep === 'validating' ? (
                      <div className="w-5 h-5 border-2 border-black/20 rounded-full"></div>
                    ) : (
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className="text-black">Analiza AI</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {moderationResult?.status === 'approved' ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-2">
                      Ogłoszenie zatwierdzone!
                    </h3>
                    <p className="text-black/60">
                      Twoje ogłoszenie jest aktywne i widoczne dla wszystkich użytkowników.
                    </p>
                  </div>
                ) : moderationResult?.status === 'flagged' ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-2">
                      Wymaga weryfikacji
                    </h3>
                    <p className="text-black/60">
                      Twoje ogłoszenie zostanie sprawdzone przez moderatora w ciągu 24 godzin.
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-2">
                      Ogłoszenie odrzucone
                    </h3>
                    <p className="text-black/60">
                      Twoje ogłoszenie nie spełnia wymogów i zostało odrzucone.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
