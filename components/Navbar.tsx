import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogoWithText } from '@/components/Logo'
import { UserMenu } from '@/components/UserMenu'
import { MessagesIcon } from '@/components/MessagesIcon'
import { FavoritesIcon } from '@/components/FavoritesIcon'
import { MobileNavIcons } from '@/components/MobileNavIcons'
import { User } from '@supabase/supabase-js'
import { getUserRole } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'

interface NavbarProps {
  user: User | null
  showAddButton?: boolean
}

export async function Navbar({ user, showAddButton = true }: NavbarProps) {
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

  return (
    <header className="border-b border-black/5 bg-white rounded-b-3xl">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-5 flex justify-between items-center">
        <Link href="/">
          <LogoWithText />
        </Link>

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

        {/* Mobile Navigation - Icons with Avatar or Login */}
        <div className="md:hidden flex items-center gap-1.5">
          {/* Mobile Nav Icons (Search, Messages, Favorites) */}
          <MobileNavIcons user={user} />

          {user ? (
            /* User Menu Avatar */
            <div className="transform scale-[0.85] origin-center">
              <UserMenu user={user} profile={profile} isAdmin={isAdmin} />
            </div>
          ) : (
            /* Login button for non-authenticated users */
            <Link href="/login">
              <Button variant="ghost" className="h-8 rounded-full hover:bg-black/5 text-xs px-3 py-1">
                Zaloguj
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
