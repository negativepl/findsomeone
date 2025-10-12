import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { MobileDock } from '@/components/MobileDock'
import { PresenceIndicator } from '@/components/PresenceIndicator'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Wiadomości",
}

interface Conversation {
  id: string
  other_user: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  last_message: {
    content: string
    created_at: string
    sender_id: string
    read: boolean
  }
  unread_count: number
  post?: {
    id: string
    title: string
  }
}

export default async function MessagesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get all conversations (grouped by sender/receiver)
  // This is a simplified version - ideally you'd use a proper conversation grouping
  const { data: sentMessages } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      read,
      sender_id,
      receiver_id,
      post_id,
      receiver:receiver_id (
        id,
        full_name,
        avatar_url
      ),
      posts (
        id,
        title
      )
    `)
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false })

  const { data: receivedMessages } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      read,
      sender_id,
      receiver_id,
      post_id,
      sender:sender_id (
        id,
        full_name,
        avatar_url
      ),
      posts (
        id,
        title
      )
    `)
    .eq('receiver_id', user.id)
    .order('created_at', { ascending: false })

  // Combine and group conversations
  const conversationsMap = new Map<string, any>()

  // Process sent messages
  sentMessages?.forEach((msg: any) => {
    const otherUserId = msg.receiver_id
    if (!conversationsMap.has(otherUserId)) {
      conversationsMap.set(otherUserId, {
        id: otherUserId,
        other_user: msg.receiver,
        last_message: {
          content: msg.content,
          created_at: msg.created_at,
          sender_id: msg.sender_id,
          read: msg.read
        },
        unread_count: 0,
        post: msg.posts
      })
    }
  })

  // Process received messages
  receivedMessages?.forEach((msg: any) => {
    const otherUserId = msg.sender_id
    const existing = conversationsMap.get(otherUserId)

    if (!existing || new Date(msg.created_at) > new Date(existing.last_message.created_at)) {
      conversationsMap.set(otherUserId, {
        id: otherUserId,
        other_user: msg.sender,
        last_message: {
          content: msg.content,
          created_at: msg.created_at,
          sender_id: msg.sender_id,
          read: msg.read
        },
        unread_count: !msg.read ? (existing?.unread_count || 0) + 1 : (existing?.unread_count || 0),
        post: msg.posts
      })
    } else if (!msg.read) {
      existing.unread_count++
    }
  })

  const conversations = Array.from(conversationsMap.values())
    .sort((a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime())

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0)

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-20 md:pb-0">
      <NavbarWithHide user={user} />

      <main className="container mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-3">Wiadomości</h1>
          <p className="text-lg text-black/60">
            Twoje rozmowy z innymi użytkownikami
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Conversations List */}
          <div className="md:col-span-1">
            {conversations && conversations.length > 0 ? (
            <Card className="border-0 rounded-3xl bg-white overflow-hidden">
              <div className="divide-y divide-black/5">
                {conversations.map((conversation: Conversation) => {
                  const isUnread = conversation.last_message.sender_id !== user.id && !conversation.last_message.read

                  return (
                    <Link
                      key={conversation.id}
                      href={`/dashboard/messages/${conversation.id}`}
                      className={`block p-6 hover:bg-[#F5F1E8] transition-all ${
                        isUnread ? 'bg-[#FFF9F5]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0 relative">
                          {conversation.other_user.avatar_url ? (
                            <img
                              src={conversation.other_user.avatar_url}
                              alt=""
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-[#C44E35] flex items-center justify-center">
                              <span className="text-xl font-semibold text-white">
                                {conversation.other_user.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                          {/* Presence indicator badge */}
                          <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5">
                            <PresenceIndicator userId={conversation.other_user.id} size="md" />
                          </div>
                        </div>

                        {/* Message Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-1">
                            <h3 className={`text-lg font-semibold text-black ${isUnread ? 'font-bold' : ''}`}>
                              {conversation.other_user.full_name || 'Użytkownik'}
                            </h3>
                            <span className="text-sm text-black/60 flex-shrink-0">
                              {new Date(conversation.last_message.created_at).toLocaleDateString('pl-PL', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {conversation.post && (
                            <div className="text-sm text-[#C44E35] mb-1 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {conversation.post.title}
                            </div>
                          )}

                          <p className={`text-black/70 line-clamp-2 ${isUnread ? 'font-semibold' : ''}`}>
                            {conversation.last_message.sender_id === user.id && (
                              <span className="text-black/50">Ty: </span>
                            )}
                            {conversation.last_message.content}
                          </p>

                          {conversation.unread_count > 0 && (
                            <div className="inline-flex items-center gap-2 mt-2">
                              <div className="bg-[#C44E35] text-white text-xs px-3 py-1 rounded-full font-semibold">
                                {conversation.unread_count} {conversation.unread_count === 1 ? 'nowa' : 'nowych'}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0 text-black/40">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </Card>
            ) : (
            <Card className="border-0 rounded-3xl bg-white">
              <div className="p-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-black/5 flex items-center justify-center">
                  <svg className="w-10 h-10 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-black mb-2">
                  Brak wiadomości
                </p>
                <p className="text-black/60 mb-6">
                  Nie masz jeszcze żadnych rozmów. Skontaktuj się z kimś przez ogłoszenie!
                </p>
                <Link href="/dashboard">
                  <button className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 px-8 py-3 font-semibold transition-colors">
                    Przeglądaj ogłoszenia
                  </button>
                </Link>
              </div>
            </Card>
            )}
          </div>

          {/* Right Column - Placeholder */}
          <div className="md:col-span-2">
            <Card className="border-0 rounded-3xl bg-white">
              <div className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-black/5 flex items-center justify-center">
                  <svg className="w-12 h-12 text-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-2">
                  Wybierz wiadomość
                </h3>
                <p className="text-black/60">
                  Kliknij na konwersację po lewej, aby ją przeczytać
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <MobileDock />
    </div>
  )
}
