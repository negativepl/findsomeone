'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogoWithText } from '@/components/Logo'
import { UserMenu } from '@/components/UserMenu'
import { MessagesIcon } from '@/components/MessagesIcon'
import { FavoritesIcon } from '@/components/FavoritesIcon'
import { MobileNavIcons } from '@/components/MobileNavIcons'
import { NavbarSearchBar } from '@/components/NavbarSearchBar'
import { User } from '@supabase/supabase-js'
import { ReactNode } from 'react'

interface NavbarClientProps {
  user: User | null
  showAddButton?: boolean
  noRounding?: boolean
  pageTitle?: string
  stepInfo?: ReactNode
  profile?: { avatar_url: string | null; full_name: string | null } | null
  isAdmin?: boolean
}

export function NavbarClient({ user, showAddButton = true, noRounding = false, pageTitle, stepInfo, profile, isAdmin = false }: NavbarClientProps) {
  return (
    <header className={`border-b border-black/5 bg-white ${noRounding ? '' : 'rounded-b-3xl'}`}>
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 flex justify-between items-center gap-4">
        {stepInfo ? (
          <>
            {stepInfo}
            <div className="hidden md:block">
              <Link href="/">
                <LogoWithText />
              </Link>
            </div>
          </>
        ) : pageTitle ? (
          <>
            <h1 className="text-xl font-bold text-black md:hidden">{pageTitle}</h1>
            <div className="hidden md:block">
              <Link href="/">
                <LogoWithText />
              </Link>
            </div>
          </>
        ) : (
          <Link href="/">
            <LogoWithText />
          </Link>
        )}

        {/* Search Bar - Desktop */}
        <NavbarSearchBar />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-2 lg:gap-3 items-center">
          {user ? (
            <>
              {showAddButton && (
                <Link href="/dashboard/posts/new">
                  <Button className="h-10 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 text-sm px-6">
                    Dodaj ogłoszenie
                  </Button>
                </Link>
              )}
              <FavoritesIcon user={user} />
              <MessagesIcon user={user} />
              <UserMenu user={user} profile={profile} isAdmin={isAdmin} />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="h-10 rounded-full hover:bg-black/5 text-sm px-6">
                  Zaloguj się
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="h-10 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 text-sm px-6">
                  Zarejestruj się
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation - Icons only */}
        <div className="md:hidden flex items-center gap-1.5">
          {/* Mobile Nav Icons (Search, Messages, Favorites) */}
          <MobileNavIcons user={user} />
        </div>
      </div>
    </header>
  )
}
