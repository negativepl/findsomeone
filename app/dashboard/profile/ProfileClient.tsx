'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserBadge } from '@/components/ui/user-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { User } from '@supabase/supabase-js'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { Camera, Image as ImageIcon } from 'lucide-react'

interface Profile {
  id: string
  email: string
  full_name: string | null
  bio: string | null
  phone: string | null
  city: string | null
  avatar_url: string | null
  banner_url: string | null
  banner_position: number | null
  banner_scale: number | null
  rating: number
  total_reviews: number
  verified: boolean
  is_company: boolean
  is_ai_bot: boolean
  show_phone: boolean
  show_messages: boolean
  show_profile_link: boolean
}

interface ProfileClientProps {
  initialUser: User
  initialProfile: Profile
}

export function ProfileClient({ initialUser, initialProfile }: ProfileClientProps) {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [isAvatarHovered, setIsAvatarHovered] = useState(false)
  const [isBannerHovered, setIsBannerHovered] = useState(false)

  // Debug: sprawdź wartości plakietek
  console.log('Profile badges:', {
    verified: profile?.verified,
    is_company: profile?.is_company,
    is_ai_bot: profile?.is_ai_bot
  })

  const [formData, setFormData] = useState({
    full_name: initialProfile.full_name || '',
    bio: initialProfile.bio || '',
    phone: initialProfile.phone || '',
    city: initialProfile.city || '',
  })

  const [privacySettings, setPrivacySettings] = useState({
    show_phone: initialProfile.show_phone ?? true,
    show_messages: initialProfile.show_messages ?? true,
    show_profile_link: initialProfile.show_profile_link ?? true,
  })

  const [savingPrivacy, setSavingPrivacy] = useState(false)

  const [notificationSettings, setNotificationSettings] = useState({
    notify_new_messages: true,
    notify_favorites: true,
    notify_reviews: true,
  })

  const [savingNotifications, setSavingNotifications] = useState(false)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Proszę wybrać plik obrazu')
        return
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Plik jest za duży. Maksymalny rozmiar to 2MB')
        return
      }

      setUploading(true)

      // Delete old avatar if exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/avatars/')[1]
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath])
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop()
      const filePath = `${initialUser.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', initialUser.id)

      if (updateError) throw updateError

      // Update local state
      setProfile({ ...profile, avatar_url: publicUrl })
      toast.success('Avatar został zaktualizowany!')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Nie udało się zaktualizować avatara')
    } finally {
      setUploading(false)
    }
  }

  const handleAvatarRemove = async () => {
    if (!confirm('Czy na pewno chcesz usunąć avatar?')) return

    try {
      setUploading(true)

      // Delete avatar from storage if exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/avatars/')[1]
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath])
        }
      }

      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', initialUser.id)

      if (updateError) throw updateError

      // Update local state
      setProfile({ ...profile, avatar_url: null })
      toast.success('Avatar został usunięty!')
    } catch (error) {
      console.error('Error removing avatar:', error)
      toast.error('Nie udało się usunąć avatara')
    } finally {
      setUploading(false)
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Proszę wybrać plik obrazu')
        return
      }

      // Validate file size (max 5MB for banner)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Plik jest za duży. Maksymalny rozmiar to 5MB')
        return
      }

      setUploadingBanner(true)

      // Delete old banner if exists
      if (profile.banner_url) {
        const oldPath = profile.banner_url.split('/banners/')[1]
        if (oldPath) {
          await supabase.storage.from('banners').remove([oldPath])
        }
      }

      // Upload new banner
      const fileExt = file.name.split('.').pop()
      const filePath = `${initialUser.id}/banner.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL with cache busting timestamp
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath)

      // Add timestamp to bust cache
      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`

      // Update profile with new banner URL and reset position/scale to defaults
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ banner_url: cacheBustedUrl, banner_position: 50, banner_scale: 100 })
        .eq('id', initialUser.id)

      if (updateError) throw updateError

      // Update local state
      setProfile({ ...profile, banner_url: cacheBustedUrl, banner_position: 50, banner_scale: 100 })
      toast.success('Banner został zaktualizowany!')
    } catch (error) {
      console.error('Error uploading banner:', error)
      toast.error('Nie udało się zaktualizować bannera')
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          phone: formData.phone,
          city: formData.city,
        })
        .eq('id', initialUser.id)

      if (updateError) throw updateError

      toast.success('Profil został zaktualizowany pomyślnie!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Wystąpił błąd podczas aktualizacji profilu')
    } finally {
      setSaving(false)
    }
  }

  const handlePrivacySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPrivacy(true)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          show_phone: privacySettings.show_phone,
          show_messages: privacySettings.show_messages,
          show_profile_link: privacySettings.show_profile_link,
        })
        .eq('id', initialUser.id)

      if (updateError) throw updateError

      toast.success('Ustawienia prywatności zostały zaktualizowane!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Wystąpił błąd podczas aktualizacji ustawień')
    } finally {
      setSavingPrivacy(false)
    }
  }

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingNotifications(true)

    try {
      // TODO: W przyszłości zapisz do bazy danych
      toast.success('Ustawienia powiadomień zostały zaktualizowane!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Wystąpił błąd podczas aktualizacji ustawień')
    } finally {
      setSavingNotifications(false)
    }
  }

  return (
    <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8">
      {/* Header - Desktop only */}
      <div className="mb-8 hidden lg:block">
        <h1 className="text-4xl font-bold text-foreground mb-3">Mój profil</h1>
        <p className="text-lg text-muted-foreground">
          Zarządzaj swoimi danymi i informacjami kontaktowymi
        </p>
      </div>

      {/* Mobile & Tablet: single column flat design */}
      <div className="lg:hidden space-y-6">
        {/* Avatar Section */}
        <Card className="border border-border rounded-2xl bg-card shadow-sm">
          <CardContent className="p-5 text-center">
            <div className="mb-4 relative inline-block">
              <div className="relative w-32 h-32 mx-auto">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-brand flex items-center justify-center">
                    <span className="text-5xl font-semibold text-brand-foreground">
                      {(() => {
                        const name = formData.full_name || initialUser?.email || ''
                        const parts = name.split(' ')
                        if (parts.length >= 2) {
                          return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
                        }
                        return name.substring(0, 2).toUpperCase() || 'U'
                      })()}
                    </span>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute -top-1 -right-1 flex flex-col gap-1 z-10">
                  {profile?.verified && <UserBadge type="verified" />}
                  {profile?.is_company && <UserBadge type="company" />}
                  {profile?.is_ai_bot && <UserBadge type="ai_bot" />}
                </div>

                {/* Upload button */}
                <label
                  htmlFor="avatar-upload-mobile"
                  onMouseEnter={() => setIsAvatarHovered(true)}
                  onMouseLeave={() => setIsAvatarHovered(false)}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-brand hover:bg-brand/90 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg"
                >
                  {uploading ? (
                    <svg className="animate-spin w-5 h-5 text-brand-foreground" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <Camera className="w-5 h-5 text-brand-foreground" />
                  )}
                </label>
                <input
                  id="avatar-upload-mobile"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Kliknij ikonę aby zmienić</p>

              {/* Remove Avatar Button */}
              {profile?.avatar_url && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAvatarRemove}
                  disabled={uploading}
                  className="mt-2 text-xs rounded-full text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 h-8 px-3"
                >
                  Usuń avatar
                </Button>
              )}
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-1">
              {formData.full_name || 'Użytkownik'}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">{initialUser?.email}</p>

            {/* Stats */}
            <div className="bg-muted/50 rounded-2xl p-4 mb-4 flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M10.383 3.084c.662-1.341 2.573-1.341 3.235 0l2.047 4.148 4.578.665c1.479.215 2.07 2.031 1.002 3.075l-3.31 3.234.78 4.563c.252 1.474-1.295 2.597-2.618 1.9L12 18.516 7.904 20.67c-1.323.696-2.87-.427-2.618-1.9l.78-4.564-3.31-3.234c-1.07-1.044-.478-2.86 1-3.075l4.578-.665zm1.89.664a.304.304 0 0 0-.545 0L9.506 8.25a.75.75 0 0 1-.566.41l-4.967.722a.304.304 0 0 0-.17.518l3.593 3.508a.75.75 0 0 1 .214.663l-.845 4.951a.304.304 0 0 0 .441.32l4.445-2.338.083-.038a.75.75 0 0 1 .616.038l4.445 2.339a.304.304 0 0 0 .441-.32l-.846-4.952a.75.75 0 0 1 .215-.663L20.197 9.9a.304.304 0 0 0-.168-.518L15.06 8.66a.75.75 0 0 1-.565-.41z"/>
                </svg>
                <span className="text-sm text-muted-foreground">Ocena</span>
                <span className="font-semibold text-foreground">
                  {profile?.rating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24">
                  <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                    <path d="M21.25 4.75v5.42m-3 .079-2 3.5h-.22a1.5 1.5 0 0 1-1.5-1.5v-2h-1.784a1 1 0 0 1-.986-1.168l.598-3.5a1 1 0 0 1 .986-.832h4.906zM2.75 19.25v-5.42m3-.08 2-3.5h.22a1.5 1.5 0 0 1 1.5 1.5v2h1.784a1 1 0 0 1 .986 1.168l-.598 3.5a1 1 0 0 1-.986.832H5.75z"/>
                  </g>
                </svg>
                <span className="text-sm text-muted-foreground">Opinie</span>
                <span className="font-semibold text-foreground">{profile?.total_reviews || 0}</span>
              </div>
            </div>

            {/* View Profile Button */}
            <Link href={`/profile/${initialUser.id}`} target="_blank" className="block">
              <Button className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-12">
                Zobacz swój profil
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Edytuj profil</h2>
          <div className="bg-card rounded-2xl p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name_mobile" className="text-sm font-semibold text-foreground">
                  Imię i nazwisko *
                </Label>
                <Input
                  id="full_name_mobile"
                  placeholder="np. Jan Kowalski"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="rounded-2xl border border-border h-11 focus:border-border"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone_mobile" className="text-sm font-semibold text-foreground">
                  Telefon
                </Label>
                <Input
                  id="phone_mobile"
                  type="tel"
                  placeholder="np. +48 123 456 789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-2xl border border-border h-11 focus:border-border"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city_mobile" className="text-sm font-semibold text-foreground">
                  Miasto
                </Label>
                <Input
                  id="city_mobile"
                  placeholder="np. Warszawa"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="rounded-2xl border border-border h-11 focus:border-border"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio_mobile" className="text-sm font-semibold text-foreground">
                  O mnie
                </Label>
                <Textarea
                  id="bio_mobile"
                  placeholder="Napisz coś o sobie..."
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="rounded-2xl border border-border focus:border-border resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-11 text-sm font-semibold"
              >
                {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </Button>
            </form>
          </div>
        </div>

        {/* Banner Section */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Banner profilu</h2>
          <div className="bg-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-4">
              Dodaj banner do swojego profilu - idealny dla firm (logo, zdjęcie lokalu, itp.)
            </p>

            {/* Banner Preview - same as desktop but mobile ID */}
            <div className="mb-4">
              {profile?.banner_url ? (
                <div className="relative w-full rounded-2xl overflow-hidden group" style={{ aspectRatio: '3/1', minHeight: '150px' }}>
                  <div
                    style={{
                      transform: `scale(${(profile.banner_scale || 100) / 100})`,
                      transformOrigin: `center ${profile.banner_position || 50}%`,
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                  >
                    <Image
                      src={profile.banner_url}
                      alt="Profile banner"
                      fill
                      className="object-cover"
                      style={{ objectPosition: `center ${profile.banner_position || 50}%` }}
                      sizes="100vw"
                      quality={90}
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                    <label
                      htmlFor="banner-upload-mobile"
                      onMouseEnter={() => setIsBannerHovered(true)}
                      onMouseLeave={() => setIsBannerHovered(false)}
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <div className="bg-card rounded-full p-3 hover:bg-muted transition-colors flex items-center justify-center">
                        {uploadingBanner ? (
                          <svg className="animate-spin w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <ImageIcon className="w-5 h-5 text-brand" />
                        )}
                      </div>
                      <p className="text-white text-xs mt-2 font-semibold">Zmień banner</p>
                    </label>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="banner-upload-mobile"
                  onMouseEnter={() => setIsBannerHovered(true)}
                  onMouseLeave={() => setIsBannerHovered(false)}
                  className="flex flex-col items-center justify-center w-full aspect-[3/1] border border-dashed border-border rounded-2xl cursor-pointer hover:border-border hover:bg-muted transition-all"
                >
                  <div className="flex flex-col items-center justify-center pt-4 pb-4 px-4">
                    {uploadingBanner ? (
                      <svg className="animate-spin w-8 h-8 text-brand mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground font-semibold">Kliknij aby dodać banner</p>
                        <p className="text-xs text-muted-foreground">1488×496px, Max. 5MB</p>
                      </>
                    )}
                  </div>
                </label>
              )}
              <input
                id="banner-upload-mobile"
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                disabled={uploadingBanner}
                className="hidden"
              />
            </div>

            {profile?.banner_url && (
              <Button
                type="button"
                variant="ghost"
                onClick={async () => {
                  if (confirm('Czy na pewno chcesz usunąć banner?')) {
                    try {
                      setUploadingBanner(true)
                      const oldPath = profile.banner_url!.split('/banners/')[1]
                      if (oldPath) {
                        await supabase.storage.from('banners').remove([oldPath])
                      }
                      await supabase
                        .from('profiles')
                        .update({ banner_url: null })
                        .eq('id', initialUser.id)
                      setProfile({ ...profile, banner_url: null })
                      toast.success('Banner został usunięty!')
                    } catch (error) {
                      console.error('Error removing banner:', error)
                      toast.error('Nie udało się usunąć bannera')
                    } finally {
                      setUploadingBanner(false)
                    }
                  }
                }}
                className="w-full rounded-full text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 h-11"
              >
                Usuń banner
              </Button>
            )}
          </div>
        </div>

        {/* Privacy Settings */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Ustawienia prywatności</h2>
          <div className="bg-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-4">
              Kontroluj, jakie informacje są widoczne w Twoich ogłoszeniach
            </p>

            <form onSubmit={handlePrivacySubmit} className="space-y-4">
              {/* Show Phone */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex-1 pr-3">
                  <Label htmlFor="show_phone_mobile" className="text-sm font-semibold text-foreground cursor-pointer">
                    Pokazuj numer telefonu
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Widoczny w ogłoszeniach
                  </p>
                </div>
                <Switch
                  id="show_phone_mobile"
                  checked={privacySettings.show_phone}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, show_phone: checked })}
                  aria-label="Pokazuj numer telefonu"
                />
              </div>

              {/* Show Messages */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex-1 pr-3">
                  <Label htmlFor="show_messages_mobile" className="text-sm font-semibold text-foreground cursor-pointer">
                    Pokazuj "Wyślij wiadomość"
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Użytkownicy mogą wysyłać wiadomości
                  </p>
                </div>
                <Switch
                  id="show_messages_mobile"
                  checked={privacySettings.show_messages}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, show_messages: checked })}
                  aria-label="Pokazuj przycisk Wyślij wiadomość"
                />
              </div>

              <Button
                type="submit"
                disabled={savingPrivacy}
                className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-11 text-sm font-semibold"
              >
                {savingPrivacy ? 'Zapisywanie...' : 'Zapisz ustawienia'}
              </Button>
            </form>
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Powiadomienia</h2>
          <div className="bg-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-4">
              Dostosuj preferencje powiadomień
            </p>

            <form onSubmit={handleNotificationsSubmit} className="space-y-4">
              {/* New Messages */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex-1 pr-3">
                  <Label htmlFor="notify_new_messages_mobile" className="text-sm font-semibold text-foreground cursor-pointer">
                    Nowe wiadomości
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Powiadomienia o nowych wiadomościach
                  </p>
                </div>
                <Switch
                  id="notify_new_messages_mobile"
                  checked={notificationSettings.notify_new_messages}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, notify_new_messages: checked })}
                  aria-label="Powiadomienia o nowych wiadomościach"
                />
              </div>

              {/* Favorites */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex-1 pr-3">
                  <Label htmlFor="notify_favorites_mobile" className="text-sm font-semibold text-foreground cursor-pointer">
                    Dodanie do ulubionych
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Powiadomienia gdy ktoś doda Twój post do ulubionych
                  </p>
                </div>
                <Switch
                  id="notify_favorites_mobile"
                  checked={notificationSettings.notify_favorites}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, notify_favorites: checked })}
                  aria-label="Powiadomienia o dodaniu do ulubionych"
                />
              </div>

              {/* Reviews */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex-1 pr-3">
                  <Label htmlFor="notify_reviews_mobile" className="text-sm font-semibold text-foreground cursor-pointer">
                    Nowe opinie
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Powiadomienia o otrzymanych opiniach
                  </p>
                </div>
                <Switch
                  id="notify_reviews_mobile"
                  checked={notificationSettings.notify_reviews}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, notify_reviews: checked })}
                  aria-label="Powiadomienia o nowych opiniach"
                />
              </div>

              <Button
                type="submit"
                disabled={savingNotifications}
                className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-11 text-sm font-semibold"
              >
                {savingNotifications ? 'Zapisywanie...' : 'Zapisz ustawienia'}
              </Button>
            </form>
          </div>
        </div>

        {/* Email Notifications - Full Width at Bottom */}
        <div className="bg-card rounded-2xl p-5 border border-dashed border-muted-foreground/30">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">Powiadomienia email</h3>
            <p className="text-sm text-muted-foreground mb-2">Otrzymuj wiadomości na email</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Wkrótce</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: 2-column layout */}
      <div className="hidden lg:grid grid-cols-3 gap-6">
        {/* Left sidebar - Profile Summary */}
        <div className="col-span-1">
          <Card className="border border-border rounded-3xl bg-card sticky top-24 overflow-visible">
            <CardContent className="p-6 text-center overflow-visible">
              {/* Avatar */}
              <div className="mb-6 relative inline-block">
                <div className="relative w-32 h-32 mx-auto">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-brand flex items-center justify-center">
                      <span className="text-5xl font-semibold text-brand-foreground">
                        {(() => {
                          const name = formData.full_name || initialUser?.email || ''
                          const parts = name.split(' ')
                          if (parts.length >= 2) {
                            return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
                          }
                          return name.substring(0, 2).toUpperCase() || 'U'
                        })()}
                      </span>
                    </div>
                  )}

                  {/* Badges - stacked vertically on top right of avatar */}
                  <div className="absolute -top-1 -right-1 flex flex-col gap-1 z-10">
                    {profile?.verified && <UserBadge type="verified" />}
                    {profile?.is_company && <UserBadge type="company" />}
                    {profile?.is_ai_bot && <UserBadge type="ai_bot" />}
                  </div>

                  {/* Upload button overlay */}
                  <label
                    htmlFor="avatar-upload"
                    onMouseEnter={() => setIsAvatarHovered(true)}
                    onMouseLeave={() => setIsAvatarHovered(false)}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-brand hover:bg-brand/90 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg"
                  >
                    {uploading ? (
                      <svg className="animate-spin w-5 h-5 text-brand-foreground" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <Camera className="w-5 h-5 text-brand-foreground" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Kliknij ikonę aby zmienić</p>

                {/* Remove Avatar Button */}
                {profile?.avatar_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleAvatarRemove}
                    disabled={uploading}
                    className="mt-2 text-xs rounded-full text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 h-8 px-3"
                  >
                    Usuń avatar
                  </Button>
                )}
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-1">
                {formData.full_name || 'Użytkownik'}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">{initialUser?.email}</p>

              {/* Stats */}
              <div className="bg-muted/50 rounded-2xl p-4 mb-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M10.383 3.084c.662-1.341 2.573-1.341 3.235 0l2.047 4.148 4.578.665c1.479.215 2.07 2.031 1.002 3.075l-3.31 3.234.78 4.563c.252 1.474-1.295 2.597-2.618 1.9L12 18.516 7.904 20.67c-1.323.696-2.87-.427-2.618-1.9l.78-4.564-3.31-3.234c-1.07-1.044-.478-2.86 1-3.075l4.578-.665zm1.89.664a.304.304 0 0 0-.545 0L9.506 8.25a.75.75 0 0 1-.566.41l-4.967.722a.304.304 0 0 0-.17.518l3.593 3.508a.75.75 0 0 1 .214.663l-.845 4.951a.304.304 0 0 0 .441.32l4.445-2.338.083-.038a.75.75 0 0 1 .616.038l4.445 2.339a.304.304 0 0 0 .441-.32l-.846-4.952a.75.75 0 0 1 .215-.663L20.197 9.9a.304.304 0 0 0-.168-.518L15.06 8.66a.75.75 0 0 1-.565-.41z"/>
                  </svg>
                  <span className="text-sm text-muted-foreground">Ocena</span>
                  <span className="font-semibold text-foreground">
                    {profile?.rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24">
                    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                      <path d="M21.25 4.75v5.42m-3 .079-2 3.5h-.22a1.5 1.5 0 0 1-1.5-1.5v-2h-1.784a1 1 0 0 1-.986-1.168l.598-3.5a1 1 0 0 1 .986-.832h4.906zM2.75 19.25v-5.42m3-.08 2-3.5h.22a1.5 1.5 0 0 1 1.5 1.5v2h1.784a1 1 0 0 1 .986 1.168l-.598 3.5a1 1 0 0 1-.986.832H5.75z"/>
                    </g>
                  </svg>
                  <span className="text-sm text-muted-foreground">Opinie</span>
                  <span className="font-semibold text-foreground">{profile?.total_reviews || 0}</span>
                </div>
              </div>

              {/* View Profile Button */}
              <Link href={`/profile/${initialUser.id}`} target="_blank">
                <Button
                  className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-11 text-sm font-semibold"
                >
                  Zobacz swój profil
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Edit Form */}
        <div className="col-span-2">
          <Card className="border border-border rounded-3xl bg-card">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">Edytuj profil</CardTitle>
              <CardDescription className="text-sm md:text-base text-muted-foreground">
                Zaktualizuj swoje dane i informacje kontaktowe
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1: Full Name & Phone */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-3">
                    <Label htmlFor="full_name" className="text-base font-semibold text-foreground">
                      Imię i nazwisko *
                    </Label>
                    <Input
                      id="full_name"
                      placeholder="np. Jan Kowalski"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      className="rounded-2xl border border-border h-12 focus:border-border"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-base font-semibold text-foreground">
                      Telefon
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="np. +48 123 456 789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-2xl border border-border h-12 focus:border-border"
                    />
                  </div>
                </div>

                {/* Row 2: City (full width) */}
                <div className="space-y-3">
                  <Label htmlFor="city" className="text-base font-semibold text-foreground">
                    Miasto
                  </Label>
                  <Input
                    id="city"
                    placeholder="np. Warszawa"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="rounded-2xl border border-border h-12 focus:border-border"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-3">
                  <Label htmlFor="bio" className="text-base font-semibold text-foreground">
                    O mnie
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Napisz coś o sobie..."
                    rows={6}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="rounded-2xl border border-border focus:border-border resize-none"
                  />
                </div>

                {/* Footer with buttons */}
                <div className="mt-8 pt-6 border-t-2 border-border">
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="w-full md:w-auto rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-11 px-8 text-sm font-semibold"
                    >
                      {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Profile Banner Card */}
          <Card className="border border-border rounded-3xl bg-card mt-6">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">Banner profilu</CardTitle>
              <CardDescription className="text-sm md:text-base text-muted-foreground">
                Dodaj banner do swojego profilu - idealny dla firm (logo, zdjęcie lokalu, itp.)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Banner Preview */}
              <div className="mb-6">
                {profile?.banner_url ? (
                  <div className="relative w-full rounded-2xl overflow-hidden group" style={{ aspectRatio: '3/1', minHeight: '200px' }}>
                    <div
                      style={{
                        transform: `scale(${(profile.banner_scale || 100) / 100})`,
                        transformOrigin: `center ${profile.banner_position || 50}%`,
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                    >
                      <Image
                        src={profile.banner_url}
                        alt="Profile banner"
                        fill
                        className="object-cover"
                        style={{ objectPosition: `center ${profile.banner_position || 50}%` }}
                        sizes="(max-width: 768px) 100vw, 66vw"
                        quality={90}
                        unoptimized={process.env.NODE_ENV === 'development'}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                      <label
                        htmlFor="banner-upload"
                        onMouseEnter={() => setIsBannerHovered(true)}
                        onMouseLeave={() => setIsBannerHovered(false)}
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <div className="bg-card rounded-full p-4 hover:bg-muted transition-colors flex items-center justify-center">
                          {uploadingBanner ? (
                            <svg className="animate-spin w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <ImageIcon className="w-6 h-6 text-brand" />
                          )}
                        </div>
                        <p className="text-white text-sm mt-2 font-semibold text-center">Zmień banner</p>
                      </label>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="banner-upload"
                    onMouseEnter={() => setIsBannerHovered(true)}
                    onMouseLeave={() => setIsBannerHovered(false)}
                    className="flex flex-col items-center justify-center w-full aspect-[3/1] border border-dashed border-border rounded-2xl cursor-pointer hover:border-border hover:bg-muted transition-all"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                      {uploadingBanner ? (
                        <svg className="animate-spin w-10 h-10 text-brand mb-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <>
                          <ImageIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Kliknij aby dodać banner</span>
                          </p>
                          <p className="text-xs text-muted-foreground">1488×496px</p>
                          <p className="text-xs text-muted-foreground mt-1">Max. 5MB</p>
                        </>
                      )}
                    </div>
                  </label>
                )}
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploadingBanner}
                  className="hidden"
                />
              </div>

              {profile?.banner_url && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={async () => {
                    if (confirm('Czy na pewno chcesz usunąć banner?')) {
                      try {
                        setUploadingBanner(true)
                        const oldPath = profile.banner_url!.split('/banners/')[1]
                        if (oldPath) {
                          await supabase.storage.from('banners').remove([oldPath])
                        }
                        await supabase
                          .from('profiles')
                          .update({ banner_url: null })
                          .eq('id', initialUser.id)
                        setProfile({ ...profile, banner_url: null })
                        toast.success('Banner został usunięty!')
                      } catch (error) {
                        console.error('Error removing banner:', error)
                        toast.error('Nie udało się usunąć bannera')
                      } finally {
                        setUploadingBanner(false)
                      }
                    }
                  }}
                  className="w-full rounded-full text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
                >
                  Usuń banner
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Privacy Settings Card */}
          <Card className="border border-border rounded-3xl bg-card mt-6">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">Ustawienia prywatności</CardTitle>
              <CardDescription className="text-sm md:text-base text-muted-foreground">
                Kontroluj, jakie informacje są widoczne w Twoich ogłoszeniach
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePrivacySubmit} className="space-y-6">
                {/* Show Phone */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                  <div className="flex-1 pr-4">
                    <Label htmlFor="show_phone" className="text-base font-semibold text-foreground cursor-pointer">
                      Pokazuj numer telefonu
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Twój numer telefonu będzie widoczny na stronie szczegółów ogłoszenia
                    </p>
                  </div>
                  <Switch
                    id="show_phone"
                    checked={privacySettings.show_phone}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, show_phone: checked })}
                    aria-label="Pokazuj numer telefonu"
                  />
                </div>

                {/* Show Messages */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                  <div className="flex-1 pr-4">
                    <Label htmlFor="show_messages" className="text-base font-semibold text-foreground cursor-pointer">
                      Pokazuj przycisk "Wyślij wiadomość"
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Inni użytkownicy będą mogli wysyłać do Ciebie wiadomości przez platformę
                    </p>
                  </div>
                  <Switch
                    id="show_messages"
                    checked={privacySettings.show_messages}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, show_messages: checked })}
                    aria-label="Pokazuj przycisk Wyślij wiadomość"
                  />
                </div>

                {/* Footer with buttons */}
                <div className="mt-8 pt-6 border-t-2 border-border">
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={savingPrivacy}
                      className="w-full md:w-auto rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-11 px-8 text-sm font-semibold"
                    >
                      {savingPrivacy ? 'Zapisywanie...' : 'Zapisz ustawienia prywatności'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings Card */}
          <Card className="border border-border rounded-3xl bg-card mt-6">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">Powiadomienia</CardTitle>
              <CardDescription className="text-sm md:text-base text-muted-foreground">
                Dostosuj preferencje powiadomień
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                {/* New Messages */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                  <div className="flex-1 pr-4">
                    <Label htmlFor="notify_new_messages" className="text-base font-semibold text-foreground cursor-pointer">
                      Nowe wiadomości
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Powiadomienia o nowych wiadomościach
                    </p>
                  </div>
                  <Switch
                    id="notify_new_messages"
                    checked={notificationSettings.notify_new_messages}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, notify_new_messages: checked })}
                    aria-label="Powiadomienia o nowych wiadomościach"
                  />
                </div>

                {/* Favorites */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                  <div className="flex-1 pr-4">
                    <Label htmlFor="notify_favorites" className="text-base font-semibold text-foreground cursor-pointer">
                      Dodanie do ulubionych
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Powiadomienia gdy ktoś doda Twój post do ulubionych
                    </p>
                  </div>
                  <Switch
                    id="notify_favorites"
                    checked={notificationSettings.notify_favorites}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, notify_favorites: checked })}
                    aria-label="Powiadomienia o dodaniu do ulubionych"
                  />
                </div>

                {/* Reviews */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                  <div className="flex-1 pr-4">
                    <Label htmlFor="notify_reviews" className="text-base font-semibold text-foreground cursor-pointer">
                      Nowe opinie
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Powiadomienia o otrzymanych opiniach
                    </p>
                  </div>
                  <Switch
                    id="notify_reviews"
                    checked={notificationSettings.notify_reviews}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, notify_reviews: checked })}
                    aria-label="Powiadomienia o nowych opiniach"
                  />
                </div>

                {/* Footer with buttons */}
                <div className="mt-8 pt-6 border-t-2 border-border">
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={savingNotifications}
                      className="w-full md:w-auto rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-11 px-8 text-sm font-semibold"
                    >
                      {savingNotifications ? 'Zapisywanie...' : 'Zapisz ustawienia powiadomień'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Notifications - Full Width at Bottom (Desktop Only) */}
      <div className="hidden lg:block mt-6">
        <Card className="border border-dashed border-muted-foreground/30 rounded-3xl bg-card">
          <CardContent className="p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Powiadomienia email</h3>
              <p className="text-base text-muted-foreground mb-4">Otrzymuj wiadomości na email</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Wkrótce</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
