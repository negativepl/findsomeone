'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BookingCalendar } from './BookingCalendar'

interface BookingButtonProps {
  postId: string
  providerId: string
  providerName: string
  postTitle: string
}

export function BookingButton({ postId, providerId, providerName, postTitle }: BookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleClick = () => {
    if (isMobile) {
      router.push(`/posts/${postId}/booking`)
    } else {
      setIsOpen(true)
    }
  }

  return (
    <>
      <Button
        onClick={handleClick}
        className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0 py-5 md:py-6 text-base md:text-lg"
      >
        Zarezerwuj termin
      </Button>

      {/* Desktop Dialog */}
      {!isMobile && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-[90vw] lg:max-w-[1200px] max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Rezerwacja terminu</DialogTitle>
              <DialogDescription>
                Wybierz dogodny termin spotkania z {providerName}
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              <BookingCalendar
                providerId={providerId}
                providerName={providerName}
                postId={postId}
                postTitle={postTitle}
                onClose={() => setIsOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
