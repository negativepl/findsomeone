import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
    <div className="min-h-screen bg-[#FAF8F3]">
      <NavbarWithHide user={user} pageTitle="Ustawienia" />

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-16">
        {/* Header */}
        <div className="mb-8 hidden md:block">
          <h1 className="text-2xl md:text-4xl font-bold text-black mb-3">Ustawienia</h1>
          <p className="text-base md:text-lg text-black/60">
            Zarządzaj swoim kontem i preferencjami
          </p>
        </div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 gap-6">
          {/* Account Settings */}
          <Card className="border-0 rounded-3xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-black">Konto</CardTitle>
              <CardDescription className="text-base text-black/60">
                Zarządzaj swoimi danymi i bezpieczeństwem konta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-[#FAF8F3]">
                <div className="flex-1">
                  <p className="text-base font-semibold text-black mb-1">Email</p>
                  <p className="text-sm text-black/60">{user.email}</p>
                </div>
                <ChangeEmailDialog />
              </div>
              <div className="flex items-center justify-between p-5 rounded-2xl bg-[#FAF8F3]">
                <div className="flex-1">
                  <p className="text-base font-semibold text-black mb-1">Hasło</p>
                  <p className="text-sm text-black/60">••••••••</p>
                </div>
                <ChangePasswordDialog />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-0 rounded-3xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-black">Powiadomienia</CardTitle>
              <CardDescription className="text-base text-black/60">
                Dostosuj preferencje powiadomień
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <NotificationSettings
                emailNotifications={profile?.email_notifications ?? false}
                messageNotifications={profile?.message_notifications ?? false}
              />
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border-0 rounded-3xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-black">Preferencje</CardTitle>
              <CardDescription className="text-base text-black/60">
                Dostosuj wygląd i działanie aplikacji
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <PreferencesSettings
                language={profile?.language ?? 'pl'}
                theme={profile?.theme ?? 'light'}
              />
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-0 rounded-3xl bg-white shadow-sm mt-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-red-600">Strefa zagrożenia</CardTitle>
            <CardDescription className="text-base text-red-700">
              Nieodwracalne akcje - zachowaj ostrożność
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-red-50 border-2 border-red-100">
              <div className="flex-1">
                <p className="text-lg font-semibold text-red-900 mb-2">Usuń konto</p>
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
    </div>
  )
}
