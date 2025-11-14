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

interface Subcategory {
  id: string
  name: string
  slug: string
  subcategories?: { id: string; name: string; slug: string }[]
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  subcategories?: Subcategory[]
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
      icon: <img src="/icons/login.svg" alt="" className="w-6 h-6" />,
      requiresAuth: false,
      hideWhenLoggedIn: true
    },
    {
      title: 'Rejestracja',
      href: '/signup',
      icon: <img src="/icons/signup.svg" alt="" className="w-6 h-6" />,
      requiresAuth: false,
      hideWhenLoggedIn: true
    },
    {
      title: 'Wyloguj się',
      href: '#logout',
      icon: <img src="/icons/logout.svg" alt="" className="w-6 h-6" />,
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
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)
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
    // If categories modal or selected category/subcategory is open, show indicator under Categories button (highest priority)
    if (categoriesOpen || selectedCategory || selectedSubcategory) {
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
    if (selectedCategory) {
      setSelectedCategory(null)
    }
    if (selectedSubcategory) {
      setSelectedSubcategory(null)
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
    if (categoriesOpen || selectedCategory || selectedSubcategory) {
      window.dispatchEvent(new Event('mobileDockCategoriesOpen'))
    } else {
      window.dispatchEvent(new Event('mobileDockCategoriesClose'))
    }
  }, [categoriesOpen, selectedCategory, selectedSubcategory])

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
          <Drawer.Overlay className="fixed inset-0 bg-background/95 z-30 transition-all duration-300" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-[60] flex flex-col rounded-t-3xl max-h-[75vh] border-t border-border bg-card"
            style={{
              paddingBottom: '84px'
            }}
          >
            {/* Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/30 mt-4 mb-2" />

            <div className="overflow-y-auto flex-1">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Drawer.Title className="text-lg font-bold text-foreground">Kategorie</Drawer.Title>
                  <button
                    onClick={() => {
                      triggerHaptic()
                      setCategoriesOpen(false)
                    }}
                    className="p-2 hover:bg-muted rounded-full transition-colors duration-300 text-foreground"
                    aria-label="Zamknij menu"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* All categories button */}
                <Link
                  href="/results"
                  onClick={() => {
                    triggerHaptic()
                    setCategoriesOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors duration-300 bg-muted text-foreground hover:bg-brand hover:text-white"
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
                            router.push(`/results?category=${encodeURIComponent(cat.name.toLowerCase())}`)
                            setCategoriesOpen(false)
                          }
                        }}
                        className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-colors duration-300 bg-muted text-foreground hover:bg-brand hover:text-white group"
                      >
                        <CategoryIcon iconName={cat.icon} className="w-6 h-6 text-muted-foreground group-hover:text-white transition-colors duration-300" />
                        <span className="font-medium flex-1 text-base">{cat.name}</span>
                        {hasSubcategories && (
                          <svg
                            className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors duration-300"
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
      <Drawer.Root open={!!selectedCategory && !selectedSubcategory} onOpenChange={(open) => {
        if (!open) {
          setSelectedCategory(null)
          setCategoriesOpen(true)
        }
      }} modal={true}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-background/95 z-30 transition-all duration-300" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-[60] flex flex-col rounded-t-3xl max-h-[75vh] border-t border-border bg-card"
            style={{
              paddingBottom: '84px'
            }}
          >
            {/* Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/30 mt-4 mb-2" />

            <div className="overflow-y-auto flex-1">
              <div className="p-6 space-y-4">
                {/* Back button */}
                <button
                  onClick={() => {
                    triggerHaptic()
                    setSelectedCategory(null)
                    setCategoriesOpen(true)
                  }}
                  className="flex items-center gap-2 text-foreground hover:text-brand transition-colors mb-2"
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
                      href={`/results?category=${encodeURIComponent(selectedCategory.name.toLowerCase())}`}
                      onClick={() => {
                        triggerHaptic()
                        setSelectedCategory(null)
                        setCategoriesOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted text-foreground hover:bg-brand hover:text-white transition-colors group"
                    >
                      <CategoryIcon iconName={selectedCategory.icon} className="w-6 h-6 text-muted-foreground group-hover:text-white transition-colors duration-300" />
                      <span className="font-bold text-lg">{selectedCategory.name}</span>
                    </Link>
                  </div>
                )}

                {/* Subcategories */}
                {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
                  <div className="space-y-2">
                    {selectedCategory.subcategories.map((sub) => {
                      const hasSubSubcategories = sub.subcategories && sub.subcategories.length > 0

                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            triggerHaptic()
                            if (hasSubSubcategories) {
                              // Open third level and close current
                              setSelectedSubcategory(sub)
                              // Don't close selectedCategory yet - we'll handle it in the drawer
                            } else {
                              // Navigate directly
                              router.push(`/results?category=${encodeURIComponent(sub.name.toLowerCase())}`)
                              setSelectedCategory(null)
                              setCategoriesOpen(false)
                            }
                          }}
                          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-colors bg-muted text-foreground hover:bg-brand hover:text-white group"
                        >
                          <span className="font-medium text-base flex-1">{sub.name}</span>
                          {hasSubSubcategories && (
                            <svg
                              className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors duration-300"
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
                )}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Subcategory Detail Drawer (Third Level) */}
      <Drawer.Root open={!!selectedSubcategory} onOpenChange={(open) => {
        if (!open) {
          setSelectedSubcategory(null)
          // Category drawer will automatically reopen since selectedCategory is still set
        }
      }} modal={true}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-background/95 z-40 transition-all duration-300" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col rounded-t-3xl max-h-[75vh] border-t border-border bg-card"
            style={{
              paddingBottom: '84px'
            }}
          >
            {/* Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/30 mt-4 mb-2" />

            <div className="overflow-y-auto flex-1">
              <div className="p-6 space-y-4">
                {/* Back button */}
                <button
                  onClick={() => {
                    triggerHaptic()
                    setSelectedSubcategory(null)
                  }}
                  className="flex items-center gap-2 text-foreground hover:text-brand transition-colors mb-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium">Powrót</span>
                </button>

                {/* Title for accessibility */}
                {selectedSubcategory && (
                  <Drawer.Title className="sr-only">
                    {selectedSubcategory.name}
                  </Drawer.Title>
                )}

                {/* Main subcategory button */}
                {selectedSubcategory && (
                  <div className="mb-4">
                    <Link
                      href={`/results?category=${encodeURIComponent(selectedSubcategory.name.toLowerCase())}`}
                      onClick={() => {
                        triggerHaptic()
                        setSelectedSubcategory(null)
                        setSelectedCategory(null)
                        setCategoriesOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted text-foreground hover:bg-brand hover:text-white transition-colors group"
                    >
                      <span className="font-bold text-lg">{selectedSubcategory.name}</span>
                    </Link>
                  </div>
                )}

                {/* Sub-subcategories */}
                {selectedSubcategory?.subcategories && selectedSubcategory.subcategories.length > 0 && (
                  <div className="space-y-2">
                    {selectedSubcategory.subcategories.map((subsub) => (
                      <Link
                        key={subsub.id}
                        href={`/results?category=${encodeURIComponent(subsub.name.toLowerCase())}`}
                        onClick={() => {
                          triggerHaptic()
                          setSelectedSubcategory(null)
                          setSelectedCategory(null)
                          setCategoriesOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-colors bg-muted text-foreground hover:bg-brand hover:text-white"
                      >
                        <span className="font-medium text-base">{subsub.name}</span>
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
          <Drawer.Overlay className="fixed inset-0 bg-background/95 z-30 transition-all duration-300" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-[60] flex flex-col rounded-t-3xl max-h-[80vh] border-t border-border bg-card"
            style={{
              paddingBottom: '84px'
            }}
          >
            {/* Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/30 mt-4 mb-2" />

            <div className="overflow-y-auto flex-1">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  {/* User info or Menu title */}
                  {isLoggedIn && user ? (
                    <>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Avatar */}
                        {profile?.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt=""
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-brand text-brand-foreground flex items-center justify-center font-bold text-lg flex-shrink-0" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                            {getInitials()}
                          </div>
                        )}
                        {/* User info */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <Drawer.Title className="font-semibold text-foreground truncate">{getUserName()}</Drawer.Title>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Drawer.Title className="text-xl font-bold text-foreground">Menu</Drawer.Title>
                  )}

                  <button
                    onClick={() => {
                      triggerHaptic()
                      setMenuOpen(false)
                    }}
                    className="p-2 hover:bg-muted rounded-full transition-colors duration-300 text-foreground"
                    aria-label="Zamknij menu"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
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
                          className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl font-medium transition-colors duration-300 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                        >
                          <div className="menu-icon-red">
                            {item.icon}
                          </div>
                          <span className="text-sm text-red-600 dark:text-red-400">{item.title}</span>
                        </button>
                      )
                    }

                    return (
                      <Link
                        key={`${item.href}-${index}`}
                        href={item.href}
                        onClick={() => {
                          triggerHaptic()
                          if ('lordicon' in item && item.lordicon && iconRefsRef.current[index]) {
                            iconRefsRef.current[index]?.trigger()
                          }
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-6 rounded-2xl font-medium transition-colors duration-300 group",
                          isActive
                            ? "bg-muted text-foreground ring-2 ring-brand/20"
                            : "bg-muted text-foreground hover:bg-brand hover:text-white"
                        )}
                      >
                        <div className="transition-colors duration-300">
                          {'lordicon' in item && item.lordicon ? (
                            <div className={isActive ? "[&_svg]:text-foreground" : "[&_svg]:text-foreground group-hover:[&_svg]:text-white"}>
                              <LordIcon
                                ref={(el) => { iconRefsRef.current[index] = el }}
                                src={(item as any).lordicon}
                                size={24}
                              />
                            </div>
                          ) : (
                            <div className={cn(
                              "menu-icon-base transition-colors duration-300",
                              isActive ? "text-foreground" : "text-foreground group-hover:text-white"
                            )}>
                              {item.icon}
                            </div>
                          )}
                        </div>
                        <span className={cn(
                          "text-sm transition-colors duration-300",
                          isActive ? "text-foreground" : "text-foreground group-hover:text-white"
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
        data-mobile-dock
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border",
          !isMessagePage && "rounded-t-3xl"
        )}
        style={{
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
          zIndex: 9999,
          pointerEvents: 'auto'
        }}
      >
        <div className="relative flex items-center justify-around px-4 py-3">
          {/* Animated indicator background */}
          <motion.div
            className="absolute bg-brand"
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
              const isCategoriesButtonActive = categoriesOpen || !!selectedCategory || !!selectedSubcategory
              const shouldBeWhite = isCategoriesButtonActive

              return (
                <button
                  key="categories"
                  onClick={(e) => {
                    e.stopPropagation()
                    triggerHaptic()
                    // Close menu if open
                    if (menuOpen) setMenuOpen(false)
                    // Close selected category and subcategory if open
                    if (selectedCategory) setSelectedCategory(null)
                    if (selectedSubcategory) setSelectedSubcategory(null)
                    // Toggle categories
                    setCategoriesOpen(!categoriesOpen)
                  }}
                  className="flex flex-col items-center justify-center gap-4 flex-1 relative py-2"
                  style={{ zIndex: 10000, pointerEvents: 'auto' }}
                >
                  <div className="relative">
                    {/* Ikona - bazowa */}
                    <div className="dock-icon-base">
                      {item.icon}
                    </div>
                    {/* Biała ikona - overlay */}
                    <motion.div
                      className="absolute inset-0"
                      initial={false}
                      animate={{
                        opacity: shouldBeWhite ? 1 : 0
                      }}
                      transition={{
                        duration: 0.35,
                        ease: [0.34, 1.15, 0.64, 1]
                      }}
                      style={{ filter: 'brightness(0) invert(1)' }}
                    >
                      {item.icon}
                    </motion.div>
                  </div>
                  <span className="text-xs leading-none text-muted-foreground">{item.title}</span>
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
                  <div className="relative">
                    {/* Ikona - bazowa */}
                    <div className="dock-icon-base">
                      {item.icon}
                    </div>
                    {/* Biała ikona - overlay */}
                    <motion.div
                      className="absolute inset-0"
                      initial={false}
                      animate={{
                        opacity: shouldBeWhite ? 1 : 0
                      }}
                      transition={{
                        duration: 0.35,
                        ease: [0.34, 1.15, 0.64, 1]
                      }}
                      style={{ filter: 'brightness(0) invert(1)' }}
                    >
                      {item.icon}
                    </motion.div>
                  </div>
                  <span className="text-xs leading-none text-muted-foreground">{item.title}</span>
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
                    <motion.div
                      className="relative"
                      initial={{ filter: 'brightness(0) invert(1)' }}
                      animate={{
                        filter: 'brightness(0) invert(1)'
                      }}
                    >
                      {item.icon}
                    </motion.div>
                  </div>
                  <span className="text-xs leading-none text-muted-foreground">{item.title}</span>
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
                <div className="relative">
                  {/* Ikona - bazowa */}
                  <div className="dock-icon-base">
                    {item.icon}
                  </div>
                  {/* Biała ikona - overlay */}
                  <motion.div
                    className="absolute inset-0"
                    initial={false}
                    animate={{
                      opacity: isActive && !menuOpen && !categoriesOpen && !selectedCategory ? 1 : 0
                    }}
                    transition={{
                      duration: 0.35,
                      ease: [0.34, 1.15, 0.64, 1]
                    }}
                    style={{ filter: 'brightness(0) invert(1)' }}
                  >
                    {item.icon}
                  </motion.div>
                </div>
                <span className="text-xs leading-none text-muted-foreground">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </motion.div>
    </>
  )
}
