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
    <div className="min-h-screen bg-background">
      <NavbarWithHide user={user} pageTitle="Ustawienia" />

      <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8">
        {/* Header - Desktop only */}
        <div className="mb-8 hidden md:block">
          <h1 className="text-4xl font-bold text-foreground mb-3">Ustawienia</h1>
          <p className="text-lg text-muted-foreground">
            Zarządzaj swoim kontem i preferencjami
          </p>
        </div>

        {/* Mobile: flat design */}
        <div className="md:hidden space-y-6">
          {/* Account Settings */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground mb-1">Konto</h2>
              <p className="text-sm text-muted-foreground">
                Zarządzaj swoimi danymi i bezpieczeństwem konta
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-card">
                <div className="flex-1">
                  <p className="text-base font-semibold text-foreground mb-1">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <ChangeEmailDialog />
              </div>
              <div className="flex items-center justify-between p-5 rounded-2xl bg-card">
                <div className="flex-1">
                  <p className="text-base font-semibold text-foreground mb-1">Hasło</p>
                  <p className="text-sm text-muted-foreground">••••••••</p>
                </div>
                <ChangePasswordDialog />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground mb-1">Powiadomienia</h2>
              <p className="text-sm text-muted-foreground">
                Dostosuj preferencje powiadomień
              </p>
            </div>
            <div className="bg-card rounded-2xl p-5">
              <NotificationSettings
                emailNotifications={profile?.email_notifications ?? false}
                messageNotifications={profile?.message_notifications ?? false}
              />
            </div>
          </div>

          {/* Preferences */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground mb-1">Preferencje</h2>
              <p className="text-sm text-muted-foreground">
                Dostosuj wygląd i działanie aplikacji
              </p>
            </div>
            <div className="bg-card rounded-2xl p-5">
              <PreferencesSettings
                language={profile?.language ?? 'pl'}
                theme={profile?.theme ?? 'light'}
              />
            </div>
          </div>

          {/* Danger Zone */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-red-600 mb-1">Strefa zagrożenia</h2>
              <p className="text-sm text-red-600 dark:text-red-400">
                Nieodwracalne akcje - zachowaj ostrożność
              </p>
            </div>
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
              <div className="flex-1">
                <p className="text-base font-semibold text-red-600 dark:text-red-400 mb-2">Usuń konto</p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Permanentnie usuń swoje konto i wszystkie dane. Ta akcja jest nieodwracalna.
                </p>
              </div>
              <DeleteAccountDialog />
            </div>
          </div>
        </div>

        {/* Desktop: card design */}
        <div className="hidden md:grid grid-cols-1 gap-6">
          {/* Account Settings */}
          <Card className="border border-border rounded-3xl bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground">Konto</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Zarządzaj swoimi danymi i bezpieczeństwem konta
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-background">
                  <div className="flex-1">
                    <p className="text-base font-semibold text-foreground mb-1">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <ChangeEmailDialog />
                </div>
                <div className="flex items-center justify-between p-5 rounded-2xl bg-background">
                  <div className="flex-1">
                    <p className="text-base font-semibold text-foreground mb-1">Hasło</p>
                    <p className="text-sm text-muted-foreground">••••••••</p>
                  </div>
                  <ChangePasswordDialog />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border border-border rounded-3xl bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground">Powiadomienia</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
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
          <Card className="border border-border rounded-3xl bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground">Preferencje</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
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

          {/* Danger Zone */}
          <Card className="border border-border rounded-3xl bg-card shadow-sm mt-2">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-red-600">Strefa zagrożenia</CardTitle>
              <CardDescription className="text-base text-red-600 dark:text-red-400">
                Nieodwracalne akcje - zachowaj ostrożność
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Usuń konto</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Permanentnie usuń swoje konto i wszystkie dane. Ta akcja jest nieodwracalna.
                  </p>
                </div>
                <DeleteAccountDialog />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
