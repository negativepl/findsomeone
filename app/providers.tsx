'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { useState, useEffect } from 'react'
import { PresenceManager } from '@/components/PresenceManager'
import { createClient } from '@/lib/supabase/client'
import { ThemeProvider } from '@/contexts/ThemeContext'

interface ProvidersProps {
  children: React.ReactNode
  userId?: string
}

export function Providers({ children, userId: initialUserId }: ProvidersProps) {
  const [userId, setUserId] = useState<string | undefined>(initialUserId)
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

  // Subscribe to auth changes only - initial user comes from server
  useEffect(() => {
    const supabase = createClient()

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
        {/* React Query Devtools - tylko w development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  )
}
