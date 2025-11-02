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
import { LottieIcon } from '@/components/LottieIcon'

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

  return (
    <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8">
      {/* Header - Desktop only */}
      <div className="mb-8 hidden md:block">
        <h1 className="text-4xl font-bold text-black mb-3">Mój profil</h1>
        <p className="text-lg text-black/60">
          Zarządzaj swoimi danymi i informacjami kontaktowymi
        </p>
      </div>

      {/* Mobile: single column flat design */}
      <div className="md:hidden space-y-6">
        {/* Avatar Section */}
        <Card className="border-0 rounded-2xl bg-white shadow-sm">
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
                  <div className="w-32 h-32 rounded-full bg-[#C44E35] flex items-center justify-center">
                    <span className="text-5xl font-semibold text-white">
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
                  className="absolute bottom-0 right-0 w-10 h-10 bg-[#C44E35] hover:bg-[#B33D2A] rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg"
                >
                  {uploading ? (
                    <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <LottieIcon
                      animationPath="/animations/camera.json"
                      fallbackSvg={<img src="/icons/camera.svg" alt="Camera" className="w-full h-full" />}
                      className="w-5 h-5 text-white"
                      isHovered={isAvatarHovered}
                    />
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
              <p className="text-xs text-gray-600 mt-2">Kliknij ikonę aby zmienić</p>

              {/* Remove Avatar Button */}
              {profile?.avatar_url && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAvatarRemove}
                  disabled={uploading}
                  className="mt-2 text-xs rounded-full border-2 border-red-200 text-red-600 hover:text-red-600 hover:bg-red-50 hover:border-red-300 h-8 px-3"
                >
                  Usuń avatar
                </Button>
              )}
            </div>

            <h2 className="text-2xl font-bold text-black mb-1">
              {formData.full_name || 'Użytkownik'}
            </h2>
            <p className="text-sm text-black/60 mb-4">{initialUser?.email}</p>

            {/* Stats */}
            <div className="bg-[#FAF8F3] rounded-2xl p-4 mb-4 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm text-black/60">Ocena</span>
                <span className="font-semibold text-black flex items-center gap-1">
                  <svg className="w-4 h-4 text-[#C44E35]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {profile?.rating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black/60">Opinie</span>
                <span className="font-semibold text-black">{profile?.total_reviews || 0}</span>
              </div>
            </div>

            {/* View Profile Button */}
            <Link href={`/profile/${initialUser.id}`} target="_blank" className="block">
              <Button className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-12">
                Zobacz swój profil
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <div>
          <h2 className="text-xl font-bold text-black mb-4">Edytuj profil</h2>
          <div className="bg-white rounded-2xl p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name_mobile" className="text-sm font-semibold text-black">
                  Imię i nazwisko *
                </Label>
                <Input
                  id="full_name_mobile"
                  placeholder="np. Jan Kowalski"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="rounded-2xl border-2 border-black/10 h-11 focus:border-black/30"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone_mobile" className="text-sm font-semibold text-black">
                  Telefon
                </Label>
                <Input
                  id="phone_mobile"
                  type="tel"
                  placeholder="np. +48 123 456 789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-2xl border-2 border-black/10 h-11 focus:border-black/30"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city_mobile" className="text-sm font-semibold text-black">
                  Miasto
                </Label>
                <Input
                  id="city_mobile"
                  placeholder="np. Warszawa"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="rounded-2xl border-2 border-black/10 h-11 focus:border-black/30"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio_mobile" className="text-sm font-semibold text-black">
                  O mnie
                </Label>
                <Textarea
                  id="bio_mobile"
                  placeholder="Napisz coś o sobie..."
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="rounded-2xl border-2 border-black/10 focus:border-black/30 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-11 text-sm font-semibold"
              >
                {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </Button>
            </form>
          </div>
        </div>

        {/* Banner Section */}
        <div>
          <h2 className="text-xl font-bold text-black mb-4">Banner profilu</h2>
          <div className="bg-white rounded-2xl p-5">
            <p className="text-sm text-black/60 mb-4">
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
                      <div className="bg-white rounded-full p-3 hover:bg-gray-100 transition-colors flex items-center justify-center">
                        {uploadingBanner ? (
                          <svg className="animate-spin w-5 h-5 text-[#C44E35]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <LottieIcon
                            animationPath="/animations/photo.json"
                            fallbackSvg={<img src="/icons/photo.svg" alt="Photo" className="w-full h-full" />}
                            className="w-5 h-5 text-[#C44E35]"
                            isHovered={isBannerHovered}
                          />
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
                  className="flex flex-col items-center justify-center w-full aspect-[3/1] border-2 border-dashed border-black/20 rounded-2xl cursor-pointer hover:border-black/40 hover:bg-black/5 transition-all"
                >
                  <div className="flex flex-col items-center justify-center pt-4 pb-4 px-4">
                    {uploadingBanner ? (
                      <svg className="animate-spin w-8 h-8 text-[#C44E35] mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <>
                        <LottieIcon
                          animationPath="/animations/photo.json"
                          fallbackSvg={<img src="/icons/photo.svg" alt="Photo" className="w-full h-full" />}
                          className="w-8 h-8 mb-2 text-black/40"
                          isHovered={isBannerHovered}
                        />
                        <p className="mb-1 text-sm text-black/70 font-semibold">Kliknij aby dodać banner</p>
                        <p className="text-xs text-black/50">1488×496px, Max. 5MB</p>
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
                variant="outline"
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
                className="w-full rounded-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-11"
              >
                Usuń banner
              </Button>
            )}
          </div>
        </div>

        {/* Privacy Settings */}
        <div>
          <h2 className="text-xl font-bold text-black mb-4">Ustawienia prywatności</h2>
          <div className="bg-white rounded-2xl p-5">
            <p className="text-sm text-black/60 mb-4">
              Kontroluj, jakie informacje są widoczne w Twoich ogłoszeniach
            </p>

            <form onSubmit={handlePrivacySubmit} className="space-y-4">
              {/* Show Phone */}
              <div className="flex items-center justify-between p-3 bg-[#FAF8F3] rounded-xl">
                <div className="flex-1 pr-3">
                  <Label htmlFor="show_phone_mobile" className="text-sm font-semibold text-black cursor-pointer">
                    Pokazuj numer telefonu
                  </Label>
                  <p className="text-xs text-black/60 mt-0.5">
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
              <div className="flex items-center justify-between p-3 bg-[#FAF8F3] rounded-xl">
                <div className="flex-1 pr-3">
                  <Label htmlFor="show_messages_mobile" className="text-sm font-semibold text-black cursor-pointer">
                    Pokazuj "Wyślij wiadomość"
                  </Label>
                  <p className="text-xs text-black/60 mt-0.5">
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
                className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-11 text-sm font-semibold"
              >
                {savingPrivacy ? 'Zapisywanie...' : 'Zapisz ustawienia'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Desktop: 2-column layout */}
      <div className="hidden md:grid grid-cols-3 gap-6">
        {/* Left sidebar - Profile Summary */}
        <div className="col-span-1">
          <Card className="border-0 rounded-3xl bg-white sticky top-24 overflow-visible">
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
                    <div className="w-32 h-32 rounded-full bg-[#C44E35] flex items-center justify-center">
                      <span className="text-5xl font-semibold text-white">
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
                    className="absolute bottom-0 right-0 w-10 h-10 bg-[#C44E35] hover:bg-[#B33D2A] rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg"
                  >
                    {uploading ? (
                      <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <LottieIcon
                        animationPath="/animations/camera.json"
                        fallbackSvg={<img src="/icons/camera.svg" alt="Camera" className="w-full h-full" />}
                        className="w-5 h-5 text-white"
                        isHovered={isAvatarHovered}
                      />
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
                <p className="text-xs text-gray-600 mt-2">Kliknij ikonę aby zmienić</p>

                {/* Remove Avatar Button */}
                {profile?.avatar_url && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAvatarRemove}
                    disabled={uploading}
                    className="mt-2 text-xs rounded-full border-2 border-red-200 text-red-600 hover:text-red-600 hover:bg-red-50 hover:border-red-300 h-8 px-3"
                  >
                    Usuń avatar
                  </Button>
                )}
              </div>

              <h2 className="text-2xl font-bold text-black mb-1">
                {formData.full_name || 'Użytkownik'}
              </h2>
              <p className="text-sm text-black/60 mb-4">{initialUser?.email}</p>

              {/* Stats */}
              <div className="space-y-3 text-left bg-[#FAF8F3] rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/60">Ocena</span>
                  <span className="font-semibold text-black flex items-center gap-1">
                    <svg className="w-4 h-4 text-[#C44E35]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {profile?.rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/60">Opinie</span>
                  <span className="font-semibold text-black">{profile?.total_reviews || 0}</span>
                </div>
              </div>

              {/* View Profile Button */}
              <Link href={`/profile/${initialUser.id}`} target="_blank">
                <Button
                  className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0"
                >
                  Zobacz swój profil
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Edit Form */}
        <div className="col-span-2">
          <Card className="border-0 rounded-3xl bg-white">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-black">Edytuj profil</CardTitle>
              <CardDescription className="text-sm md:text-base text-black/60">
                Zaktualizuj swoje dane i informacje kontaktowe
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1: Full Name & Phone */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-3">
                    <Label htmlFor="full_name" className="text-base font-semibold text-black">
                      Imię i nazwisko *
                    </Label>
                    <Input
                      id="full_name"
                      placeholder="np. Jan Kowalski"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-base font-semibold text-black">
                      Telefon
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="np. +48 123 456 789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30"
                    />
                  </div>
                </div>

                {/* Row 2: City (full width) */}
                <div className="space-y-3">
                  <Label htmlFor="city" className="text-base font-semibold text-black">
                    Miasto
                  </Label>
                  <Input
                    id="city"
                    placeholder="np. Warszawa"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-3">
                  <Label htmlFor="bio" className="text-base font-semibold text-black">
                    O mnie
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Napisz coś o sobie..."
                    rows={6}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="rounded-2xl border-2 border-black/10 focus:border-black/30 resize-none"
                  />
                </div>

                {/* Footer with buttons */}
                <div className="mt-8 pt-6 border-t-2 border-black/5">
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="w-full md:w-auto rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-11 px-8 text-sm font-semibold"
                    >
                      {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Profile Banner Card */}
          <Card className="border-0 rounded-3xl bg-white mt-6">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-black">Banner profilu</CardTitle>
              <CardDescription className="text-sm md:text-base text-black/60">
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
                        <div className="bg-white rounded-full p-4 hover:bg-gray-100 transition-colors flex items-center justify-center">
                          {uploadingBanner ? (
                            <svg className="animate-spin w-6 h-6 text-[#C44E35]" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <LottieIcon
                              animationPath="/animations/photo.json"
                              fallbackSvg={<img src="/icons/photo.svg" alt="Photo" className="w-full h-full" />}
                              className="w-6 h-6 text-[#C44E35]"
                              isHovered={isBannerHovered}
                            />
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
                    className="flex flex-col items-center justify-center w-full aspect-[3/1] border-2 border-dashed border-black/20 rounded-2xl cursor-pointer hover:border-black/40 hover:bg-black/5 transition-all"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                      {uploadingBanner ? (
                        <svg className="animate-spin w-10 h-10 text-[#C44E35] mb-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <>
                          <LottieIcon
                            animationPath="/animations/photo.json"
                            fallbackSvg={<img src="/icons/photo.svg" alt="Photo" className="w-full h-full" />}
                            className="w-10 h-10 mb-3 text-black/40"
                            isHovered={isBannerHovered}
                          />
                          <p className="mb-2 text-sm text-black/70">
                            <span className="font-semibold">Kliknij aby dodać banner</span>
                          </p>
                          <p className="text-xs text-black/50">1488×496px</p>
                          <p className="text-xs text-black/50 mt-1">Max. 5MB</p>
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
                  variant="outline"
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
                  className="w-full rounded-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  Usuń banner
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Privacy Settings Card */}
          <Card className="border-0 rounded-3xl bg-white mt-6">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-black">Ustawienia prywatności</CardTitle>
              <CardDescription className="text-sm md:text-base text-black/60">
                Kontroluj, jakie informacje są widoczne w Twoich ogłoszeniach
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePrivacySubmit} className="space-y-6">
                {/* Show Phone */}
                <div className="flex items-center justify-between p-4 bg-[#FAF8F3] rounded-2xl">
                  <div className="flex-1 pr-4">
                    <Label htmlFor="show_phone" className="text-base font-semibold text-black cursor-pointer">
                      Pokazuj numer telefonu
                    </Label>
                    <p className="text-sm text-black/60 mt-1">
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
                <div className="flex items-center justify-between p-4 bg-[#FAF8F3] rounded-2xl">
                  <div className="flex-1 pr-4">
                    <Label htmlFor="show_messages" className="text-base font-semibold text-black cursor-pointer">
                      Pokazuj przycisk "Wyślij wiadomość"
                    </Label>
                    <p className="text-sm text-black/60 mt-1">
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
                <div className="mt-8 pt-6 border-t-2 border-black/5">
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={savingPrivacy}
                      className="w-full md:w-auto rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-11 px-8 text-sm font-semibold"
                    >
                      {savingPrivacy ? 'Zapisywanie...' : 'Zapisz ustawienia prywatności'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
