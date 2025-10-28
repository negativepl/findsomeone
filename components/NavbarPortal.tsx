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

  if (!mounted || typeof window === 'undefined') {
    return null
  }

  return createPortal(
    children,
    document.body
  )
}
