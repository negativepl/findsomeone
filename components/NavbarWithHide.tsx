import { Navbar } from './Navbar'
import { NavbarPortal } from './NavbarPortal'
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
      <NavbarPortal>
        <Navbar user={user} showAddButton={showAddButton} noRounding={noRounding} pageTitle={pageTitle} stepInfo={stepInfo} />
      </NavbarPortal>
      <div className="h-16 md:h-24" /> {/* Spacer for fixed navbar */}
    </>
  )
}
