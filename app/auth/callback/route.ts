import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')
  const origin = requestUrl.origin

  const supabase = await createClient()

  // Handle OAuth code exchange
  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
    return NextResponse.redirect(`${origin}/`)
  }

  // Handle OTP token verification (for email confirmation, magic links, etc.)
  if (token && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    })

    if (error) {
      console.error('OTP verification error:', error)
      return NextResponse.redirect(`${origin}/login?error=verification_failed`)
    }

    return NextResponse.redirect(`${origin}/`)
  }

  // No code or token provided, redirect to home
  return NextResponse.redirect(`${origin}/`)
}
