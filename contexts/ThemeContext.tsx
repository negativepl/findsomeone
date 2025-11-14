'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme, event?: React.MouseEvent) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Sprawdź zapisany motyw w localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null

    if (savedTheme) {
      setThemeState(savedTheme)
    } else {
      // Domyślnie ustawiamy 'dark'
      setThemeState('dark')
    }
  }, [])

  const setTheme = async (newTheme: Theme, event?: React.MouseEvent) => {
    if (!mounted) {
      setThemeState(newTheme)
      return
    }

    const root = document.documentElement

    const shouldBeDark = newTheme === 'dark' ||
      (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    const isDark = root.classList.contains('dark')

    // Jeśli motyw się nie zmienia, nie rób animacji
    if (shouldBeDark === isDark) {
      setThemeState(newTheme)
      localStorage.setItem('theme', newTheme)
      return
    }

    // Pobierz pozycję kliknięcia lub przycisku
    let x = window.innerWidth / 2
    let y = 0

    if (event) {
      x = event.clientX
      y = event.clientY
    }

    // Oblicz największą odległość do narożnika (dla pełnego pokrycia)
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // Ustaw CSS variables dla pozycji animacji
    root.style.setProperty('--theme-transition-x', `${x}px`)
    root.style.setProperty('--theme-transition-y', `${y}px`)
    root.style.setProperty('--theme-transition-r', `${endRadius}px`)

    // Sprawdź czy przeglądarka wspiera View Transitions API
    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        if (shouldBeDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
        setThemeState(newTheme)
      })

      await transition.finished
    } else {
      // Fallback dla przeglądarek bez wsparcia View Transitions API
      if (shouldBeDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      setThemeState(newTheme)
    }

    // Zapisz preferencje w localStorage
    localStorage.setItem('theme', newTheme)
  }

  useEffect(() => {
    if (!mounted || theme !== 'system') return

    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      const shouldBeDark = mediaQuery.matches
      const isDark = root.classList.contains('dark')

      if (shouldBeDark !== isDark) {
        setTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, mounted])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
