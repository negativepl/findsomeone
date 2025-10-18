'use client'

import { useState } from 'react'
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
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  parent_id: string | null
}

interface EditSubcategoryDialogProps {
  category: Category
  onClose: () => void
  onUpdated: (category: Category) => void
}

export function EditSubcategoryDialog({ category, onClose, onUpdated }: EditSubcategoryDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: category.name,
    slug: category.slug,
    description: category.description || '',
  })

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

    const dataToUpdate = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
    }

    const { data, error } = await supabase
      .from('categories')
      .update(dataToUpdate)
      .eq('id', category.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating subcategory:', error)
      alert('Błąd podczas aktualizacji podkategorii: ' + error.message)
    } else if (data) {
      onUpdated(data)
    }

    setLoading(false)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl p-0 gap-0">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edytuj podkategorię</DialogTitle>
            <DialogDescription>
              Zaktualizuj dane podkategorii
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sub-name">Nazwa podkategorii *</Label>
              <Input
                id="edit-sub-name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="np. Narzędzia budowlane"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sub-slug">Slug (URL) *</Label>
              <Input
                id="edit-sub-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="narzedzia-budowlane"
                required
                className="rounded-xl"
              />
              <p className="text-xs text-black/60">
                Slug jest generowany automatycznie, ale możesz go edytować
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sub-description">Opis (opcjonalnie)</Label>
              <Textarea
                id="edit-sub-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Krótki opis podkategorii..."
                rows={4}
                className="rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="mt-0 pt-6 px-6 pb-6 border-t-2 border-black/5 rounded-b-3xl">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5"
              disabled={loading}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 font-semibold"
              disabled={loading}
            >
              {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
