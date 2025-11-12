'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
      toast.error('Błąd podczas usuwania kategorii', {
        description: error.message
      })
    } else {
      toast.success('Kategoria usunięta!')
      onDeleted(category.id)
    }

    setLoading(false)
  }

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className="rounded-3xl border-0 shadow-xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">
            Usuń kategorię
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Czy na pewno chcesz usunąć kategorię <strong>{category.name}</strong>?
            {' '}Ta operacja jest nieodwracalna. Ogłoszenia przypisane do tej kategorii nie będą miały przypisanej kategorii.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-8 pt-6 border-t border-border">
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel
              className="rounded-full border-border hover:bg-muted"
              disabled={loading}
            >
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0"
              disabled={loading}
            >
              {loading ? 'Usuwanie...' : 'Usuń kategorię'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
