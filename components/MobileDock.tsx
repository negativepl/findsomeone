'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { User } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const getDockItems = (isLoggedIn: boolean) => {
  if (isLoggedIn) {
    return [
      {
        title: 'Home',
        href: '/',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        title: 'Ogłoszenia',
        href: '/posts',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        ),
      },
      {
        title: 'Dodaj',
        href: '/dashboard/posts/new',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        ),
        isSpecial: true,
      },
      {
        title: 'Moje konto',
        href: '/dashboard',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
  } else {
    return [
      {
        title: 'Home',
        href: '/',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        title: 'Ogłoszenia',
        href: '/posts',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        ),
      },
      {
        title: 'O nas',
        href: '/about',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        title: 'Zaloguj',
        href: '/login',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        ),
      },
      {
        title: 'Zarejestruj',
        href: '/signup',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        ),
      },
    ]
  }
}

const getMenuItems = (isLoggedIn: boolean, isAdmin: boolean = false) => {
  const items = [
    {
      title: 'Moje ogłoszenia',
      href: '/dashboard/posts',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>
        </svg>
      ),
      requiresAuth: true
    },
    {
      title: 'Profil',
      href: '/dashboard/profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      title: 'Ustawienia',
      href: '/dashboard/settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      title: 'Logowanie',
      href: '/login',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      ),
      requiresAuth: false,
      hideWhenLoggedIn: true
    },
    {
      title: 'Rejestracja',
      href: '/signup',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      requiresAuth: false,
      hideWhenLoggedIn: true
    },
    {
      title: 'Wyloguj się',
      href: '#logout',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16 17 5-5-5-5M21 12H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        </svg>
      ),
      requiresAuth: true,
      isLogout: true
    },
  ]

  // Filtruj itemy w zależności od statusu logowania
  return items.filter(item => {
    if (item.requiresAuth && !isLoggedIn) return false
    if (item.hideWhenLoggedIn && isLoggedIn) return false
    return true
  })
}

interface MobileDockProps {
  user?: User | null
  profile?: { avatar_url: string | null; full_name: string | null } | null
  isAdmin?: boolean
}

export function MobileDock({ user, profile, isAdmin = false }: MobileDockProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const isLoggedIn = !!user
  const dockItems = getDockItems(isLoggedIn)
  const menuItems = getMenuItems(isLoggedIn, isAdmin)

  // Remove rounded corners on message pages
  const isMessagePage = pathname?.includes('/dashboard/messages/')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Pobierz inicjały użytkownika
  const getInitials = () => {
    const email = user?.email || ''
    const name = user?.user_metadata?.full_name || email
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Pobierz nazwę użytkownika
  const getUserName = () => {
    return profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Użytkownik'
  }

  // Calculate active index for indicator animation
  const getActiveIndex = () => {
    // If menu is open, show indicator under Menu button (highest priority)
    if (menuOpen) {
      return dockItems.findIndex(item => item.isMenu)
    }

    // Check if current path is in dock items
    const dockIndex = dockItems.findIndex(item => item.href === pathname)
    if (dockIndex !== -1) return dockIndex

    // Check if current path is in menu items - show indicator under Menu button
    const isInMenu = menuItems.some(item => item.href === pathname)
    if (isInMenu) {
      return dockItems.findIndex(item => item.isMenu)
    }

    return -1
  }

  const activeIndex = getActiveIndex()

  // Check if the active item is the special "Dodaj" button
  const isSpecialActive = activeIndex !== -1 && dockItems[activeIndex]?.isSpecial

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

  // Haptic feedback function
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10) // Short vibration (10ms)
    }
  }

  const handleSignOut = async () => {
    triggerHaptic()
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    handleClose()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Menu overlay */}
      {(menuOpen || isClosing) && (
        <>
          {/* Backdrop */}
          <div
            className={cn(
              "md:hidden fixed inset-0 bg-black/50 z-10",
              isClosing ? "animate-out fade-out duration-300" : "animate-in fade-in duration-200"
            )}
            onClick={handleClose}
          />

          {/* Menu panel */}
          <div
            className={cn(
              "md:hidden fixed left-0 right-0 bg-white rounded-t-3xl z-20 max-h-[80vh] overflow-hidden",
              isClosing ? "animate-out slide-out-to-bottom duration-300" : "animate-in slide-in-from-bottom duration-400"
            )}
            style={{
              bottom: '0',
              paddingBottom: '84px',
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                {/* User info or Menu title */}
                {isLoggedIn && user ? (
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt=""
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#C44E35] text-white flex items-center justify-center font-bold text-lg" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                        {getInitials()}
                      </div>
                    )}
                    {/* User info */}
                    <div className="flex flex-col">
                      <p className="font-semibold text-black">{getUserName()}</p>
                      <p className="text-sm text-black/60 truncate max-w-[180px]">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <h2 className="text-xl font-bold text-black">Menu</h2>
                )}

                <button
                  onClick={() => {
                    triggerHaptic()
                    handleClose()
                  }}
                  className="text-black/60 hover:text-black transition-colors p-2 -mr-2 rounded-full hover:bg-black/5"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" stroke="currentColor" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15L15 5M5 5L15 15" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[60vh]">
                {menuItems.map((item, index) => {
                  // Handle logout separately
                  if (item.isLogout) {
                    return (
                      <button
                        key={`${item.href}-${index}`}
                        onClick={handleSignOut}
                        className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl font-medium transition-colors bg-red-50 hover:bg-red-100 text-red-600"
                      >
                        <div className="text-red-600">
                          {item.icon}
                        </div>
                        <span className="text-sm text-red-600">{item.title}</span>
                      </button>
                    )
                  }

                  return (
                    <Link
                      key={`${item.href}-${index}`}
                      href={item.href}
                      onClick={triggerHaptic}
                      className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl font-medium transition-colors bg-[#F5F1E8] hover:bg-brand hover:text-white group"
                    >
                      <div className="text-black group-hover:text-white transition-colors">
                        {item.icon}
                      </div>
                      <span className="text-sm text-black group-hover:text-white transition-colors">{item.title}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom dock */}
      <motion.div
        initial={false}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-black/5",
          !isMessagePage && "rounded-t-3xl"
        )}
        style={{
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
        }}
      >
        <div className="relative flex items-center justify-around px-4 py-3 safe-area-inset-bottom">
          {/* Animated indicator background */}
          <div
            className="absolute bg-brand transition-all"
            style={{
              height: isSpecialActive ? '44px' : '36px',
              width: isSpecialActive ? '44px' : '36px',
              borderRadius: isSpecialActive ? '50%' : '12px',
              top: isSpecialActive ? '8px' : '12px',
              zIndex: 0,
              left: activeIndex !== -1
                ? `calc((100% - 32px) / ${dockItems.length} * ${activeIndex} + 16px + (100% - 32px) / ${dockItems.length} / 2 - ${isSpecialActive ? '22px' : '18px'})`
                : '0px',
              transition: 'left 0.4s cubic-bezier(0.34, 1.25, 0.35, 1), opacity 0.2s, width 0.3s ease, height 0.3s ease, border-radius 0.3s ease, top 0.3s ease',
              opacity: isMounted && activeIndex !== -1 ? 1 : 0,
            }}
          />
          {dockItems.map((item, index) => {
            const isActive = pathname === item.href

            if (item.isMenu) {
              const isMenuButtonActive = menuOpen
              const isOnMenuPage = menuItems.some(menuItem => menuItem.href === pathname)
              // Menu button is white when: menuOpen OR on menu page
              const shouldBeWhite = isMenuButtonActive || isOnMenuPage

              return (
                <button
                  key="menu"
                  onClick={() => {
                    triggerHaptic()
                    setMenuOpen(!menuOpen)
                  }}
                  className="flex flex-col items-center justify-center gap-4 flex-1 relative z-10 py-2"
                >
                  <div className={cn(
                    "transition-colors",
                    shouldBeWhite ? 'text-white' : 'text-black/60'
                  )}>
                    {item.icon}
                  </div>
                  <span className="text-xs leading-none text-black/60">{item.title}</span>
                </button>
              )
            }

            if (item.isSpecial) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={triggerHaptic}
                  className="flex flex-col items-center justify-center gap-4 flex-1 relative z-10 py-2"
                >
                  <div className="relative flex items-center justify-center">
                    {/* Pomarańczowe kółko w tle */}
                    <div className="absolute w-11 h-11 bg-brand rounded-full shrink-0" />
                    {/* Ikona */}
                    <div className="relative text-white">
                      {item.icon}
                    </div>
                  </div>
                  <span className="text-xs leading-none text-black/60">{item.title}</span>
                </Link>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={triggerHaptic}
                className="flex flex-col items-center justify-center gap-4 flex-1 relative z-10 py-2"
              >
                <div className={cn(
                  "transition-colors",
                  isActive && !menuOpen ? 'text-white' : 'text-black/60'
                )}>
                  {item.icon}
                </div>
                <span className="text-xs leading-none text-black/60">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </motion.div>
    </>
  )
}
