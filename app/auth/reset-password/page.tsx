'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token')
      const type = searchParams.get('type')

      if (token && type === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery',
        })

        if (error) {
          setError('Link wygasł lub jest nieprawidłowy. Spróbuj ponownie zresetować hasło.')
        }
      }

      setVerifying(false)
    }

    verifyToken()
  }, [searchParams, supabase.auth])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Hasło musi mieć minimum 6 znaków')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 rounded-3xl bg-white shadow-lg">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-xl md:text-2xl font-bold text-black">Weryfikacja...</CardTitle>
            <CardDescription className="text-sm md:text-base text-black/60 mt-2">
              Sprawdzamy Twój link resetowania hasła...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 rounded-3xl bg-white shadow-lg">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-xl md:text-2xl font-bold text-black">Hasło zmienione!</CardTitle>
            <CardDescription className="text-sm md:text-base text-black/60 mt-2">
              Twoje hasło zostało pomyślnie zmienione. Za chwilę zostaniesz przekierowany do panelu.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="28" r="11" fill="#1A1A1A" />
              <path d="M32 42 C24 42, 18 47, 18 60 L18 78 C18 80, 19 82, 21 82 L43 82 C45 82, 46 80, 46 78 L46 60 C46 47, 40 42, 32 42 Z" fill="#1A1A1A" />
              <circle cx="68" cy="28" r="11" fill="#C44E35" />
              <path d="M68 42 C60 42, 54 47, 54 60 L54 78 C54 80, 55 82, 57 82 L79 82 C81 82, 82 80, 82 78 L82 60 C82 47, 76 42, 68 42 Z" fill="#C44E35" />
            </svg>
            <h1 className="text-3xl font-bold text-black">FindSomeone</h1>
          </Link>
          <p className="text-black/60 mt-2">Ustaw nowe hasło do swojego konta</p>
        </div>

        <Card className="border-0 rounded-3xl bg-white shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl md:text-2xl font-bold text-black text-center">Ustaw nowe hasło</CardTitle>
            <CardDescription className="text-sm md:text-base text-black/60 text-center">
              Wprowadź nowe hasło dla swojego konta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-semibold text-black">
                  Nowe hasło
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 znaków"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-base font-semibold text-black">
                  Potwierdź hasło
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Powtórz hasło"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-4 rounded-2xl border border-red-200">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? 'Zmienianie hasła...' : 'Zmień hasło'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to login */}
        <div className="text-center mt-6">
          <Link href="/login" className="text-sm text-black/60 hover:text-black transition-colors">
            ← Powrót do logowania
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 rounded-3xl bg-white shadow-lg">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-xl md:text-2xl font-bold text-black">Ładowanie...</CardTitle>
            <CardDescription className="text-sm md:text-base text-black/60 mt-2">
              Przygotowywanie formularza resetowania hasła...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
