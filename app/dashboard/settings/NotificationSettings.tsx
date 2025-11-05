'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { updateNotificationPreferences } from './actions'
import { toast } from 'sonner'

interface NotificationSettingsProps {
  emailNotifications: boolean
  messageNotifications: boolean
}

export function NotificationSettings({
  emailNotifications: initialEmail,
  messageNotifications: initialMessage
}: NotificationSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(initialEmail)
  const [messageNotifications, setMessageNotifications] = useState(initialMessage)
  const [isPending, startTransition] = useTransition()

  async function handleEmailChange(checked: boolean) {
    setEmailNotifications(checked)

    const formData = new FormData()
    formData.append('emailNotifications', String(checked))
    formData.append('messageNotifications', String(messageNotifications))

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/50 opacity-50">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-base font-semibold text-muted-foreground">Nowe wiadomości</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              Wkrótce
            </span>
          </div>
          <p className="text-sm text-muted-foreground/70">Powiadomienia o nowych wiadomościach</p>
        </div>
        <Switch
          checked={messageNotifications}
          onCheckedChange={handleMessageChange}
          disabled={true}
        />
      </div>
    </div>
  )
}
