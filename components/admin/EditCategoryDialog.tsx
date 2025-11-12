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
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { IconPicker } from './IconPicker'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  parent_id: string | null
  created_at: string
  display_order?: number
}

interface EditCategoryDialogProps {
  category: Category
  onClose: () => void
  onUpdated: (category: Category) => void
}

export function EditCategoryDialog({ category, onClose, onUpdated }: EditCategoryDialogProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    icon: category.icon || 'more-horizontal',
    parent_id: category.parent_id || '',
  })

  useEffect(() => {
    // Fetch categories for parent selection (excluding current and its children)
    const fetchCategories = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug, description, icon, parent_id, created_at, display_order')
        .is('parent_id', null)
        .neq('id', category.id)
        .order('display_order')

      setCategories(data || [])
    }
    fetchCategories()
  }, [category.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    const dataToUpdate = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      icon: formData.icon || null,
      parent_id: formData.parent_id || null,
    }

    const { data, error } = await supabase
      .from('categories')
      .update(dataToUpdate)
      .eq('id', category.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      toast.error('Błąd podczas aktualizacji kategorii', {
        description: error.message
      })
    } else if (data) {
      toast.success('Kategoria zaktualizowana!')
      onUpdated(data)
    }

    setLoading(false)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] rounded-3xl p-0 gap-0">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edytuj kategorię</DialogTitle>
            <DialogDescription>
              Zaktualizuj dane kategorii
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {/* Two column layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left column - Form fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nazwa kategorii *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="np. Hydraulika"
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-slug">Slug (URL) *</Label>
                  <Input
                    id="edit-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="hydraulika"
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-parent">Kategoria nadrzędna (opcjonalnie)</Label>
                  <Select
                    value={formData.parent_id || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, parent_id: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger className="rounded-xl w-full">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Opis (opcjonalnie)</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Krótki opis kategorii..."
                    rows={4}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Right column - Icon Picker */}
              <div>
                <IconPicker
                  value={formData.icon}
                  onChange={(icon) => setFormData({ ...formData, icon })}
                />
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="mt-8 pt-6 border-t-2 border-black/5">
              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full sm:w-auto rounded-full border border-black/10 hover:border-black/30 hover:bg-black/5"
                  disabled={loading}
                >
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto rounded-full bg-brand hover:bg-brand/90 text-white border-0 font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
