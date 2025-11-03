import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { ProfileClient } from './ProfileClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Mój profil",
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <NavbarWithHide user={user} pageTitle="Mój profil" />
      <ProfileClient initialUser={user} initialProfile={profile} />
      <Footer />
    </div>
  )
}
