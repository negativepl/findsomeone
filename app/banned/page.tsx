import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { Ban } from 'lucide-react'

export const metadata: Metadata = {
  title: "Konto zablokowane",
}

export default async function BannedPage({
  searchParams,
}: {
  searchParams: { reason?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is actually banned
  const { data: profile } = await supabase
    .from('profiles')
    .select('banned, ban_reason, banned_at')
    .eq('id', user.id)
    .single()

  if (!profile?.banned) {
    // User is not banned, redirect to dashboard
    redirect('/dashboard')
  }

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <Ban className="w-10 h-10 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-black mb-4">
            Konto zablokowane
          </h1>

          {/* Reason */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-sm font-semibold text-red-900 mb-2">
              Powód blokady:
            </p>
            <p className="text-red-800">
              {profile.ban_reason || searchParams.reason || 'Naruszenie regulaminu platformy'}
            </p>
          </div>

          {/* Info */}
          <p className="text-black/70 mb-6">
            Twoje konto zostało zablokowane przez administratora.
            Jeśli uważasz, że to pomyłka, skontaktuj się z nami.
          </p>

          {/* Date */}
          {profile.banned_at && (
            <p className="text-sm text-black/50 mb-6">
              Data blokady: {new Date(profile.banned_at).toLocaleDateString('pl-PL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <a
              href="/contact"
              className="block px-6 py-3 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white font-semibold transition-colors"
            >
              Skontaktuj się z nami
            </a>

            <form action={handleSignOut}>
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-full border border-black/10 hover:bg-black/5 text-black font-semibold transition-colors"
              >
                Wyloguj się
              </button>
            </form>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-black/60">
            Przeczytaj nasz <a href="/terms" className="text-[#C44E35] hover:underline">regulamin</a> i{' '}
            <a href="/privacy" className="text-[#C44E35] hover:underline">politykę prywatności</a>
          </p>
        </div>
      </div>
    </div>
  )
}
