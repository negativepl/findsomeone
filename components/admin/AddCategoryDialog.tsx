'use client'

import { useState, useEffect } from 'react'
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

interface Category {
  id: string
  name: string
}

export function AddCategoryDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'more-horizontal',
    parent_id: '',
  })

  useEffect(() => {
    if (open) {
      // Fetch categories for parent selection
      const fetchCategories = async () => {
        const supabase = createClient()
        const { data } = await supabase
          .from('categories')
          .select('id, name')
          .is('parent_id', null)
          .order('name')

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
      alert('Błąd podczas dodawania kategorii: ' + error.message)
    } else {
      setFormData({ name: '', slug: '', description: '', icon: 'more-horizontal', parent_id: '' })
      setOpen(false)
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 px-8">
          + Dodaj kategorię
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Dodaj nową kategorię</DialogTitle>
          <DialogDescription>
            Wypełnij poniższe pola, aby dodać nową kategorię ogłoszeń
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nazwa kategorii *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="np. Hydraulika"
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL) *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="hydraulika"
              required
              className="rounded-xl"
            />
            <p className="text-xs text-black/60">
              Slug jest generowany automatycznie, ale możesz go edytować
            </p>
          </div>

          <IconPicker
            value={formData.icon}
            onChange={(icon) => setFormData({ ...formData, icon })}
          />

          <div className="space-y-2">
            <Label htmlFor="parent">Kategoria nadrzędna (opcjonalnie)</Label>
            <Select
              value={formData.parent_id || 'none'}
              onValueChange={(value) => setFormData({ ...formData, parent_id: value === 'none' ? '' : value })}
            >
              <SelectTrigger className="rounded-xl">
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
            <p className="text-xs text-black/60">
              Zostaw puste dla kategorii głównej lub wybierz kategorię nadrzędną
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis (opcjonalnie)</Label>
            <Textarea
              id="description"
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
              onClick={() => setOpen(false)}
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
              {loading ? 'Dodawanie...' : 'Dodaj kategorię'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
