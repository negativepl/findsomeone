import { Navbar } from './Navbar'
import { NavbarWrapper } from './NavbarWrapper'
import { User } from '@supabase/supabase-js'

interface NavbarWithHideProps {
  user: User | null
  showAddButton?: boolean
  alwaysVisible?: boolean
  noRounding?: boolean
  pageTitle?: string
}

export async function NavbarWithHide({ user, showAddButton = true, alwaysVisible = true, noRounding = false, pageTitle }: NavbarWithHideProps) {
  return (
    <>
      <NavbarWrapper alwaysVisible={alwaysVisible}>
        <Navbar user={user} showAddButton={showAddButton} noRounding={noRounding} pageTitle={pageTitle} />
      </NavbarWrapper>
      <div className="h-[60px]" /> {/* Spacer for fixed navbar */}
    </>
  )
}
