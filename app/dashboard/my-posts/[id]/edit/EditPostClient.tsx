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
import NProgress from 'nprogress'

interface Category {
  id: string
  name: string
  slug: string
}

interface Post {
  id: string
  user_id: string
  title: string
  description: string
  type: 'seeking' | 'offering'
  city: string
  district: string | null
  price_min: number | null
  price_max: number | null
  price_type: 'hourly' | 'fixed' | 'negotiable' | null
  images: string[] | null
  categories: {
    id: string
    slug: string
    name: string
  } | null
}

interface EditPostClientProps {
  post: Post
}

export function EditPostClient({ post }: EditPostClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModerationModal, setShowModerationModal] = useState(false)
  const [moderationInProgress, setModerationInProgress] = useState(false)
  const [moderationResult, setModerationResult] = useState<{
    status: string
    score: number
    reasons: string[]
  } | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  const [formData, setFormData] = useState({
    title: post.title,
    description: post.description,
    type: post.type,
    category: post.categories?.slug || '',
    city: post.city,
    district: post.district || '',
    priceMin: post.price_min?.toString() || '',
    priceMax: post.price_max?.toString() || '',
    priceType: post.price_type || 'negotiable',
  })

  const [images, setImages] = useState<string[]>(post.images || [])
  const [imageRotations, setImageRotations] = useState<Record<string, number>>({})

  // Fetch categories on mount
  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, slug')
      .is('parent_id', null)
      .order('name')
      .then(({ data }) => {
        if (data) setCategories(data)
      })
  }, [supabase])

  // Process rotated images before submit
  const processRotatedImages = async (imagesToProcess: string[], rotations: Record<string, number>) => {
    const processedImages: string[] = []

    for (const imageUrl of imagesToProcess) {
      const rotation = rotations[imageUrl] || 0

      // If no rotation, keep original
      if (rotation === 0) {
        processedImages.push(imageUrl)
        continue
      }

      try {
        // Fetch the image
        const response = await fetch(imageUrl)
        const blob = await response.blob()

        // Create image element
        const img = document.createElement('img')
        const objectUrl = URL.createObjectURL(blob)

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = objectUrl
        })

        // Create canvas with swapped dimensions for 90/270 degree rotations
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas context not available')

        // Swap width/height for 90 and 270 degree rotations
        if (rotation === 90 || rotation === 270) {
          canvas.width = img.height
          canvas.height = img.width
        } else {
          canvas.width = img.width
          canvas.height = img.height
        }

        // Rotate and draw
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.drawImage(img, -img.width / 2, -img.height / 2)

        // Convert to blob
        const rotatedBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(blob => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to create blob'))
          }, 'image/jpeg', 0.9)
        })

        // Upload rotated image
        const fileExt = 'jpg'
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${post.user_id}/${post.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, rotatedBlob)

        if (uploadError) throw uploadError

        // Get new public URL
        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath)

        // Delete old image
        const url = new URL(imageUrl)
        const pathParts = url.pathname.split('/post-images/')
        if (pathParts.length > 1) {
          await supabase.storage
            .from('post-images')
            .remove([pathParts[1]])
        }

        processedImages.push(publicUrl)

        // Clean up
        URL.revokeObjectURL(objectUrl)
      } catch (err) {
        console.error('Error processing rotated image:', err)
        // If processing fails, use original
        processedImages.push(imageUrl)
      }
    }

    return processedImages
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Show modal immediately
    setShowModerationModal(true)
    setModerationInProgress(true)
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setShowModerationModal(false)
        throw new Error('Musisz być zalogowany aby edytować ogłoszenie')
      }

      // Process rotated images before updating post
      const processedImages = await processRotatedImages(images, imageRotations)

      // Get category ID from slug
      let categoryId = null
      if (formData.category) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', formData.category)
          .single()
        categoryId = category?.id || null
      }

      const { error: updateError } = await supabase
        .from('posts')
        .update({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          category_id: categoryId,
          city: formData.city,
          district: formData.district || null,
          price_min: formData.priceMin ? parseFloat(formData.priceMin) : null,
          price_max: formData.priceMax ? parseFloat(formData.priceMax) : null,
          price_type: formData.priceType,
          images: processedImages.length > 0 ? processedImages : null,
          // Reset moderation status - edited post needs to be re-verified
          moderation_status: 'checking',
          status: 'pending',
        })
        .eq('id', post.id)
        .eq('user_id', user.id) // Security: only update own posts

      if (updateError) {
        setShowModerationModal(false)
        throw updateError
      }

      // Trigger moderation for edited post and wait for result
      const moderationResponse = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      })

      if (!moderationResponse.ok) {
        throw new Error('Błąd podczas moderacji')
      }

      const moderationData = await moderationResponse.json()

      setModerationResult(moderationData)
      setModerationInProgress(false)

      // Wait 2 seconds to show result
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Navigate to my posts
      router.push('/dashboard/my-posts')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd')
      setLoading(false)
      setShowModerationModal(false)
      setModerationInProgress(false)
    }
  }

  return (
    <main className="container mx-auto px-4 md:px-6 py-6 md:py-16">
      <Card className="border-0 rounded-3xl bg-white">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl font-bold text-black">Formularz edycji</CardTitle>
          <CardDescription className="text-base text-black/60">
            Zaktualizuj informacje w swoim ogłoszeniu
          </CardDescription>
          <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900 mb-1">
                Ponowna weryfikacja wymagana
              </p>
              <p className="text-sm text-yellow-800">
                Po zapisaniu zmian, Twoje ogłoszenie zostanie ponownie zweryfikowane przez system moderacji. Ogłoszenie będzie widoczne publicznie dopiero po zatwierdzeniu.
              </p>
            </div>
          </div>
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
              userId={post.user_id}
              postId={post.id}
              maxImages={6}
              imageRotations={imageRotations}
              onRotationsChange={setImageRotations}
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
                <Link href="/dashboard/my-posts">
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
                  {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
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
            {moderationInProgress ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-[#C44E35]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-[#C44E35] animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-2">
                  Sprawdzanie zmian
                </h3>
                <p className="text-black/60">
                  Proszę czekać, weryfikujemy zaktualizowaną treść...
                </p>
              </div>
            ) : (
              <>
                {moderationResult?.status === 'approved' ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-2">
                      Zmiany zatwierdzone!
                    </h3>
                    <p className="text-black/60">
                      Twoje ogłoszenie zostało zaktualizowane i jest widoczne dla wszystkich użytkowników.
                    </p>
                  </div>
                ) : moderationResult?.status === 'flagged' ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-2">
                      Wymaga weryfikacji
                    </h3>
                    <p className="text-black/60">
                      Twoje zaktualizowane ogłoszenie zostanie sprawdzone przez moderatora w ciągu 24 godzin.
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-2">
                      Zmiany odrzucone
                    </h3>
                    <p className="text-black/60 mb-4">
                      Zaktualizowana treść nie spełnia naszych wymagań. Sprawdź, czy treść jest zgodna z regulaminem.
                    </p>
                    {moderationResult?.reasons && moderationResult.reasons.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-left">
                        <p className="text-sm font-semibold text-red-900 mb-2">Powody odrzucenia:</p>
                        <ul className="text-sm text-red-800 space-y-1">
                          {moderationResult.reasons.map((reason, idx) => (
                            <li key={idx}>• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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
