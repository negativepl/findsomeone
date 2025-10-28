import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogoWithText } from '@/components/Logo'
import { UserMenu } from '@/components/UserMenu'
import { MessagesIcon } from '@/components/MessagesIcon'
import { FavoritesIcon } from '@/components/FavoritesIcon'
import { MobileNavIcons } from '@/components/MobileNavIcons'
import { NavbarSearchWrapper } from '@/components/NavbarSearchWrapper'
import { CategoriesNavButton } from '@/components/CategoriesNavButton'
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
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-black/5 rounded-b-3xl" style={{ zIndex: 9999 }}>
      <div className="container mx-auto px-6">
        <nav className="flex items-center justify-between gap-3 md:gap-4 h-16 md:h-20">
          {/* Left Section */}
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
            <>
              {/* Mobile - Logo only */}
              <Link href="/" className="md:hidden shrink-0">
                <LogoWithText />
              </Link>
              {/* Desktop - Categories + Logo */}
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
          )}

          {/* Center Section - Search Bar (Desktop only) */}
          <div className="hidden md:flex flex-1 justify-center px-4 lg:px-8">
            <NavbarSearchWrapper />
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
            {user ? (
              <>
                {showAddButton && (
                  <Link href="/posts/new">
                    <Button className="bg-[#C44E35] hover:bg-[#B33D2A] text-white font-semibold rounded-full h-10 px-4 lg:px-6 transition-all border-0">
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
                  <Button variant="ghost" className="font-semibold rounded-full h-10 px-4 lg:px-6">
                    Zaloguj
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-[#C44E35] hover:bg-[#B33D2A] text-white font-semibold rounded-full h-10 px-4 lg:px-6 transition-all border-0">
                    Zarejestruj
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Right Section - Mobile */}
          <div className="md:hidden flex items-center gap-1.5">
            <MobileNavIcons user={user} />
          </div>
        </nav>
      </div>
    </header>
  )
}
