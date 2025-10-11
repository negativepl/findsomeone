import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { MobileDock } from '@/components/MobileDock'
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
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
      <NavbarWithHide user={user} alwaysVisible={true} />

      {/* Chat Header - Fixed */}
      <div className="fixed top-[72px] left-0 right-0 bg-white border-b border-black/10 z-30">
        <div className="container mx-auto px-4 md:px-6 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/messages"
              className="flex-shrink-0 hover:bg-black/5 rounded-full p-2 -ml-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>

            <div className="flex items-center gap-3 flex-1">
              {otherUser.avatar_url ? (
                <img
                  src={otherUser.avatar_url}
                  alt={otherUser.full_name || 'User'}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#C44E35] flex items-center justify-center">
                  <span className="text-lg font-semibold text-white">
                    {otherUser.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-black">
                  {otherUser.full_name || 'Użytkownik'}
                </h2>
                <PresenceIndicator userId={otherUser.id} showText={true} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[72px]" />

      {/* Chat Window */}
      <ChatWindow
        messages={messages as Message[]}
        currentUserId={user.id}
        otherUser={otherUser}
      />
    </div>
  )
}
