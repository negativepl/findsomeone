'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RichTextEditor } from '@/components/RichTextEditor'
import { RichTextToolbar } from '@/components/RichTextToolbar'
import { ImageUpload } from '@/components/ImageUpload'
import { MapPin, Loader2, Tag, FileText, ImageIcon, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Switch } from '@/components/ui/switch'
import { CategorySelector } from '@/components/CategorySelector'

interface Category {
  id: string
  name: string
  slug: string
}

interface City {
  name: string
  slug: string
  voivodeship?: string
  popular?: boolean
}

interface CreatePostClientProps {
  categories: Category[]
}

export function CreatePostClient({ categories }: CreatePostClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 7
  const [isTransitioning, setIsTransitioning] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    description: '',
    city: '',
    district: '',
    priceType: 'fixed', // 'fixed', 'hourly', 'free'
    price: '',
    priceNegotiable: false,
  })

  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [richTextEditor, setRichTextEditor] = useState<any>(null)
  const [images, setImages] = useState<string[]>([])
  const [imageRotations, setImageRotations] = useState<Record<string, number>>({})
  const [userId, setUserId] = useState<string>('')

  // City selection state
  const [cityQuery, setCityQuery] = useState('')
  const [cities, setCities] = useState<City[]>([])
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const cityDropdownRef = useRef<HTMLDivElement>(null)
  const cityDebounceTimerRef = useRef<NodeJS.Timeout>()

  // Moderation states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModerationModal, setShowModerationModal] = useState(false)
  const [moderationInProgress, setModerationInProgress] = useState(false)
  const [moderationResult, setModerationResult] = useState<any>(null)

  // AI Category suggestion state
  const [suggestingCategory, setSuggestingCategory] = useState(false)

  // Category selector state
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [categoryPath, setCategoryPath] = useState<Array<{ id: string; name: string; slug: string }>>([])

  // Get user ID on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [supabase])

  // Close city dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityInputRef.current && !cityInputRef.current.contains(event.target as Node) &&
        cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCityDropdownOpen(false)
      }
    }

    if (isCityDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCityDropdownOpen])

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const selectedCategory = categories.find(cat => cat.slug === formData.category)
      if (selectedCategory) {
        supabase
          .from('categories')
          .select('id, name, slug, parent_id')
          .eq('parent_id', selectedCategory.id)
          .order('display_order')
          .then(({ data }) => {
            if (data) {
              setSubcategories(data)
            } else {
              setSubcategories([])
            }
          })
      }
    } else {
      setSubcategories([])
      setFormData(prev => ({ ...prev, subcategory: '' }))
    }
  }, [formData.category, categories, supabase])

  // Fetch cities from API
  const fetchCities = useCallback(async (query: string) => {
    try {
      setIsLoadingCities(true)
      const response = await fetch(`/api/cities?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setCities(data.cities || [])
    } catch (error) {
      console.error('Cities fetch error:', error)
      setCities([])
    } finally {
      setIsLoadingCities(false)
    }
  }, [])

  // Handle city input change
  const handleCityChange = (value: string) => {
    setCityQuery(value)

    if (cityDebounceTimerRef.current) {
      clearTimeout(cityDebounceTimerRef.current)
    }

    cityDebounceTimerRef.current = setTimeout(() => {
      fetchCities(value)
    }, 200)
  }

  // Handle city selection
  const handleCitySelect = (cityName: string) => {
    setFormData({ ...formData, city: cityName })
    setCityQuery('')
    setIsCityDropdownOpen(false)
  }

  // Detect location
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Twoja przeglądarka nie obsługuje wykrywania lokalizacji')
      return
    }

    setIsDetectingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pl`
          )
          const data = await response.json()

          const city = data.address?.city ||
                      data.address?.town ||
                      data.address?.village ||
                      data.address?.municipality ||
                      null

          if (city) {
            handleCitySelect(city)
          } else {
            toast.error('Nie udało się określić miasta', {
              description: 'Spróbuj wpisać miasto ręcznie'
            })
          }
        } catch (error) {
          console.error('Błąd podczas wykrywania lokalizacji:', error)
          toast.error('Błąd podczas wykrywania lokalizacji')
        } finally {
          setIsDetectingLocation(false)
        }
      },
      (error) => {
        console.warn('Geolokalizacja niedostępna:', error.code, error.message)
        setIsDetectingLocation(false)

        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Odmówiono dostępu do lokalizacji', {
            description: 'Sprawdź ustawienia przeglądarki'
          })
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error('Nie można określić lokalizacji', {
            description: 'Spróbuj ponownie później'
          })
        } else if (error.code === error.TIMEOUT) {
          toast.error('Przekroczono czas oczekiwania', {
            description: 'Spróbuj ponownie'
          })
        } else {
          toast.error('Błąd podczas wykrywania lokalizacji')
        }
      }
    )
  }

  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1: return 'Tytuł'
      case 2: return 'Opis'
      case 3: return 'Kategoria'
      case 4: return 'Zdjęcia'
      case 5: return 'Lokalizacja'
      case 6: return 'Cena'
      case 7: return 'Podsumowanie'
      default: return ''
    }
  }

  const getCategoryName = (slug: string): string => {
    const category = categories.find(cat => cat.slug === slug)
    return category?.name || slug
  }

  const getSubcategoryName = (slug: string): string => {
    const subcat = subcategories.find(sub => sub.slug === slug)
    return subcat?.name || slug
  }

  const getPriceDisplay = (): string => {
    if (formData.priceType === 'free') return 'Za darmo'
    const basePrice = formData.priceType === 'hourly' ? `${formData.price} PLN/godz.` : `${formData.price} PLN`
    return formData.priceNegotiable ? `${basePrice} (do negocjacji)` : basePrice
  }

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
        // Fetch the full category data
        const { data: allCats } = await supabase
          .from('categories')
          .select('id, name, slug, parent_id')

        if (allCats) {
          // Find the suggested category (use most specific level available)
          const targetSlug = data.suggestion.thirdLevelSlug
            || data.suggestion.subcategorySlug
            || data.suggestion.categorySlug
          const targetCategory = allCats.find((cat: Category) => cat.slug === targetSlug)

          if (targetCategory) {
            // Build the full path from root to this category
            const path: Array<{ id: string; name: string; slug: string }> = []
            let currentCat: any = targetCategory

            while (currentCat) {
              path.unshift({ id: currentCat.id, name: currentCat.name, slug: currentCat.slug })
              currentCat = (currentCat.parent_id
                ? allCats.find((cat: any) => cat.id === currentCat.parent_id)
                : null) || null
            }

            setSelectedCategoryId(targetCategory.id)
            setCategoryPath(path)

            // Also update formData for backward compatibility
            const topLevel = path[0]
            const secondLevel = path[1]
            setFormData({
              ...formData,
              category: topLevel?.slug || '',
              subcategory: secondLevel?.slug || ''
            })

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

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        // Step 1: Only title
        return !!formData.title.trim()
      case 2:
        // Step 2: Description
        return formData.description.trim().length > 0
      case 3:
        // Step 3: Category (now using CategorySelector)
        return selectedCategoryId !== ''
      case 4:
        // Step 4: Images (required, at least 1 image)
        return images.length > 0
      case 5:
        // Step 5: Location
        return formData.city.trim().length > 0
      case 6:
        // Step 6: Price
        if (formData.priceType === 'free') return true
        const priceNum = parseFloat(formData.price.replace(/\s/g, '').replace(',', '.'))
        return !isNaN(priceNum) && priceNum > 0
      default:
        return true
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setTimeout(() => setIsTransitioning(false), 50)
      }, 200)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setTimeout(() => setIsTransitioning(false), 50)
      }, 200)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

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
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
        const filePath = `${userId}/rotated/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, rotatedBlob)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath)

        processedImages.push(publicUrl)
        URL.revokeObjectURL(objectUrl)

      } catch (error) {
        console.error('Error processing rotated image:', error)
        // If rotation fails, use original
        processedImages.push(imageUrl)
      }
    }

    return processedImages
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setShowModerationModal(true)
    setModerationInProgress(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Musisz być zalogowany aby dodać ogłoszenie')
      }

      // Process rotated images
      const processedImages = await processRotatedImages(images, imageRotations)

      // Get category ID from slug
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', formData.category)
        .single()

      // Get subcategory ID if selected
      let subcategoryId = null
      if (formData.subcategory) {
        const { data: subcategory } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', formData.subcategory)
          .single()
        subcategoryId = subcategory?.id || null
      }

      // Convert price
      let price = null
      if (formData.priceType !== 'free' && formData.price) {
        // Remove spaces and replace comma with dot for decimal
        price = parseFloat(formData.price.replace(/\s/g, '').replace(',', '.'))
      }

      // Create post
      const { data: newPost, error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category_id: subcategoryId || category?.id || null,
          city: formData.city,
          district: formData.district || null,
          price: price,
          price_type: formData.priceType,
          price_negotiable: formData.priceNegotiable,
          images: processedImages.length > 0 ? processedImages : null,
          status: 'pending',
          moderation_status: 'checking',
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Generate and update embedding (don't block on errors)
      if (newPost) {
        try {
          // Get category name for embedding
          const categoryIdToUse = subcategoryId || category?.id
          if (categoryIdToUse) {
            const { data: categoryData } = await supabase
              .from('categories')
              .select('name')
              .eq('id', categoryIdToUse)
              .single()

            const categoryName = categoryData?.name || ''

            // Generate embedding via API route
            const embeddingResponse = await fetch('/api/posts/generate-embedding', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: formData.title,
                description: formData.description,
                category: categoryName,
                city: formData.city,
              }),
            })

            if (embeddingResponse.ok) {
              const { embedding } = await embeddingResponse.json()

              // Update post with embedding if generated successfully
              if (embedding) {
                await supabase
                  .from('posts')
                  .update({ embedding: `[${embedding.join(',')}]` })
                  .eq('id', newPost.id)
              }
            }
          }
        } catch (embeddingError) {
          console.error('Failed to generate embedding:', embeddingError)
          // Continue with post creation even if embedding fails
        }
      }

      // Trigger moderation
      if (newPost) {
        const moderationResponse = await fetch('/api/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: newPost.id }),
        })

        const moderationData = await moderationResponse.json()
        setModerationResult(moderationData)
        setModerationInProgress(false)

        // Wait 2 seconds to show result before redirecting
        setTimeout(() => {
          if (moderationData.status === 'approved') {
            router.push(`/dashboard/my-posts`)
          } else if (moderationData.status === 'rejected') {
            // Stay on modal to show rejection
          } else {
            // Flagged - redirect to my posts
            router.push(`/dashboard/my-posts`)
          }
        }, 2000)
      }
    } catch (error) {
      console.error('Error creating post:', error)
      setModerationInProgress(false)
      setModerationResult({
        success: false,
        status: 'error',
        reasons: [error instanceof Error ? error.message : 'Wystąpił błąd'],
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen flex flex-col ${currentStep === 2 ? 'bg-card' : 'bg-background'}`}>
      {/* Progress bar - całkiem na górze */}
      <div className="h-1 bg-muted sticky top-0 z-50">
        <div
          className="h-full bg-brand transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Header - zaokrąglony */}
      <header className="bg-card border-b border-border sticky top-1 z-40 shadow-sm rounded-b-3xl">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Title on the left */}
          <h1
            className={`text-xl font-bold text-foreground transition-all duration-200 ${
              isTransitioning ? 'opacity-0 blur-sm scale-95' : 'opacity-100 blur-0 scale-100'
            }`}
          >
            {getStepTitle(currentStep)}
          </h1>
          {/* Step counter on the right */}
          <p
            className={`text-lg text-muted-foreground font-semibold transition-all duration-200 ${
              isTransitioning ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'
            }`}
          >
            {currentStep}/{totalSteps}
          </p>
        </div>
      </header>

      {/* Sticky Toolbar for Step 2 */}
      {currentStep === 2 && richTextEditor && (
        <div className="sticky top-[65px] z-30 bg-card shadow-sm">
          <RichTextToolbar editor={richTextEditor} />
        </div>
      )}

      {/* Content */}
      <main
        className={`flex-1 flex flex-col ${currentStep === 2 ? '' : 'overflow-y-auto'} ${
          currentStep === 2 ? 'pb-16' : 'pb-24'
        } transition-all duration-200 ${isTransitioning ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'}`}
      >
        {/* Step 1: Tytuł */}
        {currentStep === 1 && (
          <div className="p-4 space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title" className="text-base text-foreground">
                  Tytuł ogłoszenia <span className="text-brand">*</span>
                </Label>
                <span className="text-xs text-foreground/40 font-medium">
                  {formData.title.length}/80
                </span>
              </div>
              <Input
                id="title"
                placeholder="np. Szukam hydraulika w Warszawie"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                maxLength={80}
                className="rounded-2xl border border-border h-12 focus:border-brand text-base bg-card"
              />
            </div>
          </div>
        )}

        {/* Step 2: Opis */}
        {currentStep === 2 && (
          <div
            className="flex-1 bg-card overflow-auto cursor-text"
            onClick={() => richTextEditor?.commands.focus()}
          >
            <RichTextEditor
              content={formData.description}
              onChange={(content) => setFormData({ ...formData, description: content })}
              placeholder="Opisz szczegółowo czego szukasz lub co oferujesz..."
              hideToolbar={true}
              onEditorReady={setRichTextEditor}
              noBorder={true}
              className="h-full min-h-full"
            />
          </div>
        )}

        {/* Step 3: Kategoria */}
        {currentStep === 3 && (
          <div className="p-4 space-y-6 animate-in fade-in duration-300">
            {/* Detect Category Button */}
            <Button
              type="button"
              onClick={handleSuggestCategory}
              disabled={suggestingCategory || (!formData.title && !formData.description)}
              className="w-full rounded-full bg-card border border-border hover:border-brand hover:bg-brand/5 text-foreground h-12 text-sm font-semibold transition-colors"
            >
              {suggestingCategory ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wykrywam kategorię...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m10.25 21.25 1-7h-6.5l9-11.5-1 8 6.5.03z" />
                  </svg>
                  Wykryj kategorię
                </>
              )}
            </Button>

            <div className="space-y-2">
              <Label className="text-base text-foreground">Wybierz kategorię <span className="text-brand">*</span></Label>
              <button
                type="button"
                onClick={() => setShowCategorySelector(true)}
                className={`w-full rounded-2xl border transition-all p-4 text-left ${
                  categoryPath.length > 0
                    ? 'border-brand/30 bg-brand/5'
                    : 'border-border bg-card hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${
                      categoryPath.length > 0 ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {categoryPath.length > 0
                        ? categoryPath.map(c => c.name).join(' > ')
                        : 'Wybierz kategorię'
                      }
                    </div>
                  </div>
                  <svg className={`w-5 h-5 flex-shrink-0 ${
                    categoryPath.length > 0 ? 'text-brand' : 'text-muted-foreground'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Zdjęcia */}
        {currentStep === 4 && (
          <div className="p-4 animate-in fade-in duration-300">
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              userId={userId}
              maxImages={6}
              imageRotations={imageRotations}
              onRotationsChange={setImageRotations}
            />
          </div>
        )}

        {/* Step 5: Lokalizacja */}
        {currentStep === 5 && (
          <div className="p-4 space-y-6 animate-in fade-in duration-300">
            {/* Detect Location Button */}
            <Button
              type="button"
              onClick={detectLocation}
              disabled={isDetectingLocation}
              className="w-full rounded-full bg-card border border-border hover:border-brand hover:bg-brand/5 text-foreground h-12 text-sm font-semibold transition-colors"
            >
              {isDetectingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wykrywanie lokalizacji...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Wykryj moją lokalizację
                </>
              )}
            </Button>

            {/* City Input */}
            <div className="space-y-2 relative">
              <Label className="text-base text-foreground">Miasto <span className="text-brand">*</span></Label>
              <div className="relative">
                <Input
                  ref={cityInputRef}
                  type="text"
                  placeholder="Szukaj miasta..."
                  value={formData.city || cityQuery}
                  onChange={(e) => {
                    if (formData.city) {
                      setFormData({ ...formData, city: '' })
                    }
                    handleCityChange(e.target.value)
                    setIsCityDropdownOpen(true)
                  }}
                  onFocus={() => {
                    setIsCityDropdownOpen(true)
                    if (cities.length === 0) {
                      fetchCities('')
                    }
                  }}
                  className="rounded-2xl border border-border h-12 focus:border-brand text-base bg-card pr-10"
                />
                {isLoadingCities && (
                  <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-foreground/40" />
                )}
              </div>

              {/* Cities Dropdown */}
              {isCityDropdownOpen && cities.length > 0 && (
                <div ref={cityDropdownRef} className="absolute z-10 w-full mt-1 bg-card border border-border rounded-2xl shadow-lg max-h-64 overflow-y-auto">
                  {/* Popular Cities */}
                  {cities.some(c => c.popular) && (
                    <div className="p-2">
                      <p className="text-xs font-semibold text-foreground/40 px-3 py-2">POPULARNE</p>
                      {cities.filter(c => c.popular).map((city) => (
                        <button
                          key={city.slug}
                          type="button"
                          onClick={() => handleCitySelect(city.name)}
                          className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg text-sm transition-colors"
                        >
                          <div className="font-medium text-foreground">{city.name}</div>
                          {city.voivodeship && (
                            <div className="text-xs text-muted-foreground">{city.voivodeship}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Cities by Voivodeship */}
                  {Object.entries(
                    cities.filter(c => !c.popular).reduce((acc, city) => {
                      const voivodeship = city.voivodeship || 'Inne'
                      if (!acc[voivodeship]) acc[voivodeship] = []
                      acc[voivodeship].push(city)
                      return acc
                    }, {} as Record<string, City[]>)
                  ).map(([voivodeship, voivodeshipCities]) => (
                    <div key={voivodeship} className="p-2">
                      <p className="text-xs font-semibold text-foreground/40 px-3 py-2">{voivodeship.toUpperCase()}</p>
                      {voivodeshipCities.map((city) => (
                        <button
                          key={city.slug}
                          type="button"
                          onClick={() => handleCitySelect(city.name)}
                          className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg text-sm transition-colors"
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* District Input (Optional) */}
            <div className="space-y-2">
              <Label className="text-base text-foreground">Dzielnica <span className="text-foreground/40 font-normal">(opcjonalnie)</span></Label>
              <Input
                type="text"
                placeholder="np. Śródmieście"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="rounded-2xl border border-border h-12 focus:border-brand text-base bg-card"
              />
            </div>
          </div>
        )}

        {/* Step 6: Cena */}
        {currentStep === 6 && (
          <div className="p-4 space-y-6 animate-in fade-in duration-300">
            {/* Price Type Selection */}
            <div className="space-y-3">
              <Label className="text-base text-foreground">Typ ceny <span className="text-brand">*</span></Label>

              {/* Fixed Price */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, priceType: 'fixed' })}
                className={`w-full flex items-start p-4 rounded-2xl border cursor-pointer transition-all text-left ${
                  formData.priceType === 'fixed'
                    ? 'border-brand bg-brand/5'
                    : 'border-border bg-card hover:border-black/20'
                }`}
              >
                <div className="flex-1">
                  <div className="font-semibold text-foreground">Stała cena</div>
                  <div className="text-sm text-muted-foreground mt-0.5">Podaj konkretną kwotę</div>
                </div>
              </button>

              {/* Hourly Rate */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, priceType: 'hourly' })}
                className={`w-full flex items-start p-4 rounded-2xl border cursor-pointer transition-all text-left ${
                  formData.priceType === 'hourly'
                    ? 'border-brand bg-brand/5'
                    : 'border-border bg-card hover:border-black/20'
                }`}
              >
                <div className="flex-1">
                  <div className="font-semibold text-foreground">Za godzinę</div>
                  <div className="text-sm text-muted-foreground mt-0.5">Stawka godzinowa</div>
                </div>
              </button>

              {/* Free */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, priceType: 'free' })}
                className={`w-full flex items-start p-4 rounded-2xl border cursor-pointer transition-all text-left ${
                  formData.priceType === 'free'
                    ? 'border-brand bg-brand/5'
                    : 'border-border bg-card hover:border-black/20'
                }`}
              >
                <div className="flex-1">
                  <div className="font-semibold text-foreground">Za darmo</div>
                  <div className="text-sm text-muted-foreground mt-0.5">Usługa lub produkt bezpłatny</div>
                </div>
              </button>
            </div>

            {/* Price Input - Show only if not free */}
            {formData.priceType !== 'free' && (
              <div className="space-y-2">
                <Label htmlFor="price" className="text-base text-foreground">
                  Cena {formData.priceType === 'hourly' ? 'za godzinę ' : ''}<span className="text-brand">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={formData.price}
                    onChange={(e) => {
                      const value = e.target.value
                      // Remove all spaces first
                      const cleanValue = value.replace(/\s/g, '')

                      // Allow only numbers, comma and dot
                      if (cleanValue === '' || /^[\d,\.]+$/.test(cleanValue)) {
                        // Split by comma or dot to handle decimal part
                        const parts = cleanValue.split(/[,\.]/)
                        const integerPart = parts[0]
                        const decimalPart = parts[1]

                        // Add spaces every 3 digits from the right in integer part
                        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

                        // Reconstruct with decimal part if exists
                        const formattedValue = decimalPart !== undefined
                          ? `${formattedInteger},${decimalPart}`
                          : formattedInteger

                        setFormData({ ...formData, price: formattedValue })
                      }
                    }}
                    className="rounded-2xl border border-border h-12 focus:border-brand text-base bg-card pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground font-medium">
                    PLN
                  </span>
                </div>
                {formData.priceType === 'hourly' && (
                  <p className="text-xs text-foreground/50">
                    Podaj stawkę za godzinę pracy
                  </p>
                )}

                {/* Negotiable switch */}
                <div
                  className={`w-full flex items-center justify-between gap-3 px-4 h-12 rounded-2xl border transition-all ${
                    formData.priceNegotiable
                      ? 'border-brand bg-brand/5 text-brand'
                      : 'border-border bg-card text-foreground/70'
                  }`}
                >
                  <label htmlFor="priceNegotiable" className="text-sm font-medium cursor-pointer flex-1">
                    Do negocjacji
                  </label>
                  <Switch
                    id="priceNegotiable"
                    checked={formData.priceNegotiable}
                    onCheckedChange={(checked) => setFormData({ ...formData, priceNegotiable: checked })}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 7: Podsumowanie */}
        {currentStep === 7 && (
          <div className="p-4 space-y-4 animate-in fade-in duration-300">
            {/* Info */}
            <div className="bg-brand/5 border border-brand/20 rounded-2xl p-4">
              <p className="text-sm text-foreground/70 text-center">
                Sprawdź dokładnie wszystkie informacje przed opublikowaniem ogłoszenia
              </p>
            </div>

            {/* Title */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h2 className="text-xl font-bold text-foreground mb-1">{formData.title}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span>
                  {getCategoryName(formData.category)}
                  {formData.subcategory && ` → ${getSubcategoryName(formData.subcategory)}`}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Opis</h3>
              </div>
              <div
                className="prose prose-sm max-w-none text-foreground/80"
                dangerouslySetInnerHTML={{ __html: formData.description }}
              />
            </div>

            {/* Images */}
            {images.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Zdjęcia ({images.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {images.map((imageUrl, index) => (
                    <div key={imageUrl} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                      <Image
                        src={imageUrl}
                        alt={`Zdjęcie ${index + 1}`}
                        fill
                        className="object-cover"
                        style={{ transform: `rotate(${imageRotations[imageUrl] || 0}deg)` }}
                      />
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] font-bold py-0.5 text-center">
                          GŁÓWNE
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Lokalizacja</h3>
              </div>
              <p className="text-base text-foreground">
                {formData.city}
                {formData.district && `, ${formData.district}`}
              </p>
            </div>

            {/* Price */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Cena</h3>
              </div>
              <p className="text-xl font-bold text-brand">{getPriceDisplay()}</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer - Fixed at bottom */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border h-16 z-40 rounded-t-3xl shadow-lg flex items-center px-4">
        <div className="flex gap-3 w-full">
          {currentStep === 1 ? (
            <button
              onClick={handleCancel}
              className="flex-1 rounded-full border border-border hover:border-border hover:bg-muted h-11 text-sm font-semibold text-foreground transition-colors"
            >
              Anuluj
            </button>
          ) : (
            <button
              onClick={prevStep}
              className="flex-1 rounded-full border border-border hover:border-border hover:bg-muted h-11 text-sm font-semibold text-foreground transition-colors"
            >
              Wstecz
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
              className="flex-1 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground h-11 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Dalej
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground h-11 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publikowanie...' : 'Opublikuj'}
            </button>
          )}
        </div>
      </footer>

      {/* Hide MobileDock using CSS */}
      <style jsx global>{`
        [data-mobile-dock] {
          display: none !important;
        }
        /* Full height editor for step 2 */
        .ProseMirror {
          height: 100%;
          min-height: 100%;
        }
      `}</style>

      {/* Moderation Modal */}
      {showModerationModal && (
        <div className="fixed inset-0 bg-muted0 flex items-center justify-center z-50 p-4">
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
                  Sprawdzanie ogłoszenia
                </h3>
                <p className="text-muted-foreground">
                  Proszę czekać, weryfikujemy treść...
                </p>
              </div>
            ) : (
              <div className="text-center">
                {moderationResult?.status === 'approved' && (
                  <>
                    <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Ogłoszenie zatwierdzone!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Twoje ogłoszenie zostało pomyślnie opublikowane i jest już widoczne dla innych użytkowników.
                    </p>
                    <Button
                      onClick={() => router.push('/dashboard/my-posts')}
                      className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground h-11"
                    >
                      Zobacz moje ogłoszenia
                    </Button>
                  </>
                )}

                {moderationResult?.status === 'flagged' && (
                  <>
                    <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Wymaga weryfikacji
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Twoje ogłoszenie zostało dodane, ale wymaga weryfikacji przez moderatora przed publikacją.
                    </p>
                    {moderationResult.reasons && moderationResult.reasons.length > 0 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-6 text-left">
                        <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-500 mb-2">Powody:</p>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                          {moderationResult.reasons.map((reason: string, i: number) => (
                            <li key={i}>• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Button
                      onClick={() => router.push('/dashboard/my-posts')}
                      className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground h-11"
                    >
                      Rozumiem
                    </Button>
                  </>
                )}

                {moderationResult?.status === 'rejected' && (
                  <>
                    <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Ogłoszenie odrzucone
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Niestety, Twoje ogłoszenie nie spełnia naszych wytycznych i nie może zostać opublikowane.
                    </p>
                    {moderationResult.reasons && moderationResult.reasons.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-left">
                        <p className="text-sm font-semibold text-red-600 dark:text-red-500 mb-2">Powody odrzucenia:</p>
                        <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                          {moderationResult.reasons.map((reason: string, i: number) => (
                            <li key={i}>• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Button
                      onClick={() => setShowModerationModal(false)}
                      className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground h-11"
                    >
                      Popraw ogłoszenie
                    </Button>
                  </>
                )}

                {moderationResult?.status === 'error' && (
                  <>
                    <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Wystąpił błąd
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {moderationResult.reasons?.[0] || 'Nie udało się opublikować ogłoszenia. Spróbuj ponownie.'}
                    </p>
                    <Button
                      onClick={() => setShowModerationModal(false)}
                      className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground h-11"
                    >
                      Spróbuj ponownie
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Selector Modal */}
      <CategorySelector
        open={showCategorySelector}
        onOpenChange={setShowCategorySelector}
        onSelect={(categoryId, path) => {
          setSelectedCategoryId(categoryId)
          setCategoryPath(path)
          // Also update formData for backward compatibility
          const topLevel = path[0]
          const secondLevel = path[1]
          setFormData({
            ...formData,
            category: topLevel?.slug || '',
            subcategory: secondLevel?.slug || ''
          })
        }}
        selectedCategoryId={selectedCategoryId}
      />
    </div>
  )
}
