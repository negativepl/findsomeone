'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Phone, MessageCircle } from 'lucide-react'
import { SendMessageModal } from '@/components/SendMessageModal'
import { AI_BOT_USER_ID } from '@/lib/constants'

interface MobileActionDockProps {
  postId: string
  receiverId: string
  receiverName: string
  postTitle: string
  phone?: string | null
  showMessages: boolean
  showPhone: boolean
  isOwnPost: boolean
}

export function MobileActionDock({
  postId,
  receiverId,
  receiverName,
  postTitle,
  phone,
  showMessages,
  showPhone,
  isOwnPost,
}: MobileActionDockProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold
        setIsVisible(false)
      } else {
        // Scrolling up
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Listen for menu open/close events
  useEffect(() => {
    const handleMenuOpen = () => setIsMenuOpen(true)
    const handleMenuClose = () => setIsMenuOpen(false)

    window.addEventListener('mobileDockMenuOpen', handleMenuOpen)
    window.addEventListener('mobileDockMenuClose', handleMenuClose)

    return () => {
      window.removeEventListener('mobileDockMenuOpen', handleMenuOpen)
      window.removeEventListener('mobileDockMenuClose', handleMenuClose)
    }
  }, [])

  const handlePhoneClick = async () => {
    if (!phone) return

    // Track phone reveal
    try {
      await fetch('/api/track-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
    } catch (error) {
      console.error('Failed to track phone reveal:', error)
    }

    // Initiate call
    window.location.href = `tel:${phone}`
  }

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 z-30 pb-[72px] transition-transform duration-300 ${
      (isVisible && !isMenuOpen) ? 'translate-y-0' : 'translate-y-full'
    }`}>
      {/* Action buttons */}
      <div className="flex gap-2 px-4 py-3">
        {isOwnPost ? (
          // Edit button for own posts
          <div className="flex-1">
            <Button
              onClick={() => window.location.href = `/dashboard/my-posts/${postId}/edit`}
              className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 h-11 text-sm font-semibold gap-0"
            >
              Edytuj ogłoszenie
            </Button>
          </div>
        ) : (
          <>
            {/* Phone button */}
            {showPhone && phone && (
              <div className="flex-1">
                <Button
                  onClick={handlePhoneClick}
                  className="w-full rounded-full bg-white hover:bg-black/5 text-black border-2 border-black/10 hover:border-black/30 h-11 text-sm font-semibold gap-0"
                >
                  Zadzwoń
                </Button>
              </div>
            )}

            {/* Message button */}
            {showMessages && receiverId !== AI_BOT_USER_ID && (
              <div className="flex-1">
                <SendMessageModal
                  postId={postId}
                  receiverId={receiverId}
                  receiverName={receiverName}
                  postTitle={postTitle}
                  variant="mobile-dock"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
