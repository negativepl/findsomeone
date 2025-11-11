'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, ChevronsUpDown, Loader2, Tag, FileText, ImageIcon, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/ImageUpload'
import { RichTextEditor } from '@/components/RichTextEditor'
import { RichTextToolbar } from '@/components/RichTextToolbar'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { CategorySelector } from '@/components/CategorySelector'
import { ChevronRight, MapPin } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  parent_id?: string | null
}

export function NewPostClient() {
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [categoryPath, setCategoryPath] = useState<Array<{ id: string; name: string; slug: string }>>([])

  const [showDraftModal, setShowDraftModal] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    district: '',
    price: '',
    priceType: 'fixed' as 'hourly' | 'fixed' | 'free',
    priceNegotiable: false,
  })

  const [images, setImages] = useState<string[]>([])
  const [imageRotations, setImageRotations] = useState<Record<string, number>>({})
  const [userId, setUserId] = useState<string>('')
  const [richTextEditor, setRichTextEditor] = useState<any>(null)

  // AI Category suggestion state
  const [suggestingCategory, setSuggestingCategory] = useState(false)
  const [categorySuggestion, setCategorySuggestion] = useState<{
    categorySlug: string
    subcategorySlug?: string
    thirdLevelSlug?: string
    confidence: number
    reasoning: string
  } | null>(null)
  const [aiSuggestionApplied, setAiSuggestionApplied] = useState(false)

  // Location detection state
  const [detectingLocation, setDetectingLocation] = useState(false)

  // Desktop: Cities from database (for Combobox)
  const [desktopCities, setDesktopCities] = useState<Array<{ id: string; name: string; slug: string; voivodeship: string | null }>>([])
  const [loadingCities, setLoadingCities] = useState(true)
  const [openCityCombobox, setOpenCityCombobox] = useState(false)

  // Mobile: Multi-step form state
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 7
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Mobile: City autocomplete (API-based)
  const [mobileCityQuery, setMobileCityQuery] = useState('')
  const [mobileCities, setMobileCities] = useState<Array<{ name: string; slug: string; voivodeship?: string; popular?: boolean }>>([])
  const [isMobileCityDropdownOpen, setIsMobileCityDropdownOpen] = useState(false)
  const [isLoadingMobileCities, setIsLoadingMobileCities] = useState(false)
  const mobileCityInputRef = useRef<HTMLInputElement>(null)
  const mobileCityDropdownRef = useRef<HTMLDivElement>(null)
  const mobileCityDebounceTimerRef = useRef<NodeJS.Timeout>()

  // Mobile: Subcategories for summary display
  const [subcategories, setSubcategories] = useState<Category[]>([])

  // Check for draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('postDraft')
    if (draft) {
      try {
        const draftData = JSON.parse(draft)
        const draftAge = Date.now() - draftData.timestamp
        // Only show draft if it's less than 7 days old
        if (draftAge < 7 * 24 * 60 * 60 * 1000) {
          setHasDraft(true)
          setShowDraftModal(true)
        } else {
          localStorage.removeItem('postDraft')
        }
      } catch (e) {
        localStorage.removeItem('postDraft')
      }
    }
  }, [])

  // Get user ID on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [supabase])

  // Fetch cities from database
  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, slug, voivodeship')
        .order('name', { ascending: true })

      if (data && !error) {
        setDesktopCities(data)
      }
      setLoadingCities(false)
    }

    fetchCities()
  }, [supabase])

  // Fetch categories (for mobile summary display)
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .order('display_order', { ascending: true })

      if (data && !error) {
        setCategories(data)
      }
    }

    fetchCategories()
  }, [supabase])

  // Fetch subcategories when category changes (for mobile)
  useEffect(() => {
    if (!selectedCategoryId) {
      setSubcategories([])
      return
    }

    const fetchSubcategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .eq('parent_id', selectedCategoryId)
        .order('display_order', { ascending: true })

      if (data && !error) {
        setSubcategories(data)
      }
    }

    fetchSubcategories()
  }, [selectedCategoryId, supabase])

  // Close mobile city dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileCityInputRef.current && !mobileCityInputRef.current.contains(event.target as Node) &&
        mobileCityDropdownRef.current && !mobileCityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMobileCityDropdownOpen(false)
      }
    }

    if (isMobileCityDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileCityDropdownOpen])

  // Auto-save draft to localStorage
  useEffect(() => {
    // Don't save if form is empty
    if (!formData.title && !formData.description && !selectedCategoryId) {
      return
    }

    const draftData = {
      formData,
      selectedCategoryId,
      categoryPath,
      images,
      imageRotations,
      timestamp: Date.now(),
    }

    localStorage.setItem('postDraft', JSON.stringify(draftData))
  }, [formData, selectedCategoryId, categoryPath, images, imageRotations])

  const loadDraft = () => {
    const draft = localStorage.getItem('postDraft')
    if (draft) {
      try {
        const draftData = JSON.parse(draft)
        setFormData(draftData.formData)
        setImages(draftData.images || [])
        setImageRotations(draftData.imageRotations || {})
        setShowDraftModal(false)
      } catch (e) {
        console.error('Error loading draft:', e)
        setShowDraftModal(false)
      }
    }
  }

  // Mobile city autocomplete functions
  const fetchCities = useCallback(async (query: string) => {
    try {
      setIsLoadingMobileCities(true)
      const response = await fetch(`/api/cities?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setMobileCities(data.cities || [])
    } catch (error) {
      console.error('Cities fetch error:', error)
      setMobileCities([])
    } finally {
      setIsLoadingMobileCities(false)
    }
  }, [])

  const handleCityChange = (value: string) => {
    setMobileCityQuery(value)

    if (mobileCityDebounceTimerRef.current) {
      clearTimeout(mobileCityDebounceTimerRef.current)
    }

    mobileCityDebounceTimerRef.current = setTimeout(() => {
      fetchCities(value)
    }, 200)
  }

  const handleCitySelect = (cityName: string) => {
    setFormData({ ...formData, city: cityName })
    setMobileCityQuery('')
    setIsMobileCityDropdownOpen(false)
  }

  // Mobile helper functions
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

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || ''
  }

  const getSubcategoryName = (subcategoryId: string): string => {
    const subcat = subcategories.find(sub => sub.id === subcategoryId)
    return subcat?.name || ''
  }

  const getPriceDisplay = (): string => {
    if (formData.priceType === 'free') return 'Za darmo'
    const basePrice = formData.priceType === 'hourly' ? `${formData.price} PLN/godz.` : `${formData.price} PLN`
    return formData.priceNegotiable ? `${basePrice} (do negocjacji)` : basePrice
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.title.trim()
      case 2:
        return formData.description.trim().length > 0
      case 3:
        return selectedCategoryId !== ''
      case 4:
        return images.length > 0
      case 5:
        return formData.city.trim().length > 0
      case 6:
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

  // Detect location for mobile
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Twoja przeglądarka nie obsługuje wykrywania lokalizacji')
      return
    }

    setDetectingLocation(true)

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
          setDetectingLocation(false)
        }
      },
      (error) => {
        console.warn('Geolokalizacja niedostępna:', error.code, error.message)
        setDetectingLocation(false)

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

  const discardDraft = () => {
    localStorage.removeItem('postDraft')
    setShowDraftModal(false)
  }

  const clearDraft = () => {
    localStorage.removeItem('postDraft')
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
        const fileExt = 'jpg'
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${userId}/temp/${fileName}`

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

  // AI-powered category suggestion
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

  const handleSuggestCategory = async () => {
    if (!formData.title && !formData.description) {
      toast.error('Brak danych', {
        description: 'Wpisz tytuł lub opis, aby wykryć kategorię'
      })
      return
    }

    setSuggestingCategory(true)
    setCategorySuggestion(null)

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
        setCategorySuggestion(data.suggestion)
        setAiSuggestionApplied(true)

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
            let currentCat = targetCategory

            while (currentCat) {
              path.unshift({ id: currentCat.id, name: currentCat.name, slug: currentCat.slug })
              currentCat = (currentCat.parent_id
                ? allCats.find(cat => cat.id === currentCat.parent_id)
                : null) || null
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

    // Validate category is selected
    if (!selectedCategoryId) {
      toast.error('Musisz wybrać kategorię')
      return
    }

    setLoading(true)
    setError(null)
    setShowModerationModal(true)
    setModerationInProgress(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Musisz być zalogowany aby dodać ogłoszenie')
      }

      // Process rotated images before creating post
      const processedImages = await processRotatedImages(images, imageRotations)

      const { data: newPost, error: insertError } = await supabase.from('posts').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category_id: selectedCategoryId || null, // Use null if empty string
        city: formData.city,
        district: formData.district || null,
        price: formData.price ? parseFloat(formData.price) : null,
        price_type: formData.priceType,
        price_negotiable: formData.priceNegotiable,
        images: processedImages.length > 0 ? processedImages : null,
        status: 'pending',
        moderation_status: 'checking',
      }).select().single()

      if (insertError) throw insertError

      // Generate and update embedding (don't block on errors)
      if (newPost) {
        try {
          // Get category name for embedding
          const { data: categoryData } = await supabase
            .from('categories')
            .select('name')
            .eq('id', selectedCategoryId)
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
            if (embedding && Array.isArray(embedding)) {
              // Format as PostgreSQL vector string
              const embeddingString = `[${embedding.join(',')}]`

              const { error: embeddingError } = await supabase
                .from('posts')
                .update({
                  embedding: embeddingString,
                  embedding_model: 'text-embedding-3-small',
                  embedding_updated_at: new Date().toISOString()
                })
                .eq('id', newPost.id)

              if (embeddingError) {
                console.error('Failed to update embedding:', embeddingError)
              }
            }
          }
        } catch (embeddingError) {
          console.error('Failed to generate embedding:', embeddingError)
          // Continue with post creation even if embedding fails
        }
      }

      // Trigger moderation and wait for result
      if (newPost) {
        const moderationResponse = await fetch('/api/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: newPost.id }),
        })

        const moderationData = await moderationResponse.json()
        setModerationResult(moderationData)
        setModerationInProgress(false)

        // Wait 2 seconds to show result
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // Clear draft after successful submission
      clearDraft()

      router.push('/dashboard/my-posts')
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił błąd'
      setError(errorMessage)
      setLoading(false)
      setShowModerationModal(false)
      toast.error(errorMessage)
    }
  }

  return (
    <>
      <main className="hidden md:block container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-24 md:pb-8">
        {/* Draft Recovery Modal */}
        <Dialog open={showDraftModal} onOpenChange={setShowDraftModal}>
          <DialogContent className="p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-4 md:p-6">
              <DialogTitle>Niedokończone ogłoszenie</DialogTitle>
              <DialogDescription>
                Znaleziono rozpoczęte wcześniej ogłoszenie. Możesz kontynuować jego tworzenie lub zacząć od początku.
              </DialogDescription>
            </DialogHeader>

            <div className="px-4 md:px-6">
              <div className="border-t border-border" />
            </div>

            <DialogFooter className="gap-3 p-4 md:p-6">
              <Button
                onClick={discardDraft}
                variant="outline"
                className="rounded-full border border-border hover:bg-muted bg-card text-foreground"
              >
                Zacznij od początku
              </Button>
              <Button
                onClick={loadDraft}
                className="rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0"
              >
                Kontynuuj tworzenie
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Page Header - Above Card */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">Dodaj nowe ogłoszenie</h1>
          </div>
          <p className="text-base md:text-lg text-muted-foreground">
            Opisz swoje ogłoszenie i znajdź odpowiednich klientów lub specjalistów
          </p>
        </div>

      {/* Card wrapper */}
      <Card className="border border-border rounded-2xl md:rounded-3xl bg-card">
        <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* All fields visible */}
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="title" className="text-base font-semibold text-foreground">
                    Tytuł ogłoszenia <span className="text-brand">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Pomoc: Jak pisać dobry tytuł?">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="font-semibold mb-1">Jak pisać dobry tytuł?</p>
                      <ul className="space-y-0.5 text-xs">
                        <li>• Bądź konkretny i zwięzły</li>
                        <li>• Dodaj lokalizację jeśli istotna</li>
                        <li>• Unikaj capslocka i spamu</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </div>
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

              {/* Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold text-foreground">
                    Opis <span className="text-brand">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Pomoc: Jak napisać dobry opis?">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="font-semibold mb-1">Jak napisać dobry opis?</p>
                      <ul className="space-y-0.5 text-xs">
                        <li>• Opisz szczegółowo czego szukasz/co oferujesz</li>
                        <li>• Dodaj istotne detale i wymagania</li>
                        <li>• Bądź uczciwy i konkretny</li>
                        <li>• Unikaj danych kontaktowych (używaj wiadomości)</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="min-h-[300px]">
                  <RichTextEditor
                    content={formData.description}
                    onChange={(content) => setFormData({ ...formData, description: content })}
                    placeholder="Opisz szczegółowo swoje ogłoszenie: zakres usług lub potrzeb, termin, wymagania..."
                    className="h-full"
                  />
                </div>
              </div>

              {/* Category Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-foreground">Kategoria <span className="text-brand">*</span></Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSuggestCategory}
                    disabled={suggestingCategory || (!formData.title && !formData.description)}
                    className="rounded-full border border-border hover:bg-muted h-10 px-4 text-sm bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestingCategory ? (
                      <>
                        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Wykrywam...
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
                </div>

                <button
                  type="button"
                  onClick={() => setShowCategorySelector(true)}
                  className={`w-full rounded-2xl border transition-all p-4 text-left group ${
                    categoryPath.length > 0
                      ? 'border-brand/30 bg-brand/5 hover:border-brand/50'
                      : 'border-border hover:border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      categoryPath.length > 0 ? 'bg-brand/10' : 'bg-black/5 group-hover:bg-black/10'
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

              {/* Images */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold text-foreground">
                    Zdjęcia <span className="text-brand">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Pomoc: Dlaczego zdjęcia są wymagane?">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="font-semibold mb-1">Dlaczego zdjęcia są wymagane?</p>
                      <ul className="space-y-0.5 text-xs">
                        <li>• Ogłoszenia ze zdjęciami otrzymują 5x więcej odpowiedzi</li>
                        <li>• Pierwsze zdjęcie będzie miniaturką ogłoszenia</li>
                        <li>• Możesz dodać maksymalnie 6 zdjęć</li>
                        <li>• Przeciągnij zdjęcia aby zmienić kolejność</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  userId={userId}
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
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="rounded-full border border-border hover:bg-muted h-10 px-4 text-sm bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
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
                          className="w-full justify-between rounded-2xl border border-border h-12 hover:border-border hover:bg-muted font-normal"
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
                              {desktopCities.map((city) => (
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
            </div>

            {/* Footer buttons */}
            <div className="mt-8 pt-6 border-t-2 border-border">
              <div className="flex flex-row gap-3 justify-end">
                <Link href="/dashboard">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border border-border hover:bg-muted bg-card text-foreground h-11 px-6 text-sm"
                  >
                    Anuluj
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-11 px-8 text-sm font-semibold"
                >
                  {loading ? 'Dodawanie...' : 'Opublikuj ogłoszenie'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>

    {/* Mobile UI */}
    <div className="md:hidden">
      <div className={`min-h-screen max-h-screen flex flex-col overflow-hidden ${currentStep === 2 ? 'bg-card' : 'bg-background'}`}>
        {/* Progress bar */}
        <div className="fixed left-0 right-0 h-1 bg-muted z-50" style={{ top: 'env(safe-area-inset-top)' }}>
          <div
            className="h-full bg-brand transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Header */}
        <header className="fixed left-0 right-0 bg-card border-b border-border z-40 shadow-sm rounded-b-3xl" style={{ top: 'calc(1px + env(safe-area-inset-top))' }}>
          <div className="flex items-center justify-between h-16 px-4">
            <h1
              className={`text-xl font-bold text-foreground transition-all duration-200 ${
                isTransitioning ? 'opacity-0 blur-sm scale-95' : 'opacity-100 blur-0 scale-100'
              }`}
            >
              {getStepTitle(currentStep)}
            </h1>
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
          <div className="fixed left-0 right-0 z-30 bg-card shadow-sm" style={{ top: 'calc(65px + env(safe-area-inset-top))' }}>
            <RichTextToolbar editor={richTextEditor} />
          </div>
        )}

        {/* Content */}
        <main
          className={`flex-1 flex flex-col overflow-y-auto ${
            currentStep === 2 ? 'pb-24' : 'pb-32'
          } transition-all duration-200 ${isTransitioning ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'}`}
        >
          {/* Step 1: Tytuł */}
          {currentStep === 1 && (
            <div className="p-4 space-y-6 animate-in fade-in duration-300" style={{ marginTop: 'calc(69px + env(safe-area-inset-top))' }}>
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
              style={{ paddingTop: 'calc(120px + env(safe-area-inset-top))' }}
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
            <div className="p-4 space-y-6 animate-in fade-in duration-300" style={{ marginTop: 'calc(69px + env(safe-area-inset-top))' }}>
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
            <div className="p-4 animate-in fade-in duration-300" style={{ marginTop: 'calc(69px + env(safe-area-inset-top))' }}>
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
            <div className="p-4 space-y-6 animate-in fade-in duration-300" style={{ marginTop: 'calc(69px + env(safe-area-inset-top))' }}>
              <Button
                type="button"
                onClick={detectLocation}
                disabled={detectingLocation}
                className="w-full rounded-full bg-card border border-border hover:border-brand hover:bg-brand/5 text-foreground h-12 text-sm font-semibold transition-colors"
              >
                {detectingLocation ? (
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

              <div className="space-y-2 relative">
                <Label className="text-base text-foreground">Miasto <span className="text-brand">*</span></Label>
                <div className="relative">
                  <Input
                    ref={mobileCityInputRef}
                    type="text"
                    placeholder="Szukaj miasta..."
                    value={formData.city || mobileCityQuery}
                    onChange={(e) => {
                      if (formData.city) {
                        setFormData({ ...formData, city: '' })
                      }
                      handleCityChange(e.target.value)
                      setIsMobileCityDropdownOpen(true)
                    }}
                    onFocus={() => {
                      setIsMobileCityDropdownOpen(true)
                      if (mobileCities.length === 0) {
                        fetchCities('')
                      }
                    }}
                    className="rounded-2xl border border-border h-12 focus:border-brand text-base bg-card pr-10"
                  />
                  {isLoadingMobileCities && (
                    <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-foreground/40" />
                  )}
                </div>

                {isMobileCityDropdownOpen && mobileCities.length > 0 && (
                  <div ref={mobileCityDropdownRef} className="absolute z-10 w-full mt-1 bg-card border border-border rounded-2xl shadow-lg max-h-64 overflow-y-auto">
                    {mobileCities.some(c => c.popular) && (
                      <div className="p-2">
                        <p className="text-xs font-semibold text-foreground/40 px-3 py-2">POPULARNE</p>
                        {mobileCities.filter(c => c.popular).map((city) => (
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

                    {Object.entries(
                      mobileCities.filter(c => !c.popular).reduce((acc, city) => {
                        const voivodeship = city.voivodeship || 'Inne'
                        if (!acc[voivodeship]) acc[voivodeship] = []
                        acc[voivodeship].push(city)
                        return acc
                      }, {} as Record<string, typeof mobileCities>)
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
            <div className="p-4 space-y-6 animate-in fade-in duration-300" style={{ marginTop: 'calc(69px + env(safe-area-inset-top))' }}>
              <div className="space-y-3">
                <Label className="text-base text-foreground">Typ ceny <span className="text-brand">*</span></Label>

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
                        const cleanValue = value.replace(/\s/g, '')

                        if (cleanValue === '' || /^[\d,\.]+$/.test(cleanValue)) {
                          const parts = cleanValue.split(/[,\.]/)
                          const integerPart = parts[0]
                          const decimalPart = parts[1]

                          const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

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
            <div className="p-4 space-y-4 animate-in fade-in duration-300" style={{ marginTop: 'calc(69px + env(safe-area-inset-top))' }}>
              <div className="bg-brand/5 border border-brand/20 rounded-2xl p-4">
                <p className="text-sm text-foreground/70 text-center">
                  Sprawdź dokładnie wszystkie informacje przed opublikowaniem ogłoszenia
                </p>
              </div>

              <div className="bg-card rounded-2xl border border-border p-4">
                <h2 className="text-xl font-bold text-foreground mb-1">{formData.title}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="w-4 h-4" />
                  <span>
                    {categoryPath.map(c => c.name).join(' → ')}
                  </span>
                </div>
              </div>

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

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 rounded-t-3xl shadow-lg pb-safe">
          <div className="flex gap-3 w-full px-4 py-4">
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
                disabled={loading}
                className="flex-1 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground h-11 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Publikowanie...' : 'Opublikuj'}
              </button>
            )}
          </div>
        </footer>

        {/* Hide MobileDock using CSS */}
        <style jsx global>{`
          [data-mobile-dock] {
            display: none !important;
          }
          .ProseMirror {
            height: 100%;
            min-height: 100%;
          }
        `}</style>
      </div>
    </div>

    {/* Category Selector Modal - Shared between mobile and desktop */}
    <CategorySelector
      open={showCategorySelector}
      onOpenChange={setShowCategorySelector}
      onSelect={(categoryId, path) => {
        setSelectedCategoryId(categoryId)
        setCategoryPath(path)
      }}
      selectedCategoryId={selectedCategoryId}
    />

    {/* Moderation Modal - Shared between mobile and desktop */}
    {showModerationModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
            <>
              {moderationResult?.status === 'approved' ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Ogłoszenie zatwierdzone!
                  </h3>
                  <p className="text-muted-foreground">
                    Twoje ogłoszenie jest aktywne i widoczne dla wszystkich użytkowników.
                  </p>
                </div>
              ) : moderationResult?.status === 'flagged' ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Wymaga weryfikacji
                  </h3>
                  <p className="text-muted-foreground">
                    Twoje ogłoszenie zostanie sprawdzone przez moderatora w ciągu 24 godzin.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Ogłoszenie odrzucone
                  </h3>
                  <p className="text-muted-foreground">
                    Twoje ogłoszenie nie spełnia naszych wymagań. Sprawdź, czy treść jest zgodna z regulaminem.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )}
    </>
  )
}

