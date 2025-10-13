'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageBubble } from '@/components/MessageBubble'
import { ChatInput } from '@/components/ChatInput'
import { EmptyChatPlaceholder } from '@/components/EmptyChatPlaceholder'
import { TypingIndicator } from '@/components/TypingIndicator'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTypingIndicator } from '@/lib/hooks/useTypingIndicator'
import { useUpdatePresence } from '@/lib/hooks/usePresence'

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  receiver_id: string
  read: boolean
  sender: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface ChatWindowProps {
  messages: Message[]
  currentUserId: string
  otherUser: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

export function ChatWindow({ messages: initialMessages, currentUserId, otherUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Typing indicator
  const conversationId = [currentUserId, otherUser.id].sort().join('-')
  const { isOtherUserTyping, sendTypingStatus } = useTypingIndicator(conversationId, otherUser.id)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Update presence (mark user as online)
  useUpdatePresence()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Real-time subscription for new messages
  useEffect(() => {
    const supabase = createClient()

    // Create unique channel name for this conversation
    const channelName = `messages:${conversationId}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMsg = payload.new as any

          // Only process messages in this conversation
          if (
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === otherUser.id) ||
            (newMsg.sender_id === otherUser.id && newMsg.receiver_id === currentUserId)
          ) {
            // Fetch the complete message with sender info
            const { data: newMessage } = await supabase
              .from('messages')
              .select(`
                id,
                content,
                created_at,
                sender_id,
                receiver_id,
                read,
                sender:sender_id (
                  id,
                  full_name,
                  avatar_url
                )
              `)
              .eq('id', newMsg.id)
              .single()

            if (newMessage) {
              setMessages((prev) => {
                // Prevent duplicates
                if (prev.some(m => m.id === newMessage.id)) {
                  return prev
                }
                return [...prev, newMessage as Message]
              })

              // Mark as read if we're the receiver
              if (newMessage.receiver_id === currentUserId) {
                await supabase
                  .from('messages')
                  .update({ read: true })
                  .eq('id', newMessage.id)
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const updatedMsg = payload.new as any

          // Update read status in local state
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMsg.id
                ? { ...msg, read: updatedMsg.read }
                : msg
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, otherUser.id, conversationId])

  const handleTyping = (isTyping: boolean) => {
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Send typing status
    sendTypingStatus(isTyping)

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false)
      }, 3000)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isSending) return

    setIsSending(true)
    setError(null)

    // Stop typing indicator
    sendTypingStatus(false)

    try {
      const supabase = createClient()

      const newMessage = {
        content: content.trim(),
        sender_id: currentUserId,
        receiver_id: otherUser.id,
        read: false,
      }

      const { data, error: insertError } = await supabase
        .from('messages')
        .insert(newMessage)
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          read,
          sender:sender_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)

        // Handle specific security-related errors
        let errorMessage = 'Nie udało się wysłać wiadomości.'

        const errorStr = insertError.message.toLowerCase()

        if (errorStr.includes('check_message_rate_limit') || errorStr.includes('rate')) {
          errorMessage = '⏱️ Wysłałeś zbyt wiele wiadomości. Maksymalnie 20 wiadomości na godzinę. Poczekaj chwilę.'
        } else if (errorStr.includes('check_conversation_spam') || errorStr.includes('spam')) {
          errorMessage = '⚠️ Wysyłasz zbyt wiele wiadomości do tej osoby. Maksymalnie 3 wiadomości w ciągu 5 minut.'
        } else if (errorStr.includes('check_message_min_length') || errorStr.includes('min_length')) {
          errorMessage = '📏 Wiadomość jest zbyt krótka (minimum 10 znaków).'
        } else if (errorStr.includes('check_message_max_length') || errorStr.includes('max_length')) {
          errorMessage = '📏 Wiadomość jest zbyt długa (maksimum 2000 znaków).'
        } else if (errorStr.includes('check_not_self_message') || errorStr.includes('self')) {
          errorMessage = '🚫 Nie możesz wysłać wiadomości do siebie.'
        } else {
          // Show the actual error for debugging
          errorMessage = `Błąd: ${insertError.message}`
        }

        setError(errorMessage)
        setLoading(false)
        return
      }

      if (data) {
        setMessages((prev) => [...prev, data as Message])
        setError(null)
      }
    } catch (err: any) {
      console.error('Error sending message:', err)
      if (!error) {
        setError('Wystąpił nieoczekiwany błąd podczas wysyłania wiadomości')
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="container mx-auto px-4 md:px-6 py-6">
          {messages.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  messageId={message.id}
                  content={message.content}
                  createdAt={message.created_at}
                  isOwn={message.sender_id === currentUserId}
                  senderName={message.sender?.full_name || undefined}
                  senderAvatar={message.sender?.avatar_url}
                  read={message.read}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <EmptyChatPlaceholder userName={otherUser.full_name || undefined} />
          )}

          {/* Typing Indicator */}
          {isOtherUserTyping && (
            <div className="max-w-4xl mx-auto">
              <TypingIndicator userName={otherUser.full_name || undefined} />
            </div>
          )}
        </div>
      </div>

      {/* Input Container - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 rounded-t-3xl z-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="p-3 mb-2 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
                {error}
              </div>
            )}
            <ChatInput
              onSend={handleSendMessage}
              onTyping={handleTyping}
              disabled={isSending}
              placeholder={`Napisz do ${otherUser.full_name || 'użytkownika'}...`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
