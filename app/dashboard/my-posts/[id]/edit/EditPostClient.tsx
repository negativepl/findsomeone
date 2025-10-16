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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Musisz być zalogowany aby edytować ogłoszenie')
      }

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
          images: images.length > 0 ? images : null,
        })
        .eq('id', post.id)
        .eq('user_id', user.id) // Security: only update own posts

      if (updateError) throw updateError

      // Start loading bar before navigation
      NProgress.start()
      router.push('/dashboard/my-posts')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd')
      setLoading(false)
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
    </main>
  )
}
