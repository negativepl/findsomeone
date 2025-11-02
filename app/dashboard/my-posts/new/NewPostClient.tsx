'use client'

import { useState, useEffect, createContext, useContext } from 'react'
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
import { RichTextToolbar } from '@/components/RichTextToolbar'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
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

interface StepContextType {
  currentStep: number
  totalSteps: number
  stepTitle: string
}

const StepContext = createContext<StepContextType | null>(null)

export const useStepContext = () => useContext(StepContext)

interface NewPostClientProps {
  onStepChange?: (step: number) => void
}

export function NewPostClient({ onStepChange }: NewPostClientProps = {}) {
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

  // Mobile multi-step state
  const [currentStep, setCurrentStepInternal] = useState(1)
  const totalSteps = 6

  const setCurrentStep = (step: number) => {
    setCurrentStepInternal(step)
    onStepChange?.(step)
  }

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

  // Cities from database
  const [cities, setCities] = useState<Array<{ id: string; name: string; slug: string; voivodeship: string | null }>>([])
  const [loadingCities, setLoadingCities] = useState(true)
  const [openCityCombobox, setOpenCityCombobox] = useState(false)

  // Hide/show dock on scroll
  const [isDockVisible, setIsDockVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold
        setIsDockVisible(false)
      } else {
        // Scrolling up
        setIsDockVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Listen for menu and categories open/close events
  useEffect(() => {
    const handleMenuOpen = () => setIsMenuOpen(true)
    const handleMenuClose = () => setIsMenuOpen(false)
    const handleCategoriesOpen = () => setIsMenuOpen(true)
    const handleCategoriesClose = () => setIsMenuOpen(false)

    window.addEventListener('mobileDockMenuOpen', handleMenuOpen)
    window.addEventListener('mobileDockMenuClose', handleMenuClose)
    window.addEventListener('mobileDockCategoriesOpen', handleCategoriesOpen)
    window.addEventListener('mobileDockCategoriesClose', handleCategoriesClose)

    return () => {
      window.removeEventListener('mobileDockMenuOpen', handleMenuOpen)
      window.removeEventListener('mobileDockMenuClose', handleMenuClose)
      window.removeEventListener('mobileDockCategoriesOpen', handleCategoriesOpen)
      window.removeEventListener('mobileDockCategoriesClose', handleCategoriesClose)
    }
  }, [])

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
        setCities(data)
      }
      setLoadingCities(false)
    }

    fetchCities()
  }, [supabase])

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
      currentStep,
      timestamp: Date.now(),
    }

    localStorage.setItem('postDraft', JSON.stringify(draftData))
  }, [formData, selectedCategoryId, categoryPath, images, imageRotations, currentStep])

  // Validation for each step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: // Podstawowe info
        return !!(selectedCategoryId && formData.title.trim())
      case 2: // Szczegóły
        return formData.description.trim().length > 0
      case 3: // Zdjęcia (wymagane)
        return images.length > 0
      case 4: // Lokalizacja
        return !!formData.city.trim()
      case 5: // Budżet (opcjonalny, zawsze valid)
        return true
      case 6: // Podsumowanie (przed submit)
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1: return 'Podstawowe informacje'
      case 2: return 'Opis ogłoszenia'
      case 3: return 'Zdjęcia'
      case 4: return 'Lokalizacja'
      case 5: return 'Budżet'
      case 6: return 'Podsumowanie'
      default: return ''
    }
  }

  const loadDraft = () => {
    const draft = localStorage.getItem('postDraft')
    if (draft) {
      try {
        const draftData = JSON.parse(draft)
        setFormData(draftData.formData)
        setImages(draftData.images || [])
        setImageRotations(draftData.imageRotations || {})
        setCurrentStep(draftData.currentStep || 1)
        setShowDraftModal(false)
      } catch (e) {
        console.error('Error loading draft:', e)
        setShowDraftModal(false)
      }
    }
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
        category_id: selectedCategoryId, // Use the selected category ID from modal
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
      setError(err instanceof Error ? err.message : 'Wystąpił błąd')
      setLoading(false)
      setShowModerationModal(false)
    }
  }

  return (
      <main className="md:container md:mx-auto md:px-6 h-full md:h-auto md:pt-24 md:pb-8 flex flex-col md:block">
        {/* Draft Recovery Modal */}
        {showDraftModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg border p-6 shadow-lg max-w-md w-full">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-black mb-2">Niedokończone ogłoszenie</h2>
                <p className="text-sm text-black/60">
                  Znaleziono rozpoczęte wcześniej ogłoszenie. Możesz kontynuować jego tworzenie lub zacząć od początku.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <button
                  onClick={discardDraft}
                  className="rounded-md border-2 border-black/10 hover:border-black/30 hover:bg-black/5 h-10 px-4 text-sm font-medium transition-colors"
                >
                  Zacznij od początku
                </button>
                <button
                  onClick={loadDraft}
                  className="rounded-md bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-10 px-4 text-sm font-semibold transition-colors"
                >
                  Kontynuuj tworzenie
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Header - Above Card - Hidden on mobile */}
        <div className="mb-8 hidden md:block">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-4xl font-bold text-black">Dodaj nowe ogłoszenie</h1>
          </div>
          <p className="text-lg text-black/60">
            Opisz swoje ogłoszenie i znajdź odpowiednich klientów lub specjalistów
          </p>
        </div>

      {/* Desktop: Card wrapper */}
      <Card className="hidden md:block border-0 rounded-3xl bg-white">
        <CardContent className="pt-6 px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Desktop: All fields visible */}
            <div className="hidden md:block space-y-6">
              {/* Title */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="title" className="text-base font-semibold text-black">
                    Tytuł ogłoszenia <span className="text-[#C44E35]">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-black/40 hover:text-black/60 transition-colors" aria-label="Pomoc: Jak pisać dobry tytuł?">
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
                    className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30 pr-16 text-sm md:text-base placeholder:text-xs md:placeholder:text-sm"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs md:text-sm text-gray-500 font-medium">
                    {formData.title.length}/80
                  </span>
                </div>
              </div>

              {/* Category Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-black">Kategoria <span className="text-[#C44E35]">*</span></Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSuggestCategory}
                    disabled={suggestingCategory || (!formData.title && !formData.description)}
                    className="rounded-full border-2 border-[#C44E35]/20 hover:border-[#C44E35] hover:bg-[#C44E35]/5 hover:text-[#C44E35] h-8 px-3 text-xs font-semibold text-[#C44E35] disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className={`w-full rounded-2xl border-2 transition-all p-4 text-left group ${
                    categoryPath.length > 0
                      ? 'border-[#C44E35]/30 bg-[#C44E35]/5 hover:border-[#C44E35]/50'
                      : 'border-black/10 hover:border-black/30 hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      categoryPath.length > 0 ? 'bg-[#C44E35]/10' : 'bg-black/5 group-hover:bg-black/10'
                    }`}>
                      <svg className={`w-6 h-6 transition-colors ${
                        categoryPath.length > 0 ? 'text-[#C44E35]' : 'text-black/40 group-hover:text-black/60'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-black/60 mb-1">Kategoria</div>
                      <div className={`font-medium truncate ${
                        categoryPath.length > 0 ? 'text-black' : 'text-black/40'
                      }`}>
                        {categoryPath.length > 0
                          ? categoryPath.map(c => c.name).join(' > ')
                          : 'Wybierz kategorię'
                        }
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      categoryPath.length > 0 ? 'text-[#C44E35]' : 'text-black/40 group-hover:text-black/60'
                    }`} />
                  </div>
                </button>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold text-black">
                    Opis <span className="text-[#C44E35]">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-black/40 hover:text-black/60 transition-colors" aria-label="Pomoc: Jak napisać dobry opis?">
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

              {/* Images */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold text-black">
                    Zdjęcia <span className="text-[#C44E35]">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-black/40 hover:text-black/60 transition-colors" aria-label="Pomoc: Dlaczego zdjęcia są wymagane?">
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
                  <Label className="text-base font-semibold text-black">
                    Lokalizacja <span className="text-[#C44E35]">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="rounded-full border-2 border-[#C44E35]/20 hover:border-[#C44E35] hover:bg-[#C44E35]/5 hover:text-[#C44E35] h-8 px-3 text-xs font-semibold text-[#C44E35] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MapPin className="w-3.5 h-3.5 mr-1.5" />
                    {detectingLocation ? 'Wykrywam...' : 'Wykryj lokalizację'}
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-sm text-black/60">
                      Miasto <span className="text-[#C44E35]">*</span>
                    </Label>
                    <Popover open={openCityCombobox} onOpenChange={setOpenCityCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCityCombobox}
                          className="w-full justify-between rounded-2xl border-2 border-black/10 h-12 hover:border-black/30 hover:bg-black/5 font-normal"
                        >
                          {formData.city || "Wybierz miasto"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[500px] p-0 rounded-2xl border-2 border-black/10" align="start">
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
                                      <span className="text-xs text-black/40 ml-2">{city.voivodeship}</span>
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
                    <Label htmlFor="district" className="text-sm text-black/60">
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
              </div>

              {/* Price */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="space-y-3 w-full md:w-48">
                  <Label className="text-base font-semibold text-black">Typ ceny <span className="text-[#C44E35]">*</span></Label>
                  <Select
                    value={formData.priceType}
                    onValueChange={(value: 'hourly' | 'fixed' | 'free') =>
                      setFormData({ ...formData, priceType: value })
                    }
                    required
                  >
                    <SelectTrigger className="rounded-2xl border-2 border-black/10 !h-12 w-full" aria-label="Typ ceny">
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
                  <Label htmlFor="price" className="text-base font-semibold text-black">
                    Cena (zł) {formData.priceType !== 'free' && <span className="text-[#C44E35]">*</span>}
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
                      className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30 disabled:opacity-50 disabled:cursor-not-allowed w-32"
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
                        <label htmlFor="priceNegotiable" className="text-sm text-black/70 cursor-pointer select-none whitespace-nowrap">
                          Cena do negocjacji
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop footer */}
            <div className="hidden md:block mt-8 pt-6 border-t-2 border-black/5">
              <div className="flex flex-row gap-3 justify-end">
                <Link href="/dashboard">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 h-11 px-6 text-sm"
                  >
                    Anuluj
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-11 px-8 text-sm font-semibold"
                >
                  {loading ? 'Dodawanie...' : 'Opublikuj ogłoszenie'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Mobile: Form without Card wrapper */}
      <form onSubmit={handleSubmit} className="md:hidden flex-1 flex flex-col overflow-hidden bg-white">
        {/* Sticky Toolbar for Step 2 */}
        {currentStep === 2 && (
          <div className="sticky top-[124px] z-20 flex-shrink-0">
            <RichTextToolbar editor={richTextEditor} />
          </div>
        )}

        {/* Mobile: Step-by-step */}
        <div className="flex-1 flex flex-col overflow-hidden">
              {/* Step 1: Podstawowe informacje */}
              {currentStep === 1 && (
                <div className="space-y-3 animate-in fade-in duration-300 px-3 pt-6 pb-4 bg-white">
                  <div className="space-y-2">
                    <Label htmlFor="title-mobile" className="text-base font-semibold text-black">
                      Tytuł ogłoszenia <span className="text-[#C44E35]">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="title-mobile"
                        placeholder="np. Hydraulik Warszawa - naprawa kranów"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({ ...formData, title: e.target.value })
                          if (aiSuggestionApplied) {
                            setAiSuggestionApplied(false)
                            setCategorySuggestion(null)
                          }
                        }}
                        required
                        maxLength={80}
                        className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30 pr-14 text-base"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                        {formData.title.length}/80
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-black">Kategoria <span className="text-[#C44E35]">*</span></Label>
                    <button
                      type="button"
                      onClick={() => setShowCategorySelector(true)}
                      className={`w-full rounded-2xl border-2 transition-all p-4 text-left active:scale-98 ${
                        categoryPath.length > 0
                          ? 'border-[#C44E35]/30 bg-[#C44E35]/5'
                          : 'border-black/10 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                          categoryPath.length > 0 ? 'bg-[#C44E35]/10' : 'bg-black/5'
                        }`}>
                          <svg className={`w-6 h-6 transition-colors ${
                            categoryPath.length > 0 ? 'text-[#C44E35]' : 'text-black/40'
                          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-black/60 mb-0.5">Kategoria</div>
                          <div className={`font-medium text-base truncate ${
                            categoryPath.length > 0 ? 'text-black' : 'text-black/40'
                          }`}>
                            {categoryPath.length > 0
                              ? categoryPath.map(c => c.name).join(' > ')
                              : 'Wybierz kategorię'
                            }
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-colors ${
                          categoryPath.length > 0 ? 'text-[#C44E35]' : 'text-black/40'
                        }`} />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Opis */}
              {currentStep === 2 && (
                <div className="animate-in fade-in duration-300 flex flex-col flex-1 overflow-y-auto">
                  {/* Editor Content */}
                  <RichTextEditor
                    content={formData.description}
                    onChange={(content) => setFormData({ ...formData, description: content })}
                    placeholder="Opisz szczegółowo swoje ogłoszenie..."
                    hideToolbar={true}
                    onEditorReady={setRichTextEditor}
                    noBorder={true}
                    className="h-full flex flex-col"
                  />
                </div>
              )}

              {/* Step 3: Zdjęcia */}
              {currentStep === 3 && (
                <div className="animate-in fade-in duration-300 px-3 pt-6 pb-4 overflow-y-auto bg-white flex flex-col">
                  <div className="space-y-2 mb-4">
                    <Label className="text-base font-semibold text-black">
                      Zdjęcia <span className="text-[#C44E35]">*</span>
                    </Label>
                    <p className="text-sm text-black/60">
                      Ogłoszenia ze zdjęciami otrzymują 5x więcej odpowiedzi. Pierwsze zdjęcie będzie miniaturką.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <ImageUpload
                      images={images}
                      onImagesChange={setImages}
                      userId={userId}
                      maxImages={6}
                      imageRotations={imageRotations}
                      onRotationsChange={setImageRotations}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Lokalizacja */}
              {currentStep === 4 && (
                <div className="space-y-3 animate-in fade-in duration-300 px-3 pt-6 pb-4 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-base font-semibold text-black">
                      Lokalizacja <span className="text-[#C44E35]">*</span>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDetectLocation}
                      disabled={detectingLocation}
                      className="rounded-full border-2 border-[#C44E35]/20 hover:border-[#C44E35] hover:bg-[#C44E35]/5 hover:text-[#C44E35] h-8 px-3 text-xs font-semibold text-[#C44E35] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MapPin className="w-3.5 h-3.5 mr-1.5" />
                      {detectingLocation ? 'Wykrywam...' : 'Wykryj'}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-black/60">
                      Miasto <span className="text-[#C44E35]">*</span>
                    </Label>
                    <Popover open={openCityCombobox} onOpenChange={setOpenCityCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCityCombobox}
                          className="w-full justify-between rounded-2xl border-2 border-black/10 h-12 hover:border-black/30 hover:bg-black/5 font-normal text-base bg-white"
                        >
                          {formData.city || "Wybierz miasto"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[calc(100vw-2rem)] p-0 rounded-2xl border-2 border-black/10" align="start">
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
                                      <span className="text-xs text-black/40 ml-2">{city.voivodeship}</span>
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

                  <div className="space-y-2">
                    <Label htmlFor="district-mobile" className="text-sm text-black/60">
                      Dzielnica <span className="text-gray-600 font-normal">(opcjonalnie)</span>
                    </Label>
                    <Input
                      id="district-mobile"
                      placeholder="np. Śródmieście"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30 text-base bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Budżet */}
              {currentStep === 5 && (
                <div className="space-y-3 animate-in fade-in duration-300 px-3 pt-6 pb-4 overflow-y-auto">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-black">Typ ceny <span className="text-[#C44E35]">*</span></Label>
                    <Select
                      value={formData.priceType}
                      onValueChange={(value: 'hourly' | 'fixed' | 'free') =>
                        setFormData({ ...formData, priceType: value })
                      }
                      required
                    >
                      <SelectTrigger className="rounded-2xl border-2 border-black/10 !h-12 w-full text-base bg-white" aria-label="Typ ceny">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Stała cena</SelectItem>
                        <SelectItem value="hourly">Za godzinę</SelectItem>
                        <SelectItem value="free">Za darmo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.priceType !== 'free' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="price-mobile" className="text-base font-semibold text-black">
                          Cena (zł) <span className="text-[#C44E35]">*</span>
                        </Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id="price-mobile"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                            className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30 text-base bg-white"
                          />

                          {/* Negotiable switch */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Switch
                              id="priceNegotiable-mobile"
                              checked={formData.priceNegotiable}
                              onCheckedChange={(checked) => setFormData({ ...formData, priceNegotiable: checked })}
                              aria-label="Cena do negocjacji"
                            />
                            <label htmlFor="priceNegotiable-mobile" className="text-sm text-black/70 cursor-pointer select-none whitespace-nowrap">
                              Cena do negocjacji
                            </label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 6: Podsumowanie */}
              {currentStep === 6 && (
                <div className="space-y-4 animate-in fade-in duration-300 px-3 pt-6 pb-4 overflow-y-auto">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-black mb-1">Sprawdź swoje ogłoszenie</h3>
                    <p className="text-sm text-black/60">Upewnij się, że wszystko jest poprawne</p>
                  </div>

                  {/* Main content card */}
                  <div className="bg-white border-2 border-black/10 rounded-2xl p-4 space-y-4">
                    {/* Title - prominent with edit button */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="text-lg font-bold text-black flex-1">{formData.title}</h4>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-xs font-semibold text-[#C44E35] hover:text-[#B33D2A] transition-colors flex-shrink-0"
                        >
                          Edytuj
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black/60">
                        <span>{categories.find(c => c.slug === formData.category)?.name || formData.category}</span>
                      </div>
                    </div>

                    {/* Description with edit */}
                    <div className="border-t border-black/10 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-black/60">OPIS</p>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-xs font-semibold text-[#C44E35] hover:text-[#B33D2A] transition-colors"
                        >
                          Edytuj
                        </button>
                      </div>
                      <div
                        className="text-sm text-black/80 prose prose-sm max-w-none line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: formData.description }}
                      />
                    </div>

                    {/* Images if present */}
                    <div className="border-t border-black/10 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-black/60">ZDJĘCIA</p>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="text-xs font-semibold text-[#C44E35] hover:text-[#B33D2A] transition-colors"
                        >
                          {images.length > 0 ? 'Edytuj' : 'Dodaj'}
                        </button>
                      </div>
                      {images.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium text-black">{images.length} {images.length === 1 ? 'zdjęcie' : 'zdjęcia'}</span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Brak zdjęć</p>
                      )}
                    </div>

                    {/* Location */}
                    <div className="border-t border-black/10 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-black/60">LOKALIZACJA</p>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(4)}
                          className="text-xs font-semibold text-[#C44E35] hover:text-[#B33D2A] transition-colors"
                        >
                          Edytuj
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-medium text-black">
                          {formData.city}{formData.district && `, ${formData.district}`}
                        </span>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="border-t border-black/10 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-black/60">BUDŻET</p>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(5)}
                          className="text-xs font-semibold text-[#C44E35] hover:text-[#B33D2A] transition-colors"
                        >
                          Edytuj
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-black">
                          {formData.priceType === 'free' ? (
                            'Za darmo'
                          ) : (
                            <>
                              {formData.price ? `${formData.price} zł` : ''}
                              {formData.price && (
                                <span className="text-black/60 ml-1">
                                  ({formData.priceType === 'hourly' ? 'za godz.' : formData.priceType === 'fixed' ? 'stała' : 'do negocjacji'})
                                </span>
                              )}
                              {!formData.price && (
                                <span className="text-black/60">
                                  {formData.priceType === 'hourly' ? 'Za godzinę' : formData.priceType === 'fixed' ? 'Stała cena' : 'Do negocjacji'}
                                </span>
                              )}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info message */}
                  <div className="bg-black/5 rounded-2xl p-5 text-center border border-black/10">
                    <p className="text-sm font-medium text-black/90 leading-relaxed">
                      Twoje ogłoszenie zostanie automatycznie sprawdzone przez system moderacji AI przed publikacją
                    </p>
                  </div>
                </div>
              )}

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-2xl text-sm mx-3">
                {error}
              </div>
            )}
          </div>
        </form>

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

      {/* Mobile: Fixed bottom action bar */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white z-30 pb-[72px] border-t border-black/10 overflow-hidden transition-transform duration-300 ${
        (isDockVisible && !isMenuOpen) ? 'translate-y-0' : 'translate-y-full'
      }`}>
        {/* Progress bar */}
        <div className="h-1 bg-black/5">
          <div
            className="h-full bg-[#C44E35] transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 px-4 py-3">
          {currentStep === 1 ? (
            <div className="flex-1">
              <Link href="/dashboard" className="block w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 h-11 text-sm font-semibold"
                >
                  Anuluj
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex-1">
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                className="w-full rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 h-11 text-sm font-semibold"
              >
                Wstecz
              </Button>
            </div>
          )}

          {currentStep < totalSteps ? (
            <div className="flex-1">
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-11 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Dalej
              </Button>
            </div>
          ) : (
            <div className="flex-1">
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-11 text-sm font-semibold"
              >
                {loading ? 'Dodawanie...' : 'Opublikuj'}
              </Button>
            </div>
          )}
        </div>
      </div>

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
                  Sprawdzanie ogłoszenia
                </h3>
                <p className="text-black/60">
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
                    <h3 className="text-2xl font-bold text-black mb-2">
                      Ogłoszenie zatwierdzone!
                    </h3>
                    <p className="text-black/60">
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
                    <h3 className="text-2xl font-bold text-black mb-2">
                      Wymaga weryfikacji
                    </h3>
                    <p className="text-black/60">
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
                    <h3 className="text-2xl font-bold text-black mb-2">
                      Ogłoszenie odrzucone
                    </h3>
                    <p className="text-black/60">
                      Twoje ogłoszenie nie spełnia naszych wymagań. Sprawdź, czy treść jest zgodna z regulaminem.
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

export { StepContext }
