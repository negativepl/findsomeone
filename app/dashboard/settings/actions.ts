'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function changePassword(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: 'Wszystkie pola są wymagane' }
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Nowe hasła nie są identyczne' }
  }

  if (newPassword.length < 8) {
    return { success: false, error: 'Hasło musi mieć minimum 8 znaków' }
  }

  const supabase = await createClient()

  // Verify current password by trying to sign in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return { success: false, error: 'Nie znaleziono użytkownika' }
  }

  // Test current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    return { success: false, error: 'Obecne hasło jest nieprawidłowe' }
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  return { success: true, message: 'Hasło zostało zmienione' }
}

export async function changeEmail(formData: FormData) {
  const newEmail = formData.get('newEmail') as string
  const password = formData.get('password') as string

  if (!newEmail || !password) {
    return { success: false, error: 'Wszystkie pola są wymagane' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(newEmail)) {
    return { success: false, error: 'Nieprawidłowy adres email' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return { success: false, error: 'Nie znaleziono użytkownika' }
  }

  // Verify password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: password,
  })

  if (signInError) {
    return { success: false, error: 'Hasło jest nieprawidłowe' }
  }

  // Update email
  const { error: updateError } = await supabase.auth.updateUser({
    email: newEmail
  })

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  return { success: true, message: 'Email został zmieniony. Sprawdź swoją skrzynkę pocztową, aby potwierdzić zmianę.' }
}

export async function deleteAccount(formData: FormData) {
  const password = formData.get('password') as string
  const confirmation = formData.get('confirmation') as string

  if (!password || !confirmation) {
    return { success: false, error: 'Wszystkie pola są wymagane' }
  }

  if (confirmation !== 'USUŃ KONTO') {
    return { success: false, error: 'Wpisz "USUŃ KONTO" aby potwierdzić' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return { success: false, error: 'Nie znaleziono użytkownika' }
  }

  // Verify password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: password,
  })

  if (signInError) {
    return { success: false, error: 'Hasło jest nieprawidłowe' }
  }

  // Call API to delete account (can't use admin.deleteUser in server actions)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/delete-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.id }),
    })

    if (!response.ok) {
      return { success: false, error: 'Nie udało się usunąć konta' }
    }

    return { success: true, redirect: '/' }
  } catch (error) {
    console.error('Error deleting account:', error)
    return { success: false, error: 'Nie udało się usunąć konta' }
  }
}

export async function updateNotificationPreferences(formData: FormData) {
  const emailNotifications = formData.get('emailNotifications') === 'true'
  const messageNotifications = formData.get('messageNotifications') === 'true'
  const favoriteNotifications = formData.get('favoriteNotifications') === 'true'
  const reviewNotifications = formData.get('reviewNotifications') === 'true'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Nie znaleziono użytkownika' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      email_notifications: emailNotifications,
      message_notifications: messageNotifications,
      favorite_notifications: favoriteNotifications,
      review_notifications: reviewNotifications,
    })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/settings')
  return { success: true, message: 'Preferencje zostały zapisane' }
}

export async function updatePreferences(formData: FormData) {
  const language = formData.get('language') as string
  const theme = formData.get('theme') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Nie znaleziono użytkownika' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      language: language,
      theme: theme,
    })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/settings')
  return { success: true, message: 'Preferencje zostały zapisane' }
}

export async function updateVibrationPreference(formData: FormData) {
  const vibrationEnabled = formData.get('vibrationEnabled') === 'true'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Nie znaleziono użytkownika' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      vibration_enabled: vibrationEnabled,
    })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/settings')
  return { success: true, message: 'Ustawienia wibracji zostały zapisane' }
}
