'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { useState, useEffect } from 'react'
import { PresenceManager } from '@/components/PresenceManager'
import { createClient } from '@/lib/supabase/client'
import { ThemeProvider } from '@/contexts/ThemeContext'

export function Providers({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Domyślne ustawienia cache'owania
            staleTime: 60 * 1000, // 1 minuta
            gcTime: 5 * 60 * 1000, // 5 minut (poprzednio cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  // Get current user for presence tracking
  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id)
    }

    getUser()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <PresenceManager userId={userId} />
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            className: 'sonner-toast',
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
