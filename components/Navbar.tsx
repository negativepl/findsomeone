import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogoWithText } from '@/components/Logo'
import { UserMenu } from '@/components/UserMenu'
import { MessagesIcon } from '@/components/MessagesIcon'
import { FavoritesIcon } from '@/components/FavoritesIcon'
import { MobileNavIcons } from '@/components/MobileNavIcons'
import { NavbarSearchBar } from '@/components/NavbarSearchBar'
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

        {/* Categories Button + Search Bar - Desktop */}
        <div className="hidden md:flex gap-2 items-center flex-1 max-w-2xl">
          {categories && categories.length > 0 && (
            <CategoriesNavButton categories={categories} />
          )}
          <NavbarSearchBar />
        </div>

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
