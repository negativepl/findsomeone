// Przykład użycia React Query w projekcie
// Ten plik możesz usunąć - to tylko przykład

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Przykład 1: Prosty fetch danych
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    },
  })
}

// Przykład 2: Fetch z parametrami
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    },
    enabled: !!userId, // Query uruchomi się tylko gdy userId istnieje
  })
}

// Przykład 3: Mutation (POST/PUT/DELETE)
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newUser: { name: string; email: string }) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    },
    onSuccess: () => {
      // Invalidate cache dla users, żeby pobrać świeże dane
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// Przykład 4: Integracja z Supabase
// import { createClient } from '@/lib/supabase/client'
//
// export function useProfiles() {
//   return useQuery({
//     queryKey: ['profiles'],
//     queryFn: async () => {
//       const supabase = createClient()
//       const { data, error } = await supabase
//         .from('profiles')
//         .select('*')
//
//       if (error) throw error
//       return data
//     },
//   })
// }
