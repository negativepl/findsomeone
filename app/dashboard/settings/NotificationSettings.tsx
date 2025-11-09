'use client'

import { useState, useTransition, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { updateNotificationPreferences } from './actions'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'

interface NotificationSettingsProps {
  emailNotifications: boolean
  messageNotifications: boolean
  favoriteNotifications: boolean
  reviewNotifications: boolean
  user: User
}

export function NotificationSettings({
  emailNotifications: initialEmail,
  messageNotifications: initialMessage,
  favoriteNotifications: initialFavorite,
  reviewNotifications: initialReview,
  user
}: NotificationSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(initialEmail)
  const [messageNotifications, setMessageNotifications] = useState(initialMessage)
  const [favoriteNotifications, setFavoriteNotifications] = useState(initialFavorite)
  const [reviewNotifications, setReviewNotifications] = useState(initialReview)
  const [isPending, startTransition] = useTransition()

  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications(user)

  async function handleEmailChange(checked: boolean) {
    setEmailNotifications(checked)

    const formData = new FormData()
    formData.append('emailNotifications', String(checked))
    formData.append('messageNotifications', String(messageNotifications))
    formData.append('favoriteNotifications', String(favoriteNotifications))
    formData.append('reviewNotifications', String(reviewNotifications))

    startTransition(async () => {
      const result = await updateNotificationPreferences(formData)
      if (result.success) {
        toast.success('Ustawienia zapisane')
      } else {
        setEmailNotifications(!checked) // revert on error
        toast.error(result.error)
      }
    })
  }

  async function handleMessageChange(checked: boolean) {
    setMessageNotifications(checked)

    const formData = new FormData()
    formData.append('emailNotifications', String(emailNotifications))
    formData.append('messageNotifications', String(checked))
    formData.append('favoriteNotifications', String(favoriteNotifications))
    formData.append('reviewNotifications', String(reviewNotifications))

    startTransition(async () => {
      const result = await updateNotificationPreferences(formData)
      if (result.success) {
        toast.success('Ustawienia zapisane')
      } else {
        setMessageNotifications(!checked) // revert on error
        toast.error(result.error)
      }
    })
  }

  async function handleFavoriteChange(checked: boolean) {
    setFavoriteNotifications(checked)

    const formData = new FormData()
    formData.append('emailNotifications', String(emailNotifications))
    formData.append('messageNotifications', String(messageNotifications))
    formData.append('favoriteNotifications', String(checked))
    formData.append('reviewNotifications', String(reviewNotifications))

    startTransition(async () => {
      const result = await updateNotificationPreferences(formData)
      if (result.success) {
        toast.success('Ustawienia zapisane')
      } else {
        setFavoriteNotifications(!checked) // revert on error
        toast.error(result.error)
      }
    })
  }

  async function handleReviewChange(checked: boolean) {
    setReviewNotifications(checked)

    const formData = new FormData()
    formData.append('emailNotifications', String(emailNotifications))
    formData.append('messageNotifications', String(messageNotifications))
    formData.append('favoriteNotifications', String(favoriteNotifications))
    formData.append('reviewNotifications', String(checked))

    startTransition(async () => {
      const result = await updateNotificationPreferences(formData)
      if (result.success) {
        toast.success('Ustawienia zapisane')
      } else {
        setReviewNotifications(!checked) // revert on error
        toast.error(result.error)
      }
    })
  }

  async function handlePushChange(checked: boolean) {
    try {
      if (checked) {
        await subscribe()
        toast.success('Powiadomienia push włączone')
      } else {
        await unsubscribe()
        toast.success('Powiadomienia push wyłączone')
      }
    } catch (error: any) {
      console.error('Push notification error:', error)
      if (error.message === 'Notification permission denied') {
        toast.error('Brak uprawnień do powiadomień. Sprawdź ustawienia przeglądarki.')
      } else if (error.message?.includes('Service worker not registered')) {
        toast.error('Push notifications działają tylko w trybie produkcyjnym (po zbudowaniu aplikacji).')
      } else {
        toast.error('Nie udało się zmienić ustawień push: ' + error.message)
      }
    }
  }

  async function testNotification() {
    if (!('serviceWorker' in navigator)) {
      toast.error('Service Worker nie jest obsługiwany')
      return
    }

    console.log('[DEBUG] Notification.permission:', Notification.permission)
    console.log('[DEBUG] navigator.permissions:', navigator.permissions)

    try {
      // Check permission first
      if (Notification.permission !== 'granted') {
        toast.error('Uprawnienia do powiadomień nie są nadane. Status: ' + Notification.permission)
        return
      }

      const registration = await navigator.serviceWorker.ready
      console.log('[DEBUG] Service Worker registration:', registration)

      const result = await registration.showNotification('Test FindSomeone', {
        body: 'To jest testowe powiadomienie',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'test',
        vibrate: [200, 100, 200],
        requireInteraction: false,
      })

      console.log('[DEBUG] showNotification result:', result)
      toast.success('Powiadomienie testowe wysłane - sprawdź centrum powiadomień systemu!')

      // Also try to get notifications to see if it was created
      const notifications = await registration.getNotifications({ tag: 'test' })
      console.log('[DEBUG] Active notifications with tag "test":', notifications)
    } catch (error: any) {
      console.error('Test notification error:', error)
      toast.error('Błąd: ' + error.message)
    }
  }

  return (
    <div className="space-y-4">
      {/* Test Button */}
      {isSupported && permission === 'granted' && (
        <button
          onClick={testNotification}
          className="w-full p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          🔔 Testuj powiadomienie (bezpośrednio z Service Worker)
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Email Notifications - Coming Soon */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/50 opacity-50">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-base font-semibold text-muted-foreground">Powiadomienia email</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              Wkrótce
            </span>
          </div>
          <p className="text-sm text-muted-foreground/70">Otrzymuj wiadomości na email</p>
        </div>
        <Switch
          checked={emailNotifications}
          onCheckedChange={handleEmailChange}
          disabled={true}
        />
      </div>

      {/* Message Notifications - Active */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-background">
        <div className="flex-1 pr-4">
          <p className="text-base font-semibold text-foreground mb-1">Nowe wiadomości</p>
          <p className="text-sm text-muted-foreground">Powiadomienia o nowych wiadomościach</p>
        </div>
        <Switch
          checked={messageNotifications}
          onCheckedChange={handleMessageChange}
          disabled={isPending}
        />
      </div>

      {/* Favorite Notifications - Active */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-background">
        <div className="flex-1 pr-4">
          <p className="text-base font-semibold text-foreground mb-1">Dodanie do ulubionych</p>
          <p className="text-sm text-muted-foreground">Powiadomienia gdy ktoś doda Twój post do ulubionych</p>
        </div>
        <Switch
          checked={favoriteNotifications}
          onCheckedChange={handleFavoriteChange}
          disabled={isPending}
        />
      </div>

      {/* Review Notifications - Active */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-background">
        <div className="flex-1 pr-4">
          <p className="text-base font-semibold text-foreground mb-1">Nowe opinie</p>
          <p className="text-sm text-muted-foreground">Powiadomienia o otrzymanych opiniach</p>
        </div>
        <Switch
          checked={reviewNotifications}
          onCheckedChange={handleReviewChange}
          disabled={isPending}
        />
      </div>

      {/* Push Notifications */}
      {isSupported ? (
        <div className="flex items-center justify-between p-5 rounded-2xl bg-background">
          <div className="flex-1 pr-4">
            <p className="text-base font-semibold text-foreground mb-1">Powiadomienia push</p>
            <p className="text-sm text-muted-foreground">
              {permission === 'granted'
                ? 'Otrzymuj powiadomienia na tym urządzeniu'
                : permission === 'denied'
                ? 'Uprawnienia zablokowane w przeglądarce'
                : 'Włącz powiadomienia push na tym urządzeniu'}
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handlePushChange}
            disabled={isLoading || permission === 'denied'}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/50 opacity-50">
          <div className="flex-1 pr-4">
            <p className="text-base font-semibold text-muted-foreground">Powiadomienia push</p>
            <p className="text-sm text-muted-foreground/70">Nieobsługiwane przez tę przeglądarkę</p>
          </div>
          <Switch checked={false} disabled={true} />
        </div>
      )}
      </div>
    </div>
  )
}
