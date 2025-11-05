'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/ImageUpload'
import { RichTextEditor } from '@/components/RichTextEditor'
import NProgress from 'nprogress'
import { Switch } from '@/components/ui/switch'
import { MapPin, ChevronRight, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { CategorySelector } from '@/components/CategorySelector'

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
  city: string
  district: string | null
  price: number | null
  price_type: 'hourly' | 'fixed' | 'free' | null
  price_negotiable: boolean | null
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
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(post.categories?.id || '')
  const [categoryPath, setCategoryPath] = useState<Array<{ id: string; name: string; slug: string }>>([])

  // AI Category suggestion state
  const [suggestingCategory, setSuggestingCategory] = useState(false)

  const [formData, setFormData] = useState({
    title: post.title,
    description: post.description,
    city: post.city,
    district: post.district || '',
    price: post.price?.toString() || '',
    priceType: post.price_type || 'fixed',
    priceNegotiable: post.price_negotiable || false,
  })

  const [images, setImages] = useState<string[]>(post.images || [])
  const [imageRotations, setImageRotations] = useState<Record<string, number>>({})

  // Location detection state
  const [detectingLocation, setDetectingLocation] = useState(false)

  // Cities from database
  const [cities, setCities] = useState<Array<{ id: string; name: string; slug: string; voivodeship: string | null }>>([])
  const [loadingCities, setLoadingCities] = useState(true)
  const [openCityCombobox, setOpenCityCombobox] = useState(false)

  // Load initial category path
  useEffect(() => {
    const loadCategoryPath = async () => {
      if (!post.categories?.id) return

      const { data: allCats } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')

      if (allCats) {
        // Build the full path from root to this category
        const path: Array<{ id: string; name: string; slug: string }> = []
        let currentCat: { id: any; name: any; slug: any; parent_id: any } | undefined = allCats.find(cat => cat.id === post.categories?.id)

        while (currentCat) {
          path.unshift({ id: currentCat.id, name: currentCat.name, slug: currentCat.slug })
          if (currentCat.parent_id) {
            currentCat = allCats.find(cat => cat.id === currentCat!.parent_id)
          } else {
            currentCat = undefined
          }
        }

        setCategoryPath(path)
      }
    }

    loadCategoryPath()
  }, [supabase, post.categories?.id])

  // Fetch cities from database
  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, slug, voivodeship')
        .order('name', { ascending: true })

      if (data && !error) {
        setCities(data)
      }
      setLoadingCities(false)
    }

    fetchCities()
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

  // Location detection handler
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolokalizacja niedostępna', {
        description: 'Twoja przeglądarka nie obsługuje wykrywania lokalizacji'
      })
      return
    }

    setDetectingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use Nominatim (OpenStreetMap) for reverse geocoding
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'pl'
              }
            }
          )

          if (!response.ok) {
            throw new Error('Nie udało się wykryć lokalizacji')
          }

          const data = await response.json()
          const address = data.address

          // Extract city (try different fields in order of preference)
          const city = address.city
            || address.town
            || address.village
            || address.municipality
            || address.county
            || ''

          if (city) {
            setFormData({
              ...formData,
              city,
              district: '' // Don't auto-fill district
            })
            toast.success('Lokalizacja wykryta!', {
              description: city
            })
          } else {
            toast.error('Nie znaleziono miasta', {
              description: 'Spróbuj wpisać lokalizację ręcznie'
            })
          }
        } catch (error) {
          console.error('Geocoding error:', error)
          toast.error('Błąd wykrywania lokalizacji', {
            description: 'Nie udało się określić miasta'
          })
        } finally {
          setDetectingLocation(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        let errorMessage = 'Nie udało się pobrać lokalizacji'

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Musisz zezwolić na dostęp do lokalizacji'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Lokalizacja niedostępna'
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Przekroczono limit czasu'
        }

        toast.error('Błąd lokalizacji', {
          description: errorMessage
        })
        setDetectingLocation(false)
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    )
  }

  // AI-powered category suggestion
  const handleSuggestCategory = async () => {
    if (!formData.title && !formData.description) {
      toast.error('Brak danych', {
        description: 'Wpisz tytuł lub opis, aby wykryć kategorię'
      })
      return
    }

    setSuggestingCategory(true)

    try {
      const response = await fetch('/api/posts/suggest-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Nie udało się wykryć kategorii')
      }

      if (data.suggestion) {
        // Fetch the full category data to build the path
        const { data: allCats } = await supabase
          .from('categories')
          .select('id, name, slug, parent_id')

        if (allCats) {
          // Find the suggested category (use most specific level available)
          const targetSlug = data.suggestion.thirdLevelSlug
            || data.suggestion.subcategorySlug
            || data.suggestion.categorySlug
          const targetCategory = allCats.find(cat => cat.slug === targetSlug)

          if (targetCategory) {
            // Build the full path from root to this category
            const path: Array<{ id: string; name: string; slug: string }> = []
            let currentCat: { id: any; name: any; slug: any; parent_id: any } | undefined = targetCategory

            while (currentCat) {
              path.unshift({ id: currentCat.id, name: currentCat.name, slug: currentCat.slug })
              if (currentCat.parent_id) {
                currentCat = allCats.find(cat => cat.id === currentCat!.parent_id)
              } else {
                currentCat = undefined
              }
            }

            setSelectedCategoryId(targetCategory.id)
            setCategoryPath(path)

            // Show success toast
            toast.success('Kategoria wykryta!')
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił błąd podczas wykrywania kategorii'
      toast.error('Błąd wykrywania', {
        description: errorMessage
      })
    } finally {
      setSuggestingCategory(false)
    }
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

      const { error: updateError } = await supabase
        .from('posts')
        .update({
          title: formData.title,
          description: formData.description,
          category_id: selectedCategoryId,
          city: formData.city,
          district: formData.district || null,
          price: formData.price ? parseFloat(formData.price) : null,
          price_type: formData.priceType,
          price_negotiable: formData.priceNegotiable,
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
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8">
      {/* Page Header - Above Card */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-4xl font-bold text-foreground">Formularz edycji</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-4">
          Zaktualizuj informacje w swoim ogłoszeniu
        </p>
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
              Ponowna weryfikacja wymagana
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              Po zapisaniu zmian, Twoje ogłoszenie zostanie ponownie zweryfikowane przez system moderacji. Ogłoszenie będzie widoczne publicznie dopiero po zatwierdzeniu.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop: Card wrapper */}
      <Card className="border border-border rounded-3xl bg-card">
        <CardContent className="pt-6 px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-base font-semibold text-foreground">
                Tytuł ogłoszenia <span className="text-brand">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="title"
                  placeholder="np. Hydraulik Warszawa - naprawa kranów"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  maxLength={80}
                  className="rounded-2xl border border-border h-12 focus:border-border pr-16 text-sm md:text-base placeholder:text-xs md:placeholder:text-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs md:text-sm text-muted-foreground font-medium">
                  {formData.title.length}/80
                </span>
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-foreground">Kategoria <span className="text-brand">*</span></Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestCategory}
                  disabled={suggestingCategory || (!formData.title && !formData.description)}
                  className="rounded-full border border-brand/20 hover:border-brand hover:bg-brand/5 hover:text-brand h-8 px-3 text-xs font-semibold text-brand disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestingCategory ? (
                    <>
                      <svg className="w-3.5 h-3.5 mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Wykrywam...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m10.25 21.25 1-7h-6.5l9-11.5-1 8 6.5.03z" />
                      </svg>
                      Wykryj kategorię
                    </>
                  )}
                </Button>
              </div>
              <button
                type="button"
                onClick={() => setShowCategorySelector(true)}
                className={`w-full rounded-2xl border transition-all p-4 text-left group ${
                  categoryPath.length > 0
                    ? 'border-brand/30 bg-brand/5 hover:border-brand/50'
                    : 'border-border hover:border-border/70 hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    categoryPath.length > 0 ? 'bg-brand/10' : 'bg-muted group-hover:bg-accent'
                  }`}>
                    <svg className={`w-6 h-6 transition-colors ${
                      categoryPath.length > 0 ? 'text-brand' : 'text-muted-foreground group-hover:text-foreground'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">Kategoria</div>
                    <div className={`font-medium truncate ${
                      categoryPath.length > 0 ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {categoryPath.length > 0
                        ? categoryPath.map(c => c.name).join(' > ')
                        : 'Wybierz kategorię'
                      }
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    categoryPath.length > 0 ? 'text-brand' : 'text-muted-foreground group-hover:text-foreground'
                  }`} />
                </div>
              </button>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-foreground">
                Opis <span className="text-brand">*</span>
              </Label>
              <RichTextEditor
                content={formData.description}
                onChange={(content) => setFormData({ ...formData, description: content })}
                placeholder="Opisz szczegółowo swoje ogłoszenie: zakres usług lub potrzeb, termin, wymagania..."
              />
            </div>

            {/* Images */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-foreground">
                Zdjęcia <span className="text-brand">*</span>
              </Label>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                userId={post.user_id}
                postId={post.id}
                maxImages={6}
                imageRotations={imageRotations}
                onRotationsChange={setImageRotations}
              />
            </div>

            {/* Location */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-foreground">
                  Lokalizacja <span className="text-brand">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                  className="rounded-full border border-brand/20 hover:border-brand hover:bg-brand/5 hover:text-brand h-8 px-3 text-xs font-semibold text-brand disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MapPin className="w-3.5 h-3.5 mr-1.5" />
                  {detectingLocation ? 'Wykrywam...' : 'Wykryj lokalizację'}
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground">
                    Miasto <span className="text-brand">*</span>
                  </Label>
                  <Popover open={openCityCombobox} onOpenChange={setOpenCityCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCityCombobox}
                        className="w-full justify-between rounded-2xl border border-border h-12 hover:border-border/70 hover:bg-muted font-normal"
                      >
                        {formData.city || "Wybierz miasto"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0 rounded-2xl border border-border" align="start">
                      <Command className="rounded-2xl">
                        <CommandInput placeholder="Szukaj miasta..." className="rounded-t-2xl" />
                        <CommandList>
                          <CommandEmpty>Nie znaleziono miasta.</CommandEmpty>
                          <CommandGroup>
                            {cities.map((city) => (
                              <CommandItem
                                key={city.id}
                                value={city.name}
                                onSelect={(currentValue) => {
                                  setFormData({ ...formData, city: currentValue })
                                  setOpenCityCombobox(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 flex-shrink-0",
                                    formData.city === city.name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex items-center justify-between w-full">
                                  <span>{city.name}</span>
                                  {city.voivodeship && (
                                    <span className="text-xs text-muted-foreground ml-2">{city.voivodeship}</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="district" className="text-sm text-muted-foreground">
                    Dzielnica (opcjonalnie)
                  </Label>
                  <Input
                    id="district"
                    placeholder="np. Śródmieście"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="rounded-2xl border border-border h-12 focus:border-border"
                  />
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="space-y-3 w-full md:w-48">
                <Label className="text-base font-semibold text-foreground">Typ ceny <span className="text-brand">*</span></Label>
                <Select
                  value={formData.priceType}
                  onValueChange={(value: 'hourly' | 'fixed' | 'free') =>
                    setFormData({ ...formData, priceType: value })
                  }
                  required
                >
                  <SelectTrigger className="rounded-2xl border border-border !h-12 w-full" aria-label="Typ ceny">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Stała cena</SelectItem>
                    <SelectItem value="hourly">Za godzinę</SelectItem>
                    <SelectItem value="free">Za darmo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 flex-1">
                <Label htmlFor="price" className="text-base font-semibold text-foreground">
                  Cena (zł) {formData.priceType !== 'free' && <span className="text-brand">*</span>}
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    disabled={formData.priceType === 'free'}
                    required={formData.priceType !== 'free'}
                    className="rounded-2xl border border-border h-12 focus:border-border disabled:opacity-50 disabled:cursor-not-allowed w-32"
                  />

                  {/* Negotiable switch */}
                  {formData.priceType !== 'free' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        id="priceNegotiable"
                        checked={formData.priceNegotiable}
                        onCheckedChange={(checked) => setFormData({ ...formData, priceNegotiable: checked })}
                        aria-label="Cena do negocjacji"
                      />
                      <label htmlFor="priceNegotiable" className="text-sm text-muted-foreground cursor-pointer select-none whitespace-nowrap">
                        Cena do negocjacji
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm">
                {error}
              </div>
            )}

            {/* Footer with buttons */}
            <div className="mt-8 pt-6 border-t-2 border-border rounded-b-3xl">
              <div className="flex flex-col md:flex-row gap-3 md:justify-end">
                <Link href="/dashboard/my-posts">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full md:w-auto rounded-full border border-border hover:border-border/70 hover:bg-muted h-11 px-6 text-sm"
                  >
                    Anuluj
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto rounded-full bg-brand hover:bg-brand/90 text-white border-0 h-11 px-8 text-sm font-semibold"
                >
                  {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Category Selector Modal */}
      <CategorySelector
        open={showCategorySelector}
        onOpenChange={setShowCategorySelector}
        onSelect={(categoryId, path) => {
          setSelectedCategoryId(categoryId)
          setCategoryPath(path)
        }}
        selectedCategoryId={selectedCategoryId}
      />

      {/* Moderation Modal */}
      {showModerationModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl p-8 max-w-md w-full">
            {moderationInProgress ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-brand animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Sprawdzanie zmian
                </h3>
                <p className="text-muted-foreground">
                  Proszę czekać, weryfikujemy zaktualizowaną treść...
                </p>
              </div>
            ) : (
              <>
                {moderationResult?.status === 'approved' ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Zmiany zatwierdzone!
                    </h3>
                    <p className="text-muted-foreground">
                      Twoje ogłoszenie zostało zaktualizowane i jest widoczne dla wszystkich użytkowników.
                    </p>
                  </div>
                ) : moderationResult?.status === 'flagged' ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Wymaga weryfikacji
                    </h3>
                    <p className="text-muted-foreground">
                      Twoje zaktualizowane ogłoszenie zostanie sprawdzone przez moderatora w ciągu 24 godzin.
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Zmiany odrzucone
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Zaktualizowana treść nie spełnia naszych wymagań. Sprawdź, czy treść jest zgodna z regulaminem.
                    </p>
                    {moderationResult?.reasons && moderationResult.reasons.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 text-left">
                        <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">Powody odrzucenia:</p>
                        <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
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
      </div>
    </main>
  )
}
