'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface BackgroundContextType {
  currentColor: string
  setCurrentColor: (color: string) => void
}

const BackgroundContext = createContext<BackgroundContextType>({
  currentColor: '#FAF8F3',
  setCurrentColor: () => {},
})

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [currentColor, setCurrentColor] = useState('#FAF8F3')

  return (
    <BackgroundContext.Provider value={{ currentColor, setCurrentColor }}>
      <div
        className="min-h-screen pb-20 md:pb-0 transition-colors duration-1000 ease-in-out"
        style={{ backgroundColor: currentColor }}
      >
        {children}
      </div>
    </BackgroundContext.Provider>
  )
}

export function useBackground() {
  return useContext(BackgroundContext)
}
