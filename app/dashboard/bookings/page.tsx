import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { Metadata } from 'next'
import { BookingsContent } from './BookingsContent'

export const metadata: Metadata = {
  title: "Moje rezerwacje",
}

export default async function BookingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get bookings where user is the provider (incoming bookings)
  const { data: providerBookings } = await supabase
    .from('bookings')
    .select(`
      id,
      scheduled_at,
      status,
      duration_minutes,
      client_notes,
      created_at,
      client:client_id (
        id,
        full_name,
        avatar_url
      ),
      post:post_id (
        id,
        title
      )
    `)
    .eq('provider_id', user.id)
    .order('scheduled_at', { ascending: true })

  // Get bookings where user is the client (outgoing bookings)
  const { data: clientBookings } = await supabase
    .from('bookings')
    .select(`
      id,
      scheduled_at,
      status,
      duration_minutes,
      client_notes,
      created_at,
      provider:provider_id (
        id,
        full_name,
        avatar_url
      ),
      post:post_id (
        id,
        title
      ),
      reviews!reviews_booking_id_fkey (
        id
      )
    `)
    .eq('client_id', user.id)
    .order('scheduled_at', { ascending: true})

  return (
    <div className="min-h-screen bg-background">
      <NavbarWithHide user={user} pageTitle="Moje rezerwacje" />

      <BookingsContent
        userId={user.id}
        providerBookings={providerBookings || []}
        clientBookings={clientBookings || []}
      />

      <Footer />
    </div>
  )
}
