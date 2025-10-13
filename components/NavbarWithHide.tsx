import { Navbar } from './Navbar'
import { NavbarWrapper } from './NavbarWrapper'
import { User } from '@supabase/supabase-js'

interface NavbarWithHideProps {
  user: User | null
  showAddButton?: boolean
  alwaysVisible?: boolean
  noRounding?: boolean
}

export async function NavbarWithHide({ user, showAddButton = true, alwaysVisible = true, noRounding = false }: NavbarWithHideProps) {
  return (
    <>
      <NavbarWrapper alwaysVisible={alwaysVisible}>
        <Navbar user={user} showAddButton={showAddButton} noRounding={noRounding} />
      </NavbarWrapper>
      <div className="h-[72px]" /> {/* Spacer for fixed navbar */}
    </>
  )
}
