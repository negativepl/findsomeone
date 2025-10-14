'use client'

import { User } from '@supabase/supabase-js'
import { NavbarClient } from '@/components/NavbarClient'
import { NavbarWrapper } from '@/components/NavbarWrapper'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PostDetailClientWrapperProps {
  user: User | null
  children: React.ReactNode
  postTitle: string
  isAdmin: boolean
}

export function PostDetailClientWrapper({ user, children, postTitle, isAdmin }: PostDetailClientWrapperProps) {
  const [profile, setProfile] = useState<{ avatar_url: string | null; full_name: string | null } | null>(null)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    // Fetch profile
    supabase
      .from('profiles')
      .select('avatar_url, full_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data)
      })
  }, [user])

  // Handle scroll to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold
        setIsHeaderVisible(false)
      } else {
        // Scrolling up
        setIsHeaderVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <>
      <NavbarWrapper alwaysVisible={true}>
        <NavbarClient
          user={user}
          showAddButton={true}
          profile={profile}
          isAdmin={isAdmin}
        />
      </NavbarWrapper>
      <div className="h-[60px]" />

      {/* Title below navbar - Mobile only */}
      <div className={`md:hidden fixed top-[60px] left-0 right-0 z-30 transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        {/* White background extending to the top */}
        <div className="absolute inset-0 -top-[60px] bg-white" />

        {/* Content */}
        <div className="relative bg-white border-b border-black/5 px-4 pt-6 pb-4">
          <h1 className="text-lg font-bold text-black leading-tight">{postTitle}</h1>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="md:hidden h-[60px]" />

      {children}
    </>
  )
}
