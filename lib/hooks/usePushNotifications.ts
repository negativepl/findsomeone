'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface UsePushNotificationsReturn {
  isSupported: boolean
  permission: NotificationPermission | null
  isSubscribed: boolean
  isLoading: boolean
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
  requestPermission: () => Promise<NotificationPermission>
}

export function usePushNotifications(user: User | null): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if Push API is supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)

      // Check if already subscribed
      checkSubscription()
    }
  }, [user])

  const checkSubscription = async () => {
    if (!user) return

    try {
      // Check if service worker is registered first
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        console.log('No service worker registered')
        return
      }

      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const requestPermission = async (): Promise<NotificationPermission> => {
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  const urlBase64ToUint8Array = (base64String: string): Uint8Array<ArrayBuffer> => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray as Uint8Array<ArrayBuffer>
  }

  const subscribe = async () => {
    if (!user || !isSupported) {
      throw new Error('Push notifications not supported or user not logged in')
    }

    setIsLoading(true)

    try {
      // Request permission if not granted
      let perm = permission
      if (perm !== 'granted') {
        perm = await requestPermission()
      }

      if (perm !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured')
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      // Save subscription to database
      const supabase = createClient()
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          keys: subscription.toJSON().keys,
          user_agent: navigator.userAgent,
        })

      if (error) throw error

      setIsSubscribed(true)
    } catch (error) {
      console.error('Error subscribing to push:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        console.log('No service worker registered')
        setIsLoading(false)
        return
      }

      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // Remove from database
        const supabase = createClient()
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint)

        if (error) throw error
      }

      setIsSubscribed(false)
    } catch (error) {
      console.error('Error unsubscribing from push:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    requestPermission,
  }
}
