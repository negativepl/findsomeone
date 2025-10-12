'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface Profile {
  id: string
  email: string
  full_name: string | null
  bio: string | null
  phone: string | null
  city: string | null
  avatar_url: string | null
  rating: number
  total_reviews: number
  verified: boolean
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

  const [formData, setFormData] = useState({
    full_name: initialProfile.full_name || '',
    bio: initialProfile.bio || '',
    phone: initialProfile.phone || '',
    city: initialProfile.city || '',
  })

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

  return (
    <main className="container mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-3">Mój profil</h1>
        <p className="text-lg text-black/60">
          Zarządzaj swoimi danymi i informacjami kontaktowymi
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left sidebar - Profile Summary */}
        <div className="md:col-span-1">
          <Card className="border-0 rounded-3xl bg-white sticky top-24">
            <CardContent className="p-6 text-center">
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
                        {formData.full_name?.charAt(0) || initialUser?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}

                  {/* Upload button overlay */}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 w-10 h-10 bg-[#C44E35] hover:bg-[#B33D2A] rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg"
                  >
                    {uploading ? (
                      <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
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
                <p className="text-xs text-black/50 mt-2">Kliknij ikonę aby zmienić</p>
              </div>

              <h2 className="text-2xl font-bold text-black mb-1">
                {formData.full_name || 'Użytkownik'}
              </h2>
              <p className="text-sm text-black/60 mb-4">{initialUser?.email}</p>

              {/* Stats */}
              <div className="space-y-3 text-left bg-[#FAF8F3] rounded-2xl p-4">
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/60">Zweryfikowany</span>
                  {profile?.verified ? (
                    <span className="text-green-600 font-semibold">✓</span>
                  ) : (
                    <span className="text-black/40">—</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Edit Form */}
        <div className="md:col-span-2">
          <Card className="border-0 rounded-3xl bg-white">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-black">Edytuj profil</CardTitle>
              <CardDescription className="text-base text-black/60">
                Zaktualizuj swoje dane i informacje kontaktowe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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

                {/* Email (read-only) */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-semibold text-black">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={initialUser?.email || ''}
                    disabled
                    className="rounded-2xl border-2 border-black/10 h-12 bg-black/5 text-black/60"
                  />
                  <p className="text-sm text-black/60">Email nie może być zmieniony</p>
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

                {/* City */}
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-12 text-base font-semibold"
                >
                  {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
