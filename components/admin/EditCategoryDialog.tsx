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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
}

interface EditCategoryDialogProps {
  category: Category
  onClose: () => void
  onUpdated: (category: Category) => void
}

export function EditCategoryDialog({ category, onClose, onUpdated }: EditCategoryDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: category.name,
    slug: category.slug,
    description: category.description || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    const { data, error } = await supabase
      .from('categories')
      .update(formData)
      .eq('id', category.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      alert('Błąd podczas aktualizacji kategorii: ' + error.message)
    } else if (data) {
      onUpdated(data)
    }

    setLoading(false)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edytuj kategorię</DialogTitle>
          <DialogDescription>
            Zaktualizuj dane kategorii
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
            <Label htmlFor="edit-description">Opis (opcjonalnie)</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Krótki opis kategorii..."
              rows={3}
              className="rounded-xl"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5"
              disabled={loading}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0"
              disabled={loading}
            >
              {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
