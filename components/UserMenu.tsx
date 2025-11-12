'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { LordIcon, type LordIconRef } from './LordIcon'

interface UserMenuProps {
  user: User
  profile: { avatar_url: string | null; full_name: string | null } | null
  isAdmin?: boolean
}

interface MenuItemWithIconProps {
  href?: string
  icon?: string // Legacy support
  iconLight?: string // Animation for light mode
  iconDark?: string // Animation for dark mode
  fallbackIcon: React.ReactNode
  children: React.ReactNode
  onClick: () => void
  isButton?: boolean
  className?: string
  dataNavigate?: boolean
}

function MenuItemWithIcon({ href, icon, iconLight, iconDark, fallbackIcon, children, onClick, isButton = false, className = "flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-accent rounded-xl transition-colors", dataNavigate = false }: MenuItemWithIconProps) {
  const iconRef = useRef<LordIconRef>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    // Clear any pending timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    
    setIsHovering(true)
    setIsAnimating(true)
    // Trigger animation after a small delay to ensure LordIcon is mounted
    setTimeout(() => {
      if (iconRef.current) {
        iconRef.current.trigger()
      }
    }, 10)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    // Keep animation visible until it completes (about 1 second for most animations)
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false)
    }, 1000)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  const content = (
    <>
      <div className="w-5 h-5 flex items-center justify-center relative">
        {/* SVG fallback icon - visible by default */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
          style={{ opacity: isAnimating ? 0 : 1 }}
        >
          {fallbackIcon}
        </div>
        {/* Lottie icon - hidden by default, visible when animating */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
          style={{ opacity: isAnimating ? 1 : 0 }}
        >
          <LordIcon ref={iconRef} src={icon} srcLight={iconLight} srcDark={iconDark} size={20} />
        </div>
      </div>
      {children}
    </>
  )

  if (isButton) {
    return (
      <button
        className={className}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-navigate={dataNavigate ? "true" : undefined}
      >
        {content}
      </button>
    )
  }

  return (
    <Link
      href={href!}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {content}
    </Link>
  )
}

export function UserMenu({ user, profile, isAdmin = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Preload LordIcon animations on mount
  useEffect(() => {
    const iconsToPreload = [
      '/icons/home-light.json',
      '/icons/home-dark.json',
      '/icons/newspaper-light.json',
      '/icons/newspaper-dark.json',
      '/icons/account-light.json',
      '/icons/account-dark.json',
      '/icons/settings-light.json',
      '/icons/settings-dark.json',
      '/icons/logout-light.json',
      '/icons/logout-dark.json',
      '/icons/admin-light.json',
      '/icons/admin-dark.json'
    ]
    iconsToPreload.forEach(icon => {
      fetch(icon).catch(() => {}) // Preload but ignore errors
    })
  }, [])

  // Get user initials
  const getInitials = () => {
    const name = profile?.full_name || user.user_metadata?.full_name || user.email || ''
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Get user display name
  const getUserName = () => {
    if (profile?.full_name) return profile.full_name
    if (user.user_metadata?.full_name) return user.user_metadata.full_name
    if (user.email) return user.email.split('@')[0]
    return 'Użytkownik'
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 lg:gap-3 hover:bg-accent rounded-full p-1.5 lg:p-2 transition-all"
      >
        {/* User Avatar */}
        {profile?.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt="Avatar"
            width={40}
            height={40}
            className="w-9 h-9 lg:w-10 lg:h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-brand text-brand-foreground flex items-center justify-center font-bold shrink-0 text-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
            {getInitials()}
          </div>
        )}
        {/* User Name - visible on xl and up */}
        <style>{`
          .user-name-text {
            display: none;
          }
          @media (min-width: 1280px) {
            .user-name-text {
              display: inline !important;
            }
          }
        `}</style>
        <span className="user-name-text text-foreground font-medium text-sm">
          {getUserName()}
        </span>
        {/* Arrow Icon */}
        <svg
          className={`hidden md:block w-4 h-4 text-muted-foreground transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 w-64 bg-card rounded-2xl shadow-lg border border-border py-2 z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">{getUserName()}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>

          <div className="py-1 px-2">
            <MenuItemWithIcon
              href="/dashboard"
              iconLight="/icons/home-light.json"
              iconDark="/icons/home-dark.json"
              fallbackIcon={
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19.5 8.329a.25.25 0 0 0-.125-.217l-7.25-4.174a.25.25 0 0 0-.25 0l-7.25 4.174a.25.25 0 0 0-.125.217V19.25c0 .139.112.25.25.25h4a.25.25 0 0 0 .25-.25v-5.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v5.5c0 .139.112.25.25.25h4a.25.25 0 0 0 .25-.25zM21 19.25A1.75 1.75 0 0 1 19.25 21h-4a1.75 1.75 0 0 1-1.75-1.75V14.5h-3v4.75A1.75 1.75 0 0 1 8.75 21h-4A1.75 1.75 0 0 1 3 19.25V8.33c0-.626.334-1.205.877-1.517l7.25-4.174a1.75 1.75 0 0 1 1.746 0l7.25 4.174c.543.312.877.89.877 1.517z"/>
                </svg>
              }
              onClick={() => setIsOpen(false)}
            >
              Moje konto
            </MenuItemWithIcon>

            <MenuItemWithIcon
              href="/dashboard/my-posts"
              iconLight="/icons/newspaper-light.json"
              iconDark="/icons/newspaper-dark.json"
              fallbackIcon={
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <g clipPath="url(#N3FWNfAbPsa)">
                    <mask id="f8zVey1FfYb" width="19" height="19" x="3" y="3" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
                      <path fill="#D9D9D9" fillRule="evenodd" d="M22 3H3v19h19zm-1.5 7h-5v8a2.5 2.5 0 0 0 5 0z" clipRule="evenodd"/>
                    </mask>
                    <g mask="url(#f8zVey1FfYb)">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 20.5H6.5A2.5 2.5 0 0 1 4 18V4h11.5v6z"/>
                    </g>
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.5 10h5v8a2.5 2.5 0 0 1-5 0zm-3-3H7v3.5h5.5zM7 13.5h5.5M7 16.56h5.5"/>
                  </g>
                  <defs>
                    <clipPath id="N3FWNfAbPsa">
                      <path fill="currentColor" d="M0 0h24v24H0z"/>
                    </clipPath>
                  </defs>
                </svg>
              }
              onClick={() => setIsOpen(false)}
            >
              Moje ogłoszenia
            </MenuItemWithIcon>

            <MenuItemWithIcon
              href="/dashboard/profile"
              iconLight="/icons/account-light.json"
              iconDark="/icons/account-dark.json"
              fallbackIcon={
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
                    <path d="M12 5.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8M12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5"/>
                    <path d="M12 2c5.523 0 10 4.477 10 10a9.97 9.97 0 0 1-3.316 7.436l-.012.01A9.96 9.96 0 0 1 12 22C6.477 22 2 17.523 2 12S6.477 2 12 2M9.75 16.5a3.25 3.25 0 0 0-3.053 2.14A8.46 8.46 0 0 0 12 20.5a8.46 8.46 0 0 0 5.303-1.86 3.25 3.25 0 0 0-3.053-2.14zM12 3.5a8.5 8.5 0 0 0-6.45 14.032A4.75 4.75 0 0 1 9.75 15h4.5a4.75 4.75 0 0 1 4.2 2.532A8.46 8.46 0 0 0 20.5 12 8.5 8.5 0 0 0 12 3.5"/>
                  </g>
                </svg>
              }
              onClick={() => setIsOpen(false)}
            >
              Mój profil
            </MenuItemWithIcon>

            <MenuItemWithIcon
              href="/dashboard/settings"
              iconLight="/icons/settings-light.json"
              iconDark="/icons/settings-dark.json"
              fallbackIcon={
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <g clipPath="url(#vx0YN8sIZ7a)">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m20.652 14.43-1.61-.93c.11-.48.16-.99.16-1.5s-.05-1.02-.16-1.5l1.61-.93c.24-.13.32-.44.19-.68l-1.75-3.03a.505.505 0 0 0-.69-.18l-1.62.94c-.74-.68-1.61-1.2-2.58-1.5V3.25c0-.28-.22-.5-.5-.5h-3.5c-.28 0-.5.22-.5.5v1.87c-.97.3-1.84.82-2.58 1.5l-1.62-.94a.505.505 0 0 0-.69.18l-1.75 3.03c-.13.24-.05.55.19.68l1.61.93c-.11.48-.16.99-.16 1.5s.05 1.02.16 1.5l-1.61.93c-.24.13-.32.44-.19.68l1.75 3.03c.14.24.45.32.69.18l1.62-.94c.74.68 1.61 1.2 2.58 1.5v1.87c0 .28.22.5.5.5h3.5c.28 0 .5-.22.5-.5v-1.87c.97-.3 1.84-.82 2.58-1.5l1.62.94c.24.14.55.06.69-.18l1.75-3.03c.13-.24.05-.55-.19-.68m-5.56-1.59c-.08.27-.18.54-.33.78-.28.5-.69.91-1.19 1.19a3.15 3.15 0 0 1-1.62.44 3.15 3.15 0 0 1-1.62-.44c-.5-.28-.91-.69-1.19-1.19a3.15 3.15 0 0 1-.44-1.62 3.15 3.15 0 0 1 .44-1.62c.28-.5.69-.91 1.19-1.19a3.15 3.15 0 0 1 1.62-.44 3.15 3.15 0 0 1 1.62.44c.5.28.91.69 1.19 1.19a3.15 3.15 0 0 1 .44 1.62c0 .29-.04.57-.11.84"/>
                  </g>
                  <defs>
                    <clipPath id="vx0YN8sIZ7a">
                      <path fill="currentColor" d="M0 0h24v24H0z"/>
                    </clipPath>
                  </defs>
                </svg>
              }
              onClick={() => setIsOpen(false)}
            >
              Ustawienia
            </MenuItemWithIcon>
          </div>

          {isAdmin && (
            <div className="border-t border-border pt-1 mt-1 px-2">
              <MenuItemWithIcon
                href="/admin"
                icon="/icons/admin.json"
                fallbackIcon={
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="#c44e35" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 6.25S10 5 12 3.75c2 1.25 8.251 2.5 8.251 2.5-.911 6.09-2.961 10.6-8.251 14-5.25-3.4-7.6-7.91-8.25-14Z"/>
                  </svg>
                }
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-brand hover:bg-accent rounded-xl transition-colors font-medium"
              >
                Panel administracyjny
              </MenuItemWithIcon>
            </div>
          )}

          <div className="border-t border-border pt-1 mt-1 px-2">
            <MenuItemWithIcon
              icon="/icons/logout.json"
              fallbackIcon={
                <svg className="w-5 h-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" clipPath="url(#er_gIUdBqMa)">
                    <path d="M16 16.25 20.25 12 16 7.75M20.25 12H8.75m4.5 8.25h-7.5c-1.1 0-2-.9-2-2V5.75c0-1.1.9-2 2-2h7.5"/>
                  </g>
                  <defs>
                    <clipPath id="er_gIUdBqMa">
                      <path fill="currentColor" d="M0 0h24v24H0z"/>
                    </clipPath>
                  </defs>
                </svg>
              }
              onClick={handleSignOut}
              isButton={true}
              dataNavigate={true}
              className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-accent rounded-xl transition-colors"
            >
              Wyloguj się
            </MenuItemWithIcon>
          </div>
        </div>
      )}
    </div>
  )
}
