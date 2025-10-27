import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogoWithText } from '@/components/Logo'
import { UserMenu } from '@/components/UserMenu'
import { MessagesIcon } from '@/components/MessagesIcon'
import { FavoritesIcon } from '@/components/FavoritesIcon'
import { MobileNavIcons } from '@/components/MobileNavIcons'
import { NavbarSearchBar } from '@/components/NavbarSearchBar'
import { CategoriesNavButton } from '@/components/CategoriesNavButton'
import { NavbarWrapper } from '@/components/NavbarWrapper'
import { NavbarContent } from '@/components/NavbarContent'
import { User } from '@supabase/supabase-js'
import { getUserRole } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { ReactNode } from 'react'

interface NavbarProps {
  user: User | null
  showAddButton?: boolean
  noRounding?: boolean
  pageTitle?: string
  stepInfo?: ReactNode
}

export async function Navbar({ user, showAddButton = true, noRounding = false, pageTitle, stepInfo }: NavbarProps) {
  const userRole = user ? await getUserRole() : null
  const isAdmin = userRole === 'admin'

  // Fetch user profile if logged in
  let profile = null
  if (user) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url, full_name')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // Fetch categories for the categories button
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug,
      icon,
      subcategories:categories!parent_id(id, name, slug)
    `)
    .is('parent_id', null)
    .order('name')

  return (
    <NavbarWrapper>
      <header>
        <NavbarContent>
        {stepInfo ? (
          <div className="flex items-center gap-3 min-w-0">
            {stepInfo}
            <div className="hidden md:block shrink-0">
              <Link href="/">
                <LogoWithText />
              </Link>
            </div>
          </div>
        ) : pageTitle ? (
          <>
            <h1 className="text-xl font-bold text-black md:hidden">{pageTitle}</h1>
            <div className="hidden md:flex gap-3 items-center min-w-0">
              <div className="shrink-0">
                {categories && categories.length > 0 && (
                  <CategoriesNavButton categories={categories} />
                )}
              </div>
              <Link href="/" className="shrink-0">
                <LogoWithText />
              </Link>
            </div>
          </>
        ) : (
          <div className="hidden md:flex gap-3 items-center min-w-0">
            <div className="shrink-0">
              {categories && categories.length > 0 && (
                <CategoriesNavButton categories={categories} />
              )}
            </div>
            <Link href="/" className="shrink-0">
              <LogoWithText />
            </Link>
          </div>
        )}

        {/* Search Bar - Desktop (centered) */}
        <div className="hidden md:flex items-center justify-center min-w-0">
          <NavbarSearchBar />
        </div>

        {/* Desktop Navigation (right aligned) */}
        <nav className="hidden md:flex gap-2 lg:gap-3 items-center justify-end min-w-0">
          {user ? (
            <>
              {showAddButton && (
                <Link href="/dashboard/my-posts/new" className="shrink-0">
                  <Button className="h-10 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 text-sm px-6 whitespace-nowrap">
                    Dodaj ogłoszenie
                  </Button>
                </Link>
              )}
              <div className="shrink-0">
                <FavoritesIcon user={user} />
              </div>
              <div className="shrink-0">
                <MessagesIcon user={user} />
              </div>
              <div className="shrink-0">
                <UserMenu user={user} profile={profile} isAdmin={isAdmin} />
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="shrink-0">
                <Button variant="ghost" className="h-10 rounded-full hover:bg-black/5 text-sm px-6 whitespace-nowrap">
                  Zaloguj się
                </Button>
              </Link>
              <Link href="/signup" className="shrink-0">
                <Button className="h-10 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 text-sm px-6 whitespace-nowrap">
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
        </NavbarContent>
      </header>
    </NavbarWrapper>
  )
}
