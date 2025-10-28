'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface UserMenuProps {
  user: User
  profile: { avatar_url: string | null; full_name: string | null } | null
  isAdmin?: boolean
}

export function UserMenu({ user, profile, isAdmin = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

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

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200) // 200ms delay before closing
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 lg:gap-3 hover:bg-black/5 rounded-full p-1.5 lg:p-2 transition-all"
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
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-[#C44E35] text-white flex items-center justify-center font-bold shrink-0 text-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
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
        <span className="user-name-text text-black font-medium text-sm">
          {getUserName()}
        </span>
        {/* Arrow Icon */}
        <svg
          className={`hidden lg:block w-4 h-4 text-black/60 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-black/10 py-2 z-50">
          <div className="px-4 py-3 border-b border-black/5">
            <p className="text-sm font-semibold text-black">{getUserName()}</p>
            <p className="text-xs text-black/60 truncate">{user.email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard/my-posts"
              className="block px-4 py-2.5 text-sm text-black hover:bg-black/5 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Moje ogłoszenia
            </Link>

            <Link
              href="/dashboard/profile"
              className="block px-4 py-2.5 text-sm text-black hover:bg-black/5 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Profil
            </Link>

            <Link
              href="/dashboard/settings"
              className="block px-4 py-2.5 text-sm text-black hover:bg-black/5 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Ustawienia
            </Link>
          </div>

          {isAdmin && (
            <div className="border-t border-black/5 pt-1 mt-1">
              <Link
                href="/admin"
                className="block px-4 py-2.5 text-sm text-[#C44E35] hover:bg-[#C44E35]/5 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Panel administracyjny
              </Link>
            </div>
          )}

          <div className="border-t border-black/5 pt-1 mt-1">
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Wyloguj się
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
