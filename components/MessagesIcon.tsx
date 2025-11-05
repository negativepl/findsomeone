'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { useUnreadCount } from '@/lib/hooks/useMessages'
import { useQueryClient } from '@tanstack/react-query'
import { LottieIcon } from './LottieIcon'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Lottie from 'lottie-react'

interface MessagesIconProps {
  user: User | null
}


export function MessagesIcon({ user }: MessagesIconProps) {
  const { data: unreadCount = 0 } = useUnreadCount(user?.id)
  const queryClient = useQueryClient()
  const [isHovered, setIsHovered] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const prevCountRef = useRef(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const audioArrayBufferRef = useRef<ArrayBuffer | null>(null)
  const notificationAnimationRef = useRef<any>(null)

  // Fix hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    // Load audio file (but don't create AudioContext yet - iOS requires user interaction)
    if (typeof window !== 'undefined') {
      // Pre-load audio file as ArrayBuffer
      fetch('/sounds/message-notification.mp3')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
          audioArrayBufferRef.current = arrayBuffer
        })
        .catch(() => {})

      // Initialize AudioContext on first user interaction (required by iOS)
      const initAudio = () => {
        if (!audioContextRef.current) {
          try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

            // Decode audio if we have the ArrayBuffer
            if (audioArrayBufferRef.current && !audioBufferRef.current) {
              audioContextRef.current.decodeAudioData(audioArrayBufferRef.current)
                .then(audioBuffer => {
                  audioBufferRef.current = audioBuffer
                })
                .catch(() => {})
            }

            // Resume if suspended
            if (audioContextRef.current.state === 'suspended') {
              audioContextRef.current.resume()
            }
          } catch (err) {
            // Silent fail
          }
        }
      }

      document.addEventListener('click', initAudio, { once: true })
      document.addEventListener('touchstart', initAudio, { once: true })
      document.addEventListener('keydown', initAudio, { once: true })
    }
    // Preload Lottie animation
    fetch('/animations/message-notification.json')
      .then(res => res.json())
      .then(data => {
        notificationAnimationRef.current = data
      })
      .catch(err => console.error('Failed to load notification animation:', err))
  }, [])

  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    // Subscribe to real-time changes for instant updates
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          // New message received - invalidate to refetch count
          queryClient.invalidateQueries({ queryKey: ['messages', 'unread', user.id] })

          // Play notification sound using Web Audio API
          const playSound = async () => {
            // If AudioContext doesn't exist yet but we have the ArrayBuffer, decode it now
            if (!audioContextRef.current && audioArrayBufferRef.current) {
              try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
                const audioBuffer = await audioContextRef.current.decodeAudioData(audioArrayBufferRef.current)
                audioBufferRef.current = audioBuffer
              } catch (err) {
                return
              }
            }

            if (audioContextRef.current && audioBufferRef.current) {
              try {
                // Resume context if suspended
                if (audioContextRef.current.state === 'suspended') {
                  await audioContextRef.current.resume()
                }

                const source = audioContextRef.current.createBufferSource()
                source.buffer = audioBufferRef.current

                // Create gain node for volume control (0.5 = 50%)
                const gainNode = audioContextRef.current.createGain()
                gainNode.gain.value = 0.5

                source.connect(gainNode)
                gainNode.connect(audioContextRef.current.destination)
                source.start(0)
              } catch (err) {
                // Silent fail
              }
            }
          }

          playSound()

          // Fetch sender details
          const newMessage = payload.new as any
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newMessage.sender_id)
            .single()

          const senderName = senderProfile?.full_name || 'Nieznany użytkownik'

          // Show custom toast with Lottie animation
          const animData = notificationAnimationRef.current

          toast.custom((t) => (
            <div className="bg-white rounded-2xl shadow-lg border border-black/10 p-4 min-w-[320px]">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  {animData ? (
                    <Lottie
                      animationData={animData}
                      loop={false}
                      autoplay={true}
                      style={{ width: 48, height: 48 }}
                    />
                  ) : (
                    <img
                      src="/icons/message-notification.svg"
                      alt="Message"
                      className="w-12 h-12"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-black">Nowa wiadomość</p>
                  <p className="text-sm text-black/60">Od: {senderName}</p>
                </div>
              </div>
              <Link
                href="/dashboard/messages"
                onClick={() => toast.dismiss(t)}
                className="block w-full text-center bg-brand hover:bg-brand/90 text-white text-sm font-medium py-2 rounded-xl transition-colors"
              >
                Zobacz wiadomość
              </Link>
            </div>
          ), {
            duration: 5000,
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          // Message marked as read - invalidate to refetch count
          const updatedMsg = payload.new as any
          if (updatedMsg.read && updatedMsg.receiver_id === user.id) {
            queryClient.invalidateQueries({ queryKey: ['messages', 'unread', user.id] })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, queryClient])

  // Trigger animation when count changes
  useEffect(() => {
    if (isMounted && prevCountRef.current !== unreadCount && prevCountRef.current !== 0) {
      setHasChanged(true)
      const timer = setTimeout(() => setHasChanged(false), 600)
      return () => clearTimeout(timer)
    }
    prevCountRef.current = unreadCount
  }, [unreadCount, isMounted])

  if (!user) {
    return null
  }

  const displayCount = isMounted ? unreadCount : 0

  return (
    <Link
      href="/dashboard/messages"
      className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-brand hover:bg-brand/90 transition-colors"
      aria-label={`Wiadomości${displayCount > 0 ? ` (${displayCount} nieprzeczytanych)` : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <LottieIcon
        animationPath="/animations/messages.json"
        fallbackSvg={<img src="/icons/messages.svg" alt="Messages" className="w-full h-full" />}
        className="h-5 w-5"
        isHovered={isHovered}
      />
      <AnimatePresence mode="wait">
        {isMounted && displayCount > 0 && (
          <motion.span
            key={displayCount}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: hasChanged ? [1, 1.3, 1] : 1,
              opacity: 1
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              duration: hasChanged ? 0.4 : 0.2,
              ease: [0.34, 1.56, 0.64, 1]
            }}
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-white text-brand text-xs font-bold rounded-full border border-brand"
          >
            {displayCount > 99 ? '99+' : displayCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}
