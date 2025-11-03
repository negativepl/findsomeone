import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
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
    <div className="min-h-screen bg-background flex flex-col">
      <NavbarWithHide user={user} pageTitle="Wiadomości" />

      <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8 flex-1">
        {/* Header */}
        <div className="mb-8 hidden md:block">
          <h1 className="text-4xl font-bold text-foreground mb-3">Wiadomości</h1>
          <p className="text-lg text-muted-foreground">
            Twoje rozmowy z innymi użytkownikami
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Conversations List */}
          <div className="md:col-span-1 lg:col-span-1">
            {conversations && conversations.length > 0 ? (
            <Card className="border border-border rounded-3xl bg-card overflow-hidden">
              <div className="divide-y divide-border">
                {conversations.map((conversation: Conversation) => {
                  const isUnread = conversation.last_message.sender_id !== user.id && !conversation.last_message.read

                  return (
                    <Link
                      key={conversation.id}
                      href={`/dashboard/messages/${conversation.id}`}
                      className={`block p-4 md:p-5 lg:p-6 hover:bg-muted transition-all ${
                        isUnread ? 'bg-muted/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {conversation.other_user.avatar_url ? (
                            <img
                              src={conversation.other_user.avatar_url}
                              alt=""
                              className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#C44E35] flex items-center justify-center">
                              <span className="text-lg md:text-xl font-semibold text-white">
                                {conversation.other_user.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Message Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className={`text-base md:text-lg font-semibold text-foreground truncate ${isUnread ? 'font-bold' : ''}`}>
                              {conversation.other_user.full_name || 'Użytkownik'}
                            </p>
                            <span className="text-xs md:text-sm text-muted-foreground flex-shrink-0 whitespace-nowrap">
                              {new Date(conversation.last_message.created_at).toLocaleDateString('pl-PL', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {conversation.post && (
                            <div className="text-xs md:text-sm text-[#C44E35] mb-1 flex items-center gap-1 truncate">
                              <svg className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span className="truncate">{conversation.post.title}</span>
                            </div>
                          )}

                          <p className={`text-sm md:text-base text-muted-foreground line-clamp-2 ${isUnread ? 'font-semibold' : ''}`}>
                            {conversation.last_message.sender_id === user.id && (
                              <span className="text-muted-foreground">Ty: </span>
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
                        <div className="hidden lg:block flex-shrink-0 text-muted-foreground">
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
            <Card className="border border-border rounded-3xl bg-card">
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-black/5 flex items-center justify-center">
                  <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-foreground mb-2">
                  Brak wiadomości
                </p>
                <p className="text-muted-foreground mb-6">
                  Nie masz jeszcze żadnych rozmów. Skontaktuj się z kimś przez ogłoszenie!
                </p>
                <Link href="/posts" className="block">
                  <button className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border border-border px-8 py-3 font-semibold transition-colors">
                    Przeglądaj ogłoszenia
                  </button>
                </Link>
              </div>
            </Card>
            )}
          </div>

          {/* Right Column - Placeholder */}
          <div className="md:col-span-1 lg:col-span-2">
            <Card className="border border-border rounded-3xl bg-card">
              <div className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-black/5 flex items-center justify-center">
                  <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Wybierz wiadomość
                </h2>
                <p className="text-muted-foreground">
                  <span className="md:hidden">Kliknij na konwersację na górze, aby ją przeczytać</span>
                  <span className="hidden md:inline">Kliknij na konwersację po lewej, aby ją przeczytać</span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
