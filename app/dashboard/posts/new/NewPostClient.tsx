'use client'

import { useState, useEffect, createContext, useContext } from 'react'
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

  // Validation for each step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: // Podstawowe info
        return !!(formData.type && formData.category && formData.title.trim())
      case 2: // Szczegóły
        return formData.description.trim().length > 0
      case 3: // Zdjęcia (opcjonalne, zawsze valid)
        return true
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

      router.push('/dashboard/posts')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd')
      setLoading(false)
      setShowModerationModal(false)
    }
  }

  return (
      <main className="md:container md:mx-auto px-4 md:px-6 h-full md:h-auto md:py-16 flex flex-col md:block">
        {/* Page Header - Above Card - Hidden on mobile */}
        <div className="hidden md:block mb-8">
          <h1 className="text-4xl font-bold text-black mb-3">Dodaj nowe ogłoszenie</h1>
          <p className="text-lg text-black/60">
            Wypełnij formularz aby dodać ogłoszenie o poszukiwaniu lub oferowaniu usługi
          </p>
        </div>

      <Card className="border-0 md:rounded-3xl bg-white md:mx-0 -mx-4 flex-1 md:flex-none overflow-hidden mt-8 md:mt-0">
        <CardContent className="pt-4 md:pt-6 px-0 md:px-6 h-full md:h-auto flex flex-col">
          <form onSubmit={handleSubmit} className="space-y-6 h-full md:h-auto flex flex-col md:block">
            {/* Desktop: All fields visible */}
            <div className="hidden md:block space-y-6">
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
                          ? 'np. Szukam hydraulika w Warszawie'
                          : 'np. Oferuję usługi hydrauliczne'
                      }
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      maxLength={80}
                      className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30 pr-16 text-sm md:text-base placeholder:text-xs md:placeholder:text-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs md:text-sm text-black/40 font-medium">
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
            </div>

            {/* Mobile: Step-by-step */}
            <div className="md:hidden flex-1 flex flex-col overflow-hidden">
              {/* Step 1: Podstawowe informacje */}
              {currentStep === 1 && (
                <div className="space-y-3 animate-in fade-in duration-300 px-3 pb-4 overflow-y-auto">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-black">Typ ogłoszenia *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'seeking' | 'offering') =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger className="rounded-2xl border-2 border-black/10 !h-12 w-full text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seeking">Szukam usługi</SelectItem>
                        <SelectItem value="offering">Oferuję usługi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-black">Kategoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger className="rounded-2xl border-2 border-black/10 !h-12 w-full text-base">
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

                  <div className="space-y-2">
                    <Label htmlFor="title-mobile" className="text-base font-semibold text-black">
                      Tytuł ogłoszenia *
                    </Label>
                    <div className="relative">
                      <Input
                        id="title-mobile"
                        placeholder={
                          formData.type === 'seeking'
                            ? 'np. Szukam hydraulika w Warszawie'
                            : 'np. Oferuję usługi hydrauliczne'
                        }
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        maxLength={80}
                        className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30 pr-14 text-base"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-black/40 font-medium">
                        {formData.title.length}/80
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Opis */}
              {currentStep === 2 && (
                <div className="animate-in fade-in duration-300 px-3 pb-4 flex flex-col flex-1 overflow-hidden">
                  <RichTextEditor
                    content={formData.description}
                    onChange={(content) => setFormData({ ...formData, description: content })}
                    placeholder={
                      formData.type === 'seeking'
                        ? 'Opisz szczegółowo czego szukasz...'
                        : 'Opisz szczegółowo co oferujesz...'
                    }
                    className="flex-1 flex flex-col"
                  />
                </div>
              )}

              {/* Step 3: Zdjęcia */}
              {currentStep === 3 && (
                <div className="space-y-3 animate-in fade-in duration-300 px-3 pb-4 overflow-y-auto">
                  <div>
                    <p className="text-xs text-black/60">Opcjonalnie - możesz dodać do 6 zdjęć</p>
                  </div>

                  <ImageUpload
                    images={images}
                    onImagesChange={setImages}
                    userId={userId}
                    maxImages={6}
                  />
                </div>
              )}

              {/* Step 4: Lokalizacja */}
              {currentStep === 4 && (
                <div className="space-y-3 animate-in fade-in duration-300 px-3 pb-4 overflow-y-auto">
                  <div className="space-y-2">
                    <Label htmlFor="city-mobile" className="text-base font-semibold text-black">
                      Miasto *
                    </Label>
                    <Input
                      id="city-mobile"
                      placeholder="np. Warszawa"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district-mobile" className="text-base font-semibold text-black">
                      Dzielnica <span className="text-black/40 font-normal">(opcjonalnie)</span>
                    </Label>
                    <Input
                      id="district-mobile"
                      placeholder="np. Śródmieście"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30 text-base"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Budżet */}
              {currentStep === 5 && (
                <div className="space-y-3 animate-in fade-in duration-300 px-3 pb-4 overflow-y-auto">
                  <div>
                    <p className="text-xs text-black/60">Opcjonalnie - możesz pominąć ten krok</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-black">Typ ceny</Label>
                    <Select
                      value={formData.priceType}
                      onValueChange={(value: 'hourly' | 'fixed' | 'negotiable') =>
                        setFormData({ ...formData, priceType: value })
                      }
                    >
                      <SelectTrigger className="rounded-2xl border-2 border-black/10 !h-12 w-full text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Za godzinę</SelectItem>
                        <SelectItem value="fixed">Stała cena</SelectItem>
                        <SelectItem value="negotiable">Do negocjacji</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceMin-mobile" className="text-base font-semibold text-black">
                      Cena minimalna (zł)
                    </Label>
                    <Input
                      id="priceMin-mobile"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={formData.priceMin}
                      onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                      className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceMax-mobile" className="text-base font-semibold text-black">
                      Cena maksymalna (zł)
                    </Label>
                    <Input
                      id="priceMax-mobile"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={formData.priceMax}
                      onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                      className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30 text-base"
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Podsumowanie */}
              {currentStep === 6 && (
                <div className="space-y-4 animate-in fade-in duration-300 px-3 pb-4 overflow-y-auto">
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
                        <span className="font-medium">
                          {formData.type === 'seeking' ? 'Szukam' : 'Oferuję'}
                        </span>
                        <span>•</span>
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
                        <p className="text-sm text-black/40">Brak zdjęć</p>
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
                          {formData.priceMin || formData.priceMax ? 'Edytuj' : 'Dodaj'}
                        </button>
                      </div>
                      {(formData.priceMin || formData.priceMax) ? (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-black">
                            {formData.priceMin && `${formData.priceMin} zł`}
                            {formData.priceMin && formData.priceMax && ' - '}
                            {formData.priceMax && `${formData.priceMax} zł`}
                            <span className="text-black/60 ml-1">
                              ({formData.priceType === 'hourly' ? 'za godz.' : formData.priceType === 'fixed' ? 'stała' : 'do negocjacji'})
                            </span>
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-black/40">Nie określono budżetu</p>
                      )}
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
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-2xl text-sm">
                {error}
              </div>
            )}

            {/* Desktop buttons */}
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
