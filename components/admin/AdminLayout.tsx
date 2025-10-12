'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Logo } from '@/components/Logo'
import { useState } from 'react'

interface AdminLayoutProps {
  children: React.ReactNode
  user: {
    id: string
    email?: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  }
  stats?: {
    reportsCount?: number
    bannedUsersCount?: number
    moderationCount?: number
    synonymsCount?: number
  }
}

const navItems = [
  {
    label: 'Przegląd',
    href: '/admin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Kategorie',
    href: '/admin/categories',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    label: 'Moderacja',
    href: '/admin/moderation',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    badge: 'moderationCount',
  },
  {
    label: 'Zgłoszenia',
    href: '/admin/reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
    ),
    badge: 'reportsCount',
  },
  {
    label: 'Użytkownicy',
    href: '/admin/banned-users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    badge: 'bannedUsersCount',
  },
  {
    label: 'RODO / Audit',
    href: '/admin/audit-logs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    label: 'Synonymy',
    href: '/admin/synonyms',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    badge: 'synonymsCount',
  },
  {
    label: 'AI Embeddings',
    href: '/admin/embeddings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    label: 'Ustawienia AI',
    href: '/admin/ai-settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
]

export function AdminLayout({ children, user, stats }: AdminLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getBadgeCount = (badgeKey?: string) => {
    if (!badgeKey || !stats) return null
    const count = stats[badgeKey as keyof typeof stats]
    return count && count > 0 ? count : null
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-black/5 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <Logo className="w-7 h-7" />
            <div className="flex flex-col -space-y-0.5">
              <span className="text-base font-bold text-black leading-tight">FindSomeone</span>
              <span className="text-[9px] text-black/50 leading-tight font-medium tracking-wide">PANEL ADMINISTRATORA</span>
            </div>
          </div>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-sm">
            Wyjdź
          </Button>
        </Link>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-black/5 z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="h-16 border-b border-black/5 flex items-center px-6">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <Logo className="w-9 h-9 flex-shrink-0" />
              <div className="flex flex-col -space-y-0.5">
                <span className="text-lg font-bold text-black leading-tight">FindSomeone</span>
                <span className="text-[10px] text-black/50 leading-tight font-medium tracking-wide">PANEL ADMINISTRATORA</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const badgeCount = getBadgeCount(item.badge)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#C44E35] text-white'
                        : 'text-black/70 hover:bg-black/5 hover:text-black'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-black/60'}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {badgeCount && (
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#C44E35]/10 text-[#C44E35]'
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* User Info */}
          <div className="border-t border-black/5 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-[#C44E35] text-white">
                  {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black truncate">
                  {user.user_metadata?.full_name || 'Administrator'}
                </p>
                <p className="text-xs text-black/60 truncate">{user.email}</p>
              </div>
            </div>
            <Link href="/dashboard" className="block">
              <Button
                variant="outline"
                className="w-full rounded-lg border-black/10 text-black/70 hover:bg-black/5"
                size="sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Wróć do strony
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
