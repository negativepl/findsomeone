import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MobileDockWrapper } from '@/components/MobileDockWrapper'
import { Metadata } from 'next'
import { ChangePasswordDialog } from './ChangePasswordDialog'
import { ChangeEmailDialog } from './ChangeEmailDialog'
import { DeleteAccountDialog } from './DeleteAccountDialog'
import { NotificationSettings } from './NotificationSettings'
import { PreferencesSettings } from './PreferencesSettings'

export const metadata: Metadata = {
  title: "Ustawienia",
}

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile for preferences
  const { data: profile } = await supabase
    .from('profiles')
    .select('email_notifications, message_notifications, language, theme')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-20 md:pb-0">
      <NavbarWithHide user={user} />

      <main className="container mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-3">Ustawienia</h1>
          <p className="text-lg text-black/60">
            Zarządzaj swoim kontem i preferencjami
          </p>
        </div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Settings */}
          <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">Konto</CardTitle>
              </div>
              <CardDescription>
                Zarządzaj swoimi danymi i bezpieczeństwem konta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F3]">
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">Email</p>
                  <p className="text-sm text-black/60">{user.email}</p>
                </div>
                <ChangeEmailDialog />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F3]">
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">Hasło</p>
                  <p className="text-sm text-black/60">••••••••</p>
                </div>
                <ChangePasswordDialog />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <CardTitle className="text-xl">Powiadomienia</CardTitle>
              </div>
              <CardDescription>
                Dostosuj preferencje powiadomień
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <NotificationSettings
                emailNotifications={profile?.email_notifications ?? false}
                messageNotifications={profile?.message_notifications ?? false}
              />
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">Prywatność</CardTitle>
              </div>
              <CardDescription>
                Kontroluj widoczność swoich danych
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F3]">
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">Widoczność profilu</p>
                  <p className="text-sm text-black/60">Kto może zobaczyć twój profil</p>
                </div>
                <div className="text-sm text-black/40">(wkrótce)</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F3]">
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">Dane kontaktowe</p>
                  <p className="text-sm text-black/60">Widoczność numeru telefonu</p>
                </div>
                <div className="text-sm text-black/40">(wkrótce)</div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <CardTitle className="text-xl">Preferencje</CardTitle>
              </div>
              <CardDescription>
                Dostosuj wygląd i działanie aplikacji
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <PreferencesSettings
                language={profile?.language ?? 'pl'}
                theme={profile?.theme ?? 'light'}
              />
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-0 rounded-3xl bg-white mt-6">
          <CardHeader>
            <CardTitle className="text-xl text-red-600">Strefa zagrożenia</CardTitle>
            <CardDescription>
              Nieodwracalne akcje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-red-50 border-2 border-red-100">
              <div>
                <p className="font-medium text-red-900 mb-1">Usuń konto</p>
                <p className="text-sm text-red-700">
                  Permanentnie usuń swoje konto i wszystkie dane. Ta akcja jest nieodwracalna.
                </p>
              </div>
              <DeleteAccountDialog />
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
      <MobileDockWrapper user={user} />
    </div>
  )
}
