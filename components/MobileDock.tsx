'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const dockItems = [
  {
    title: 'Home',
    href: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    title: 'Ogłoszenia',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    title: 'Dodaj',
    href: '/dashboard/posts/new',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    isSpecial: true,
  },
  {
    title: 'Profil',
    href: '/dashboard/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: 'Więcej',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    isMenu: true,
  },
]

const menuItems = [
  {
    title: 'Logowanie',
    href: '/login',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
    )
  },
  {
    title: 'Rejestracja',
    href: '/signup',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    )
  },
  {
    title: 'O nas',
    href: '#',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: 'Kontakt',
    href: '#',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
]

export function MobileDock() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (menuOpen && !isClosing) {
      handleClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setMenuOpen(false)
      setIsClosing(false)
    }, 300)
  }

  return (
    <>
      {/* Menu overlay */}
      {(menuOpen || isClosing) && (
        <>
          {/* Backdrop */}
          <div
            className={cn(
              "md:hidden fixed inset-0 bg-black/50 z-40",
              isClosing ? "animate-out fade-out duration-300" : "animate-in fade-in duration-200"
            )}
            onClick={handleClose}
          />

          {/* Menu panel */}
          <div
            className={cn(
              "md:hidden fixed left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] overflow-hidden",
              isClosing ? "animate-out slide-out-to-bottom duration-300" : "animate-in slide-in-from-bottom duration-400"
            )}
            style={{
              bottom: '0',
              paddingBottom: '84px',
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">Menu</h2>
                <button
                  onClick={handleClose}
                  className="text-black/60 hover:text-black transition-colors p-2 -mr-2 rounded-full hover:bg-black/5"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" stroke="currentColor" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15L15 5M5 5L15 15" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[60vh]">
                {menuItems.map((item, index) => (
                  <Link
                    key={`${item.href}-${index}`}
                    href={item.href}
                    className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl font-medium transition-colors bg-[#F5F1E8] hover:bg-brand hover:text-white group"
                  >
                    <div className="text-black group-hover:text-white transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-sm text-black group-hover:text-white transition-colors">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom dock */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-black/5 rounded-t-3xl"
      >
        <div className="relative flex items-start justify-around px-4 pt-3 pb-2">
          {dockItems.map((item, index) => {
            const isActive = pathname === item.href

            if (item.isMenu) {
              return (
                <button
                  key="menu"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex flex-col items-center justify-center gap-1.5 flex-1 relative"
                >
                  <div className={cn(
                    "relative z-10 w-10 h-10 flex items-center justify-center transition-colors",
                    menuOpen && "text-white"
                  )}>
                    {menuOpen && (
                      <div className="absolute inset-0 bg-brand rounded-xl -z-10" />
                    )}
                    <div className={cn(
                      "transition-colors",
                      menuOpen ? 'text-white' : 'text-black/60'
                    )}>
                      {item.icon}
                    </div>
                  </div>
                  <span className="text-xs text-black/60">{item.title}</span>
                </button>
              )
            }

            if (item.isSpecial) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-1.5 flex-1 relative"
                >
                  <div className={cn(
                    "relative z-10 w-10 h-10 flex items-center justify-center transition-colors",
                    isActive && "text-white"
                  )}>
                    {isActive && (
                      <div className="absolute inset-0 bg-brand rounded-xl -z-10 transition-opacity duration-200" />
                    )}
                    <div className={cn(
                      "transition-colors",
                      isActive ? 'text-white' : 'text-black/60'
                    )}>
                      {item.icon}
                    </div>
                  </div>
                  <span className="text-xs text-black/60">{item.title}</span>
                </Link>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1.5 flex-1 relative"
              >
                <div className={cn(
                  "relative z-10 w-10 h-10 flex items-center justify-center transition-colors",
                  isActive && !menuOpen && "text-white"
                )}>
                  {isActive && !menuOpen && (
                    <div className="absolute inset-0 bg-brand rounded-xl -z-10 transition-opacity duration-200" />
                  )}
                  <div className={cn(
                    "transition-colors",
                    isActive && !menuOpen ? 'text-white' : 'text-black/60'
                  )}>
                    {item.icon}
                  </div>
                </div>
                <span className="text-xs text-black/60">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
