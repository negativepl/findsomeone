'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { HomepageSection } from '@/lib/homepage-sections/types'
import { toast } from 'sonner'

// Fetch all homepage sections
export function useHomepageSections() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['homepage-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data as HomepageSection[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - increase staleTime to reduce refetches
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  })
}

// Fetch only active sections (for preview)
export function useActiveHomepageSections() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['homepage-sections', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data as HomepageSection[]
    },
    staleTime: 30 * 1000,
  })
}

// Create new section
export function useCreateSection() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (section: Partial<HomepageSection>) => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .insert(section)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] })
      toast.success('Sekcja została dodana')
    },
    onError: (error: Error) => {
      toast.error('Błąd podczas dodawania sekcji: ' + error.message)
    },
  })
}

// Update section
export function useUpdateSection() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<HomepageSection> }) => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['homepage-sections'] })

      // Snapshot previous value
      const previousSections = queryClient.getQueryData<HomepageSection[]>(['homepage-sections'])

      // Optimistically update
      queryClient.setQueryData<HomepageSection[]>(['homepage-sections'], (old) => {
        if (!old) return old
        return old.map((section) =>
          section.id === id ? { ...section, ...updates } : section
        )
      })

      return { previousSections }
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousSections) {
        queryClient.setQueryData(['homepage-sections'], context.previousSections)
      }
      toast.error('Błąd podczas aktualizacji: ' + error.message)
    },
    onSuccess: () => {
      toast.success('Sekcja zaktualizowana')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] })
    },
  })
}

// Delete section
export function useDeleteSection() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('homepage_sections')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['homepage-sections'] })
      const previousSections = queryClient.getQueryData<HomepageSection[]>(['homepage-sections'])

      // Optimistically remove
      queryClient.setQueryData<HomepageSection[]>(['homepage-sections'], (old) => {
        if (!old) return old
        return old.filter((section) => section.id !== id)
      })

      return { previousSections }
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousSections) {
        queryClient.setQueryData(['homepage-sections'], context.previousSections)
      }
      toast.error('Błąd podczas usuwania: ' + error.message)
    },
    onSuccess: () => {
      toast.success('Sekcja usunięta')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] })
    },
  })
}

// Reorder sections (bulk update)
export function useReorderSections() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (sections: HomepageSection[]) => {
      // Update sort_order for all sections
      const updates = sections.map((section, index) =>
        supabase
          .from('homepage_sections')
          .update({ sort_order: index })
          .eq('id', section.id)
      )

      const results = await Promise.all(updates)
      const errors = results.filter(r => r.error)

      if (errors.length > 0) {
        throw new Error('Błąd podczas zmiany kolejności')
      }

      return sections
    },
    onMutate: async (newSections) => {
      await queryClient.cancelQueries({ queryKey: ['homepage-sections'] })
      const previousSections = queryClient.getQueryData<HomepageSection[]>(['homepage-sections'])

      // Optimistically update order
      queryClient.setQueryData(['homepage-sections'], newSections)

      return { previousSections }
    },
    onError: (error: Error, _sections, context) => {
      if (context?.previousSections) {
        queryClient.setQueryData(['homepage-sections'], context.previousSections)
      }
      toast.error('Błąd podczas zmiany kolejności: ' + error.message)
    },
    onSuccess: () => {
      // Don't show toast on every reorder - it's too noisy during drag & drop
      // toast.success('Kolejność zmieniona')
    },
    // Don't invalidate on settled - we use optimistic updates for better performance
    // The data is already updated optimistically and will be correct after mutation succeeds
  })
}

// Toggle section active status
export function useToggleSectionActive() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async ({ id, is_active }) => {
      await queryClient.cancelQueries({ queryKey: ['homepage-sections'] })
      const previousSections = queryClient.getQueryData<HomepageSection[]>(['homepage-sections'])

      queryClient.setQueryData<HomepageSection[]>(['homepage-sections'], (old) => {
        if (!old) return old
        return old.map((section) =>
          section.id === id ? { ...section, is_active } : section
        )
      })

      return { previousSections }
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousSections) {
        queryClient.setQueryData(['homepage-sections'], context.previousSections)
      }
      toast.error('Błąd podczas zmiany statusu: ' + error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] })
    },
  })
}
