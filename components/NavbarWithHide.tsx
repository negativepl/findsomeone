import { Navbar } from './Navbar'
import { NavbarWrapper } from './NavbarWrapper'
import { User } from '@supabase/supabase-js'
import { ReactNode } from 'react'

interface NavbarWithHideProps {
  user: User | null
  showAddButton?: boolean
  alwaysVisible?: boolean
  noRounding?: boolean
  pageTitle?: string
  stepInfo?: ReactNode
}

export async function NavbarWithHide({ user, showAddButton = true, alwaysVisible = true, noRounding = false, pageTitle, stepInfo }: NavbarWithHideProps) {
  return (
    <>
      <NavbarWrapper alwaysVisible={alwaysVisible}>
        <Navbar user={user} showAddButton={showAddButton} noRounding={noRounding} pageTitle={pageTitle} stepInfo={stepInfo} />
      </NavbarWrapper>
      <div className="h-16" /> {/* Spacer for fixed navbar */}
    </>
  )
}
