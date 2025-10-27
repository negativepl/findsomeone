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
  const router = useRouter()

  // Pobierz inicjały użytkownika
  const getInitials = () => {
    const name = profile?.full_name || user.user_metadata?.full_name || user.email || ''
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Pobierz nazwę użytkownika
  const getUserName = () => {
    return profile?.full_name || user.user_metadata?.full_name || user.email || 'Użytkownik'
  }

  // Zamknij menu gdy klikniemy poza nim
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
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center hover:bg-black/5 rounded-full h-10 pl-0 pr-2 md:pr-3 transition-all shrink-0"
        style={{ gap: '0.75rem' }}
      >
        {/* Avatar */}
        {profile?.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt=""
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#C44E35] text-white flex items-center justify-center font-bold shrink-0" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
            {getInitials()}
          </div>
        )}
        {/* Nazwa użytkownika - ukryta na mobile i gdy navbar scrolled */}
        <span
          className="hidden md:block text-black font-medium user-name-text"
          style={{
            maxWidth: 'calc(200px * (1 - var(--scroll-progress, 0)))',
            opacity: `calc(1 - var(--scroll-progress, 0))`,
          }}
        >
          {getUserName()}
        </span>
        {/* Strzałka w dół - widoczna zawsze */}
        <svg
          className={`w-4 h-4 text-black/60 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
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
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-black/10">
            <p className="font-semibold text-black">{getUserName()}</p>
            <p className="text-sm text-black/60 truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/posts"
              className="block px-4 py-2 hover:bg-black/5 transition-colors text-black"
              onClick={() => setIsOpen(false)}
            >
              Ogłoszenia
            </Link>

            <Link
              href="/dashboard"
              className="block px-4 py-2 hover:bg-black/5 transition-colors text-black"
              onClick={() => setIsOpen(false)}
            >
              Moje konto
            </Link>

            <Link
              href="/dashboard/my-posts"
              className="block px-4 py-2 hover:bg-black/5 transition-colors text-black"
              onClick={() => setIsOpen(false)}
            >
              Moje ogłoszenia
            </Link>

            <Link
              href="/dashboard/profile"
              className="block px-4 py-2 hover:bg-black/5 transition-colors text-black"
              onClick={() => setIsOpen(false)}
            >
              Profil
            </Link>

            <Link
              href="/dashboard/settings"
              className="block px-4 py-2 hover:bg-black/5 transition-colors text-black"
              onClick={() => setIsOpen(false)}
            >
              Ustawienia
            </Link>
          </div>

          {/* Admin Panel - tylko dla adminów */}
          {isAdmin && (
            <>
              <div className="border-t border-black/10 mt-0 mb-2" />
              <Link
                href="/admin"
                className="block px-4 py-2 hover:bg-red-50 transition-colors text-red-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Panel administracyjny
              </Link>
            </>
          )}

          {/* Separator */}
          <div className="border-t border-black/10 my-2" />

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="block px-4 py-2 hover:bg-red-50 transition-colors w-full text-left text-red-600"
          >
            Wyloguj się
          </button>
        </div>
      )}
    </div>
  )
}
