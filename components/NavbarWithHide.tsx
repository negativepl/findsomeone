import { Navbar } from './Navbar'
import { NavbarPortal } from './NavbarPortal'
import { User } from '@supabase/supabase-js'
import { ReactNode } from 'react'

interface NavbarWithHideProps {
  user: User | null
  showAddButton?: boolean
  alwaysVisible?: boolean
  noRounding?: boolean
  mobileOnlyRounding?: boolean
  pageTitle?: string
  stepInfo?: ReactNode
  backUrl?: string
  otherUserId?: string
}

export async function NavbarWithHide({ user, showAddButton = true, alwaysVisible = true, noRounding = false, mobileOnlyRounding = false, pageTitle, stepInfo, backUrl, otherUserId }: NavbarWithHideProps) {
  return (
    <NavbarPortal>
      <Navbar user={user} showAddButton={showAddButton} noRounding={noRounding} mobileOnlyRounding={mobileOnlyRounding} pageTitle={pageTitle} stepInfo={stepInfo} backUrl={backUrl} otherUserId={otherUserId} />
    </NavbarPortal>
  )
}
