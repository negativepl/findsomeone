'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { User } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { CategoryIcon } from '@/lib/category-icons'
import { Drawer } from 'vaul'
import { LordIcon, type LordIconRef } from './LordIcon'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  subcategories?: { id: string; name: string; slug: string }[]
}

const getDockItems = (isLoggedIn: boolean) => {
  if (isLoggedIn) {
    return [
      {
        title: 'Home',
        href: '/',
        icon: <img src="/icons/home.svg" alt="" className="w-5 h-5" />,
      },
      {
        title: 'Kategorie',
        href: '#',
        icon: <img src="/icons/categories.svg" alt="" className="w-5 h-5" />,
        isCategories: true,
      },
      {
        title: 'Dodaj',
        href: '/dashboard/my-posts/new',
        icon: <img src="/icons/plus.svg" alt="" className="w-5 h-5" />,
        isSpecial: true,
      },
      {
        title: 'Moje konto',
        href: '/dashboard',
        icon: <img src="/icons/my-account.svg" alt="" className="w-5 h-5" />,
      },
      {
        title: 'Więcej',
        href: '#',
        icon: <img src="/icons/menu.svg" alt="" className="w-5 h-5" />,
        isMenu: true,
      },
    ]
  } else {
    return [
      {
        title: 'Home',
        href: '/',
        icon: <img src="/icons/home.svg" alt="" className="w-5 h-5" />,
      },
      {
        title: 'Kategorie',
        href: '#',
        icon: <img src="/icons/categories.svg" alt="" className="w-5 h-5" />,
        isCategories: true,
      },
      {
        title: 'O nas',
        href: '/about',
        icon: <img src="/icons/about.svg" alt="" className="w-5 h-5" />,
      },
      {
        title: 'Zaloguj',
        href: '/login',
        icon: <img src="/icons/login.svg" alt="" className="w-5 h-5" />,
      },
      {
        title: 'Zarejestruj',
        href: '/signup',
        icon: <img src="/icons/signup.svg" alt="" className="w-5 h-5" />,
      },
    ]
  }
}

const getMenuItems = (isLoggedIn: boolean, isAdmin: boolean = false) => {
  const items = [
    {
      title: 'Moje ogłoszenia',
      href: '/dashboard/my-posts',
      icon: <img src="/icons/my-posts.svg" alt="" className="w-6 h-6" />,
      requiresAuth: true
    },
    {
      title: 'Profil',
      href: '/dashboard/profile',
      icon: <img src="/icons/profile.svg" alt="" className="w-6 h-6" />,
      requiresAuth: true
    },
    {
      title: 'Ustawienia',
      href: '/dashboard/settings',
      icon: <img src="/icons/settings.svg" alt="" className="w-6 h-6" />,
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
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" clipPath="url(#aZI5Ai_18ga)">
            <path d="M16 16.25 20.25 12 16 7.75M20.25 12H8.75m4.5 8.25h-7.5c-1.1 0-2-.9-2-2V5.75c0-1.1.9-2 2-2h7.5"/>
          </g>
          <defs>
            <clipPath id="aZI5Ai_18ga">
              <path fill="#fff" d="M0 0h24v24H0z"/>
            </clipPath>
          </defs>
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
  categories?: Category[]
}

export function MobileDock({ user, profile, isAdmin = false, categories = [] }: MobileDockProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const isLoggedIn = !!user
  const dockItems = getDockItems(isLoggedIn)
  const menuItems = getMenuItems(isLoggedIn, isAdmin)

  // Create refs array for menu items - must be before any conditional returns
  const iconRefsRef = useRef<(LordIconRef | null)[]>([])
  iconRefsRef.current = menuItems.map((_, i) => iconRefsRef.current[i] || null)

  // Remove rounded corners on message pages
  const isMessagePage = pathname?.includes('/dashboard/messages/')

  useEffect(() => {
    // Preload LordIcon animations for menu items
    const iconsToPreload = ['/icons/newspaper.json', '/icons/account.json', '/icons/settings.json']
    iconsToPreload.forEach(icon => {
      fetch(icon).catch(() => {}) // Preload but ignore errors
    })
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
    // If categories modal or selected category is open, show indicator under Categories button (highest priority)
    if (categoriesOpen || selectedCategory) {
      return dockItems.findIndex(item => item.isCategories)
    }

    // If menu is open, show indicator under Menu button
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
  const [prevActiveIndex, setPrevActiveIndex] = useState(activeIndex)

  // Check if the active item is the special "Dodaj" button
  const isSpecialActive = activeIndex !== -1 && dockItems[activeIndex]?.isSpecial

  // Find special button index
  const specialButtonIndex = dockItems.findIndex(item => item.isSpecial)

  // Check if animation should pass through special button
  const shouldAnimateThroughSpecial = () => {
    if (activeIndex === -1 || prevActiveIndex === -1) return false
    if (specialButtonIndex === -1) return false

    const min = Math.min(activeIndex, prevActiveIndex)
    const max = Math.max(activeIndex, prevActiveIndex)

    // Special button is between previous and current position
    return specialButtonIndex > min && specialButtonIndex < max
  }

  const passesThroughSpecial = shouldAnimateThroughSpecial()

  useEffect(() => {
    if (activeIndex !== prevActiveIndex) {
      // Delay updating prevActiveIndex to allow animation to use the old value
      const timer = setTimeout(() => {
        setPrevActiveIndex(activeIndex)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [activeIndex, prevActiveIndex, specialButtonIndex, passesThroughSpecial])

  useEffect(() => {
    if (menuOpen) {
      setMenuOpen(false)
    }
    if (categoriesOpen) {
      setCategoriesOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Emit events when menu state changes
  useEffect(() => {
    if (menuOpen) {
      window.dispatchEvent(new Event('mobileDockMenuOpen'))
    } else {
      window.dispatchEvent(new Event('mobileDockMenuClose'))
    }
  }, [menuOpen])

  // Emit events when categories state changes
  useEffect(() => {
    if (categoriesOpen || selectedCategory) {
      window.dispatchEvent(new Event('mobileDockCategoriesOpen'))
    } else {
      window.dispatchEvent(new Event('mobileDockCategoriesClose'))
    }
  }, [categoriesOpen, selectedCategory])

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
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Categories Drawer */}
      <Drawer.Root open={categoriesOpen} onOpenChange={setCategoriesOpen} modal={true}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-gray-50/95 z-30 transition-all duration-300" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-40 flex flex-col rounded-t-3xl max-h-[75vh] border-t border-black/10"
            style={{
              paddingBottom: '84px',
              background: 'white'
            }}
          >
            {/* Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-black/20 mt-4 mb-2" />

            <div className="overflow-y-auto flex-1">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Drawer.Title className="text-lg font-bold text-black">Kategorie</Drawer.Title>
                  <button
                    onClick={() => {
                      triggerHaptic()
                      setCategoriesOpen(false)
                    }}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors duration-300"
                    aria-label="Zamknij menu"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* All categories button */}
                <Link
                  href="/posts"
                  onClick={() => {
                    triggerHaptic()
                    setCategoriesOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors duration-300 bg-[#F5F1E8] text-black hover:bg-brand hover:text-white"
                >
                  <span className="font-medium">Wszystkie kategorie</span>
                </Link>

                {/* Categories list */}
                <div className="space-y-2">
                  {categories.map((cat) => {
                    const hasSubcategories = cat.subcategories && cat.subcategories.length > 0

                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          triggerHaptic()
                          if (hasSubcategories) {
                            // Set selected category first to keep active state
                            setSelectedCategory(cat)
                            // Close categories drawer immediately
                            setCategoriesOpen(false)
                          } else {
                            // Navigate directly to category
                            router.push(`/posts?category=${encodeURIComponent(cat.name.toLowerCase())}`)
                            setCategoriesOpen(false)
                          }
                        }}
                        className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-colors duration-300 bg-[#F5F1E8] text-black hover:bg-brand hover:text-white group"
                      >
                        <CategoryIcon iconName={cat.icon} className="w-6 h-6 text-black/60 group-hover:text-white transition-colors duration-300" />
                        <span className="font-medium flex-1 text-base">{cat.name}</span>
                        {hasSubcategories && (
                          <svg
                            className="w-5 h-5 text-black/40 group-hover:text-white transition-colors duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Category Detail Drawer */}
      <Drawer.Root open={!!selectedCategory} onOpenChange={(open) => {
        if (!open) {
          setSelectedCategory(null)
          setCategoriesOpen(true)
        }
      }} modal={true}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-gray-50/95 z-30 transition-all duration-300" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl max-h-[75vh] border-t border-black/10"
            style={{
              paddingBottom: '84px',
              background: 'white'
            }}
          >
            {/* Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-black/20 mt-4 mb-2" />

            <div className="overflow-y-auto flex-1">
              <div className="p-6 space-y-4">
                {/* Back button */}
                <button
                  onClick={() => {
                    triggerHaptic()
                    setSelectedCategory(null)
                    setCategoriesOpen(true)
                  }}
                  className="flex items-center gap-2 text-black hover:text-[#C44E35] transition-colors mb-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium">Powrót</span>
                </button>

                {/* Title for accessibility */}
                {selectedCategory && (
                  <Drawer.Title className="sr-only">
                    {selectedCategory.name}
                  </Drawer.Title>
                )}

                {/* Main category button */}
                {selectedCategory && (
                  <div className="mb-4">
                    <Link
                      href={`/posts?category=${encodeURIComponent(selectedCategory.name.toLowerCase())}`}
                      onClick={() => {
                        triggerHaptic()
                        setSelectedCategory(null)
                        setCategoriesOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#F5F1E8] hover:bg-brand hover:text-white transition-colors group"
                    >
                      <CategoryIcon iconName={selectedCategory.icon} className="w-6 h-6 text-black/60 group-hover:text-white transition-colors duration-300" />
                      <span className="font-bold text-lg">{selectedCategory.name}</span>
                    </Link>
                  </div>
                )}

                {/* Subcategories */}
                {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
                  <div className="space-y-2">
                    {selectedCategory.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/posts?category=${encodeURIComponent(sub.name.toLowerCase())}`}
                        onClick={() => {
                          triggerHaptic()
                          setSelectedCategory(null)
                          setCategoriesOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-colors bg-[#F5F1E8] text-black hover:bg-brand hover:text-white"
                      >
                        <span className="font-medium text-base">{sub.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Menu Drawer */}
      <Drawer.Root open={menuOpen} onOpenChange={setMenuOpen} modal={true}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-gray-50/95 z-30 transition-all duration-300" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-40 flex flex-col rounded-t-3xl max-h-[80vh] border-t border-black/10"
            style={{
              paddingBottom: '84px',
              background: 'white'
            }}
          >
            {/* Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-black/20 mt-4 mb-2" />

            <div className="overflow-y-auto flex-1">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  {/* User info or Menu title */}
                  {isLoggedIn && user ? (
                    <>
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
                          <Drawer.Title className="font-semibold text-black">{getUserName()}</Drawer.Title>
                          <p className="text-sm text-black/60 truncate max-w-[180px]">{user.email}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Drawer.Title className="text-xl font-bold text-black">Menu</Drawer.Title>
                  )}

                  <button
                    onClick={() => {
                      triggerHaptic()
                      setMenuOpen(false)
                    }}
                    className="text-black/60 hover:text-black transition-colors duration-300 p-2 -mr-2 rounded-full hover:bg-black/5"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 20 20" stroke="currentColor" fill="none">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15L15 5M5 5L15 15" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {menuItems.map((item, index) => {
                    const isActive = pathname === item.href

                    // Handle logout separately
                    if (item.isLogout) {
                      return (
                        <button
                          key={`${item.href}-${index}`}
                          onClick={handleSignOut}
                          className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl font-medium transition-colors duration-300 bg-red-50 hover:bg-red-100 text-red-600"
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
                        onClick={() => {
                          triggerHaptic()
                          if (item.lordicon && iconRefsRef.current[index]) {
                            iconRefsRef.current[index]?.trigger()
                          }
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-6 rounded-2xl font-medium transition-colors duration-300 group",
                          isActive
                            ? "bg-[#F5F1E8] text-black ring-2 ring-[#C44E35]/20"
                            : "bg-[#F5F1E8] text-black hover:bg-brand hover:text-white"
                        )}
                      >
                        <div className="transition-colors duration-300">
                          {item.lordicon ? (
                            <div className={isActive ? "[&_svg]:text-black" : "[&_svg]:text-black group-hover:[&_svg]:text-white"}>
                              <LordIcon
                                ref={(el) => { iconRefsRef.current[index] = el }}
                                src={item.lordicon}
                                size={24}
                                trigger="hover"
                              />
                            </div>
                          ) : (
                            <div className={cn(
                              "transition-colors duration-300",
                              isActive ? "text-black" : "text-black group-hover:text-white"
                            )}>
                              {item.icon}
                            </div>
                          )}
                        </div>
                        <span className={cn(
                          "text-sm transition-colors duration-300",
                          isActive ? "text-black" : "text-black group-hover:text-white"
                        )}>{item.title}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Bottom dock */}
      <motion.div
        initial={false}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: [0.34, 1.25, 0.35, 1] }}
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/5",
          !isMessagePage && "rounded-t-3xl"
        )}
        style={{
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
          zIndex: 9999,
          pointerEvents: 'auto'
        }}
      >
        <div className="relative flex items-center justify-around px-4 py-3 safe-area-inset-bottom">
          {/* Animated indicator background */}
          <motion.div
            className="absolute bg-[#C44E35]/10"
            initial={false}
            animate={
              passesThroughSpecial && activeIndex !== -1 && prevActiveIndex !== -1
                ? {
                    left: [
                      `calc((100% - 32px) / ${dockItems.length} * ${prevActiveIndex} + 16px + (100% - 32px) / ${dockItems.length} / 2 - 18px)`,
                      `calc((100% - 32px) / ${dockItems.length} * ${specialButtonIndex} + 16px + (100% - 32px) / ${dockItems.length} / 2 - 22px)`,
                      `calc((100% - 32px) / ${dockItems.length} * ${activeIndex} + 16px + (100% - 32px) / ${dockItems.length} / 2 - ${isSpecialActive ? '22px' : '18px'})`
                    ],
                    width: [
                      '36px',
                      '44px',
                      isSpecialActive ? '44px' : '36px'
                    ],
                    height: [
                      '36px',
                      '44px',
                      isSpecialActive ? '44px' : '36px'
                    ],
                    borderRadius: [
                      '12px',
                      '50%',
                      isSpecialActive ? '50%' : '12px'
                    ],
                    top: [
                      '12px',
                      '8px',
                      isSpecialActive ? '8px' : '12px'
                    ],
                    opacity: activeIndex !== -1 ? 1 : 0,
                  }
                : {
                    left: activeIndex !== -1
                      ? `calc((100% - 32px) / ${dockItems.length} * ${activeIndex} + 16px + (100% - 32px) / ${dockItems.length} / 2 - ${isSpecialActive ? '22px' : '18px'})`
                      : '0px',
                    width: isSpecialActive ? '44px' : '36px',
                    height: isSpecialActive ? '44px' : '36px',
                    borderRadius: isSpecialActive ? '50%' : '12px',
                    top: isSpecialActive ? '8px' : '12px',
                    opacity: activeIndex !== -1 ? 1 : 0,
                  }
            }
            transition={{
              duration: 0.35,
              ease: [0.34, 1.15, 0.64, 1]
            }}
            style={{ zIndex: 0 }}
          />
          {dockItems.map((item, index) => {
            const isActive = pathname === item.href

            if (item.isCategories) {
              const isCategoriesButtonActive = categoriesOpen || !!selectedCategory
              const shouldBeWhite = isCategoriesButtonActive

              return (
                <button
                  key="categories"
                  onClick={(e) => {
                    e.stopPropagation()
                    triggerHaptic()
                    // Close menu if open
                    if (menuOpen) setMenuOpen(false)
                    // Close selected category if open
                    if (selectedCategory) setSelectedCategory(null)
                    // Toggle categories
                    setCategoriesOpen(!categoriesOpen)
                  }}
                  className="flex flex-col items-center justify-center gap-4 flex-1 relative py-2"
                  style={{ zIndex: 10000, pointerEvents: 'auto' }}
                >
                  <motion.div
                    initial={{ color: 'rgba(0, 0, 0, 0.6)' }}
                    animate={{
                      color: shouldBeWhite ? 'rgb(255, 255, 255)' : 'rgba(0, 0, 0, 0.6)'
                    }}
                    transition={{
                      duration: 0.35,
                      ease: [0.34, 1.15, 0.64, 1]
                    }}
                  >
                    {item.icon}
                  </motion.div>
                  <span className="text-xs leading-none text-black/60">{item.title}</span>
                </button>
              )
            }

            if (item.isMenu) {
              const isMenuButtonActive = menuOpen
              const isOnMenuPage = menuItems.some(menuItem => menuItem.href === pathname)
              // Menu button is white when: menuOpen OR on menu page (but NOT when categories are open)
              const shouldBeWhite = (isMenuButtonActive || isOnMenuPage) && !categoriesOpen && !selectedCategory

              return (
                <button
                  key="menu"
                  onClick={(e) => {
                    e.stopPropagation()
                    triggerHaptic()
                    // Close categories if open
                    if (categoriesOpen) setCategoriesOpen(false)
                    // Close selected category if open
                    if (selectedCategory) setSelectedCategory(null)
                    // Toggle menu
                    setMenuOpen(!menuOpen)
                  }}
                  className="flex flex-col items-center justify-center gap-4 flex-1 relative py-2"
                  style={{ zIndex: 10000, pointerEvents: 'auto' }}
                >
                  <motion.div
                    initial={{ color: 'rgba(0, 0, 0, 0.6)' }}
                    animate={{
                      color: shouldBeWhite ? 'rgb(255, 255, 255)' : 'rgba(0, 0, 0, 0.6)'
                    }}
                    transition={{
                      duration: 0.35,
                      ease: [0.34, 1.15, 0.64, 1]
                    }}
                  >
                    {item.icon}
                  </motion.div>
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
                    <div className="absolute w-11 h-11 bg-[#C44E35]/10 rounded-full shrink-0" />
                    {/* Ikona */}
                    <div className="relative text-black">
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
                <motion.div
                  initial={{ color: 'rgba(0, 0, 0, 0.6)' }}
                  animate={{
                    color: isActive && !menuOpen && !categoriesOpen && !selectedCategory ? 'rgb(255, 255, 255)' : 'rgba(0, 0, 0, 0.6)'
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [0.34, 1.15, 0.64, 1]
                  }}
                >
                  {item.icon}
                </motion.div>
                <span className="text-xs leading-none text-black/60">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </motion.div>
    </>
  )
}
