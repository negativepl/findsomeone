'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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

interface DeleteCategoryDialogProps {
  category: Category
  onClose: () => void
  onDeleted: (id: string) => void
}

export function DeleteCategoryDialog({ category, onClose, onDeleted }: DeleteCategoryDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    const supabase = createClient()

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id)

    if (error) {
      console.error('Error deleting category:', error)
      alert('Błąd podczas usuwania kategorii: ' + error.message)
    } else {
      onDeleted(category.id)
    }

    setLoading(false)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600">Usuń kategorię</DialogTitle>
          <DialogDescription>
            Czy na pewno chcesz usunąć kategorię <strong>{category.name}</strong>?
            <br />
            <br />
            Ta operacja jest nieodwracalna. Ogłoszenia przypisane do tej kategorii nie będą miały przypisanej kategorii.
          </DialogDescription>
        </DialogHeader>
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
            type="button"
            onClick={handleDelete}
            className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white border-0"
            disabled={loading}
          >
            {loading ? 'Usuwanie...' : 'Usuń kategorię'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
