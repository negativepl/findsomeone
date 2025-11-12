'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { IconPicker } from './IconPicker'
import { Zap, Plus } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface AddCategoryDialogProps {
  parentId?: string | null
  onCategoryAdded?: () => void
}

export function AddCategoryDialog({ parentId, onCategoryAdded }: AddCategoryDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatingDescription, setGeneratingDescription] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'more-horizontal',
    parent_id: parentId || '',
  })

  // Update parent_id when prop changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      parent_id: parentId || ''
    }))
  }, [parentId])

  useEffect(() => {
    if (open) {
      // Fetch categories for parent selection
      const fetchCategories = async () => {
        const supabase = createClient()
        const { data } = await supabase
          .from('categories')
          .select('id, name')
          .is('parent_id', null)
          .order('display_order')

        setCategories(data || [])
      }
      fetchCategories()
    }
  }, [open])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    const dataToInsert = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      icon: formData.icon || null,
      parent_id: formData.parent_id || null,
    }

    const { error } = await supabase
      .from('categories')
      .insert([dataToInsert])

    if (error) {
      console.error('Error adding category:', error)
      toast.error('Błąd podczas dodawania kategorii', {
        description: error.message
      })
    } else {
      toast.success('Kategoria dodana!')
      setFormData({ name: '', slug: '', description: '', icon: 'more-horizontal', parent_id: parentId || '' })
      setOpen(false)
      if (onCategoryAdded) {
        onCategoryAdded()
      } else {
        router.refresh()
      }
    }

    setLoading(false)
  }

  // Check if adding a subcategory (parentId is set)
  const isSubcategory = !!parentId

  const handleGenerateDescription = async () => {
    if (!formData.name.trim()) {
      toast.error('Najpierw wpisz nazwę kategorii')
      return
    }

    setGeneratingDescription(true)

    try {
      const parentCategory = parentId ? categories.find(c => c.id === parentId) : null

      const response = await fetch('/api/admin/categories/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryName: formData.name,
          isSubcategory,
          parentCategoryName: parentCategory?.name || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, description: data.description })
        toast.success('Opis wygenerowany!')
      } else {
        toast.error('Błąd podczas generowania opisu')
      }
    } catch (error) {
      console.error('Error generating description:', error)
      toast.error('Błąd podczas generowania opisu')
    } finally {
      setGeneratingDescription(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 px-8 gap-2">
          <Plus className="w-4 h-4" />
          Dodaj kategorię
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] rounded-3xl p-0 gap-0">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {isSubcategory ? 'Dodaj nową podkategorię' : 'Dodaj nową kategorię'}
            </DialogTitle>
            <DialogDescription>
              {isSubcategory
                ? 'Wypełnij poniższe pola, aby dodać nową podkategorię'
                : 'Wypełnij poniższe pola, aby dodać nową kategorię ogłoszeń'
              }
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {/* Two column layout - only for main categories with icon picker */}
            <div className={isSubcategory ? '' : 'grid lg:grid-cols-2 gap-6'}>
              {/* Left column - Form fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nazwa {isSubcategory ? 'podkategorii' : 'kategorii'} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder={isSubcategory ? "np. iPhone" : "np. Hydraulika"}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder={isSubcategory ? "iphone" : "hydraulika"}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Slug jest generowany automatycznie, ale możesz go edytować
                  </p>
                </div>

                {/* Show parent selector only when NOT adding subcategory */}
                {!isSubcategory && (
                  <div className="space-y-2">
                    <Label htmlFor="parent">Kategoria nadrzędna (opcjonalnie)</Label>
                    <Select
                      value={formData.parent_id || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, parent_id: value === 'none' ? '' : value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Brak - kategoria główna" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Brak - kategoria główna</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Zostaw puste dla kategorii głównej lub wybierz kategorię nadrzędną
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Opis (opcjonalnie)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateDescription}
                      disabled={generatingDescription || !formData.name.trim()}
                      className="rounded-full text-xs px-4 gap-2"
                    >
                      <Zap className="w-3 h-3" />
                      {generatingDescription ? 'Generuję...' : 'Wygeneruj opis'}
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Krótki opis kategorii..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Right column - Icon Picker (only for main categories) */}
              {!isSubcategory && (
                <div>
                  <IconPicker
                    value={formData.icon}
                    onChange={(icon) => setFormData({ ...formData, icon })}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="mt-8 pt-6 border-t border-border">
              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto rounded-full"
                  disabled={loading}
                >
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Dodawanie...' : isSubcategory ? 'Dodaj podkategorię' : 'Dodaj kategorię'}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
