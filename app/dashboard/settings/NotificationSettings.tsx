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
    <>
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F3]">
        <div className="flex-1">
          <p className="text-sm font-medium text-black">Powiadomienia email</p>
          <p className="text-sm text-black/60">Otrzymuj wiadomości na email</p>
        </div>
        <Switch
          checked={emailNotifications}
          onCheckedChange={handleEmailChange}
          disabled={isPending}
        />
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F3]">
        <div className="flex-1">
          <p className="text-sm font-medium text-black">Nowe wiadomości</p>
          <p className="text-sm text-black/60">Powiadomienia o nowych wiadomościach</p>
        </div>
        <Switch
          checked={messageNotifications}
          onCheckedChange={handleMessageChange}
          disabled={isPending}
        />
      </div>
    </>
  )
}
