import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Only check auth for specific routes
  const protectedPaths = ['/dashboard', '/admin']
  const authPaths = ['/login', '/signup']
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => request.nextUrl.pathname === path)

  if (isProtected || isAuthPath) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protect dashboard routes
    if (!user && isProtected) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect authenticated users away from auth pages
    if (user && isAuthPath) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Check if user is banned (only for protected routes)
    if (user && isProtected) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('banned, ban_reason')
        .eq('id', user.id)
        .single()

      if (profile?.banned && !request.nextUrl.pathname.startsWith('/banned')) {
        const url = new URL('/banned', request.url)
        url.searchParams.set('reason', profile.ban_reason || 'Naruszenie regulaminu')
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
