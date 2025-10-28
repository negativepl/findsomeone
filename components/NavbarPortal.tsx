'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ReactNode } from 'react'

interface NavbarPortalProps {
  children: ReactNode
}

export function NavbarPortal({ children }: NavbarPortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render directly until mounted to avoid flash
  if (!mounted || typeof window === 'undefined') {
    return <>{children}</>
  }

  return createPortal(
    children,
    document.body
  )
}
