import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { PresenceIndicator } from '@/components/PresenceIndicator'
import { Metadata } from 'next'
import { ChatWindow } from './ChatWindow'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Konwersacja",
}

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

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: otherUserId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get the other user's profile
  const { data: otherUser } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', otherUserId)
    .single()

  if (!otherUser) {
    redirect('/dashboard/messages')
  }

  // Get all messages between these two users
  const { data: messages } = await supabase
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
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true })

  // Mark all received messages as read
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('receiver_id', user.id)
    .eq('sender_id', otherUserId)
    .eq('read', false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavbarWithHide
        user={user}
        alwaysVisible={true}
        noRounding={true}
        pageTitle={otherUser.full_name || 'Czat'}
        backUrl="/dashboard/messages"
        otherUserId={otherUser.id}
      />

      {/* Chat Header - Fixed (Desktop only) */}
      <div className="hidden md:block fixed top-16 left-0 right-0 bg-card border-b border-border rounded-b-3xl z-30">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/messages"
              className="flex-shrink-0 hover:bg-muted rounded-full p-2 transition-colors"
              aria-label="Wróć do listy wiadomości"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>

            <Link
              href={`/profile/${otherUser.id}`}
              className="flex items-center gap-2 md:gap-3 p-2 hover:bg-muted rounded-2xl transition-colors"
            >
              {otherUser.avatar_url ? (
                <img
                  src={otherUser.avatar_url}
                  alt=""
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                  <span className="text-base md:text-lg font-semibold text-white">
                    {otherUser.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}

              <div className="min-w-0 flex items-center gap-2">
                <h2 className="text-base md:text-lg font-semibold text-foreground truncate">
                  {otherUser.full_name || 'Użytkownik'}
                </h2>
                <PresenceIndicator userId={otherUser.id} showText={true} size="sm" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <ChatWindow
        messages={messages as Message[]}
        currentUserId={user.id}
        otherUser={otherUser}
      />
    </div>
  )
}
