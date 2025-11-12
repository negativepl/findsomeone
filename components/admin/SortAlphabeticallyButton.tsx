'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'

interface SortAlphabeticallyButtonProps {
  parentId?: string | null
  onSorted?: () => void
}

export function SortAlphabeticallyButton({ parentId, onSorted }: SortAlphabeticallyButtonProps) {
  const [isSorting, setIsSorting] = useState(false)

  const handleSort = async () => {
    setIsSorting(true)

    try {
      const response = await fetch('/api/admin/categories/sort-alphabetically', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent_id: parentId }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'Kategorie posortowane alfabetycznie', {
          duration: 2000,
        })
        // Wait a bit for the toast to show, then reload
        setTimeout(() => {
          if (onSorted) {
            onSorted()
          }
        }, 500)
      } else {
        toast.error('Błąd podczas sortowania kategorii')
      }
    } catch (error) {
      console.error('Error sorting categories:', error)
      toast.error('Błąd podczas sortowania kategorii')
    } finally {
      setIsSorting(false)
    }
  }

  return (
    <Button
      onClick={handleSort}
      disabled={isSorting}
      variant="outline"
      className="rounded-full text-sm border-border hover:bg-muted px-6 gap-2"
    >
      <ArrowUpDown className="w-4 h-4" />
      {isSorting ? 'Sortuję...' : 'Sortuj alfabetycznie'}
    </Button>
  )
}
