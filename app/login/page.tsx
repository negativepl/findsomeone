'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Check if it's an unconfirmed email error
      if (error.message.includes('Email not confirmed') || error.message.includes('not confirmed')) {
        setError('Musisz potwierdzić swoje konto. Sprawdź email i kliknij w link aktywacyjny.')
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Nieprawidłowy email lub hasło')
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }
      router.push('/')
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setResetEmailSent(true)
      setLoading(false)
    }
  }

  if (showForgotPassword) {
    if (resetEmailSent) {
      return (
        <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
          {/* Left side - Video (hidden on mobile) */}
          <div className="hidden lg:flex items-center justify-end pr-24 pl-6">
            <motion.video
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              autoPlay
              loop
              muted
              playsInline
              className="w-full max-w-lg rounded-3xl"
            >
              <source src="/login-video.mp4" type="video/mp4" />
            </motion.video>
          </div>

          {/* Right side - Success message */}
          <div className="min-h-screen flex items-center justify-center p-6 pb-safe lg:pb-6 lg:pl-24 lg:pr-6">
            <div className="w-full max-w-md pb-20 lg:pb-0">
            {/* Logo/Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex flex-row items-center gap-2">
                <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="28" r="11" fill="#E87B5C" />
                  <path d="M32 42 C24 42, 18 47, 18 60 L18 78 C18 80, 19 82, 21 82 L43 82 C45 82, 46 80, 46 78 L46 60 C46 47, 40 42, 32 42 Z" fill="#E87B5C" />
                  <circle cx="68" cy="28" r="11" className="fill-brand" />
                  <path d="M68 42 C60 42, 54 47, 54 60 L54 78 C54 80, 55 82, 57 82 L79 82 C81 82, 82 80, 82 78 L82 60 C82 47, 76 42, 68 42 Z" className="fill-brand" />
                </svg>
                <h1 className="text-2xl font-bold text-foreground font-[family-name:var(--font-lora)]">FindSomeone</h1>
              </Link>
            </div>

            <Card className="rounded-3xl shadow-sm border">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold">Email wysłany!</CardTitle>
                <CardDescription className="text-sm md:text-base mt-2">
                  Sprawdź swoją skrzynkę email. Wysłaliśmy Ci link do resetowania hasła.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setShowForgotPassword(false)
                  setResetEmailSent(false)
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Powrót do logowania
              </button>
            </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
        {/* Left side - Video (hidden on mobile) */}
        <div className="hidden lg:flex items-center justify-end pr-24 pl-6">
          <motion.video
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-w-lg rounded-3xl"
          >
            <source src="/login-video.mp4" type="video/mp4" />
          </motion.video>
        </div>

        {/* Right side - Reset form */}
        <div className="min-h-screen flex items-center justify-center p-6 pb-safe lg:pb-6 lg:pl-24 lg:pr-6">
          <div className="w-full max-w-md pb-20 lg:pb-0">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex flex-row items-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="28" r="11" fill="#E87B5C" />
                <path d="M32 42 C24 42, 18 47, 18 60 L18 78 C18 80, 19 82, 21 82 L43 82 C45 82, 46 80, 46 78 L46 60 C46 47, 40 42, 32 42 Z" fill="#E87B5C" />
                <circle cx="68" cy="28" r="11" className="fill-brand" />
                <path d="M68 42 C60 42, 54 47, 54 60 L54 78 C54 80, 55 82, 57 82 L79 82 C81 82, 82 80, 82 78 L82 60 C82 47, 76 42, 68 42 Z" className="fill-brand" />
              </svg>
              <h1 className="text-2xl font-bold text-foreground font-[family-name:var(--font-lora)]">FindSomeone</h1>
            </Link>
          </div>

          <Card className="rounded-3xl shadow-sm border">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl md:text-3xl font-bold">Zresetuj hasło</CardTitle>
              <CardDescription className="text-sm md:text-base mt-2">
                Podaj swój adres email, a wyślemy Ci link do resetowania hasła
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-semibold">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="twoj@email.pl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-2xl h-12"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-4 rounded-2xl border border-red-200 dark:border-red-900">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-12 text-base font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Powrót do logowania
            </button>
          </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      {/* Left side - Video (hidden on mobile) */}
      <div className="hidden lg:flex items-center justify-end pr-24 pl-6">
        <motion.video
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          autoPlay
          loop
          muted
          playsInline
          className="w-full max-w-lg rounded-3xl"
        >
          <source src="/login-video.mp4" type="video/mp4" />
        </motion.video>
      </div>

      {/* Right side - Login form */}
      <div className="min-h-screen flex items-center justify-center p-6 pb-safe lg:pb-6 lg:pl-24 lg:pr-6">
        <div className="w-full max-w-md pb-20 lg:pb-0">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-row items-center gap-2">
            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="28" r="11" fill="#E87B5C" />
              <path d="M32 42 C24 42, 18 47, 18 60 L18 78 C18 80, 19 82, 21 82 L43 82 C45 82, 46 80, 46 78 L46 60 C46 47, 40 42, 32 42 Z" fill="#E87B5C" />
              <circle cx="68" cy="28" r="11" className="fill-brand" />
              <path d="M68 42 C60 42, 54 47, 54 60 L54 78 C54 80, 55 82, 57 82 L79 82 C81 82, 82 80, 82 78 L82 60 C82 47, 76 42, 68 42 Z" className="fill-brand" />
            </svg>
            <h1 className="text-2xl font-bold text-foreground font-[family-name:var(--font-lora)]">FindSomeone</h1>
          </Link>
        </div>

        <Card className="rounded-3xl shadow-sm border">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl md:text-2xl font-bold text-center">Witaj ponownie!</CardTitle>
            <CardDescription className="text-sm md:text-base text-center">
              Wprowadź swoje dane, aby się zalogować
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-2xl h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-semibold">
                  Hasło
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-2xl h-12"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground cursor-pointer select-none"
                  >
                    Zapamiętaj mnie
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-brand hover:text-brand/80 font-medium transition-colors"
                >
                  Zapomniałeś hasła?
                </button>
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-4 rounded-2xl border border-red-200 dark:border-red-900">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? 'Logowanie...' : 'Zaloguj się'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-4 text-muted-foreground font-medium">LUB</span>
              </div>
            </div>

            <Button
              type="button"
              className="w-full rounded-full h-12 border border-border bg-muted hover:bg-accent text-foreground"
              onClick={handleGoogleLogin}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Kontynuuj z Google
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Nie masz konta?{' '}
                <Link href="/signup" className="text-brand hover:text-brand/80 font-semibold transition-colors">
                  Zarejestruj się
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Powrót do strony głównej
          </Link>
        </div>
        </div>
      </div>
    </div>
  )
}
