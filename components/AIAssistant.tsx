'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { AIPostCard } from './AIPostCard'

interface Post {
  id: string
  title: string
  description: string
  price: string
  city: string
  url: string
  authorName: string
  authorAvatar?: string | null
  categoryName?: string
  image?: string | null
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
  posts?: Post[]
  suggestions?: string[]
}

interface ChatSettings {
  enabled: boolean
  welcomeMessage: string
  suggestions: string[]
}

// Helper function to load messages from localStorage
const loadMessagesFromStorage = (): Message[] => {
  if (typeof window === 'undefined') return []

  try {
    const saved = localStorage.getItem('ai-assistant-messages')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    // Silent fail
  }
  return []
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(loadMessagesFromStorage)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showGradient, setShowGradient] = useState(false)
  const [settings, setSettings] = useState<ChatSettings | null>(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isPinned, setIsPinned] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToBottom = (instant = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: instant ? 'instant' : 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Scroll to bottom instantly when panel opens
  useEffect(() => {
    if (isOpen) {
      scrollToBottom(true)
    }
  }, [isOpen])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      if (messages.length > 0) {
        localStorage.setItem('ai-assistant-messages', JSON.stringify(messages))
      } else {
        localStorage.removeItem('ai-assistant-messages')
      }
    } catch (error) {
      // Silent fail
    }
  }, [messages])

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/ai-chat/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Failed to fetch chat settings:', error)
      } finally {
        setIsLoadingSettings(false)
      }
    }
    fetchSettings()
  }, [])

  // Handle scroll to show/hide gradient
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current
      setShowGradient(scrollTop > 20)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      id: `user-${Date.now()}`
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content }))
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        id: `assistant-${Date.now()}`,
        posts: data.posts || undefined,
        suggestions: data.suggestions || undefined
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Przepraszam, wystąpił błąd. Spróbuj ponownie.',
        id: `error-${Date.now()}`
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
    setMessages([])
    localStorage.removeItem('ai-assistant-messages')
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)

    // Close other dropdowns when AI chat opens
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('ai-chat-opened'))
    }
  }

  // Block body scroll when chat is open on mobile ONLY
  useEffect(() => {
    // Check if mobile (screen width < 768px)
    const isMobile = window.innerWidth < 768

    if (isOpen && isMobile) {
      // Prevent body scroll but allow chat scroll on mobile only
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      // Restore body scroll
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isOpen])

  // Don't render if assistant is disabled
  if (settings && !settings.enabled) {
    return null
  }

  return (
    <div className="relative">
      {/* AI Button in Navbar */}
      <button
        onClick={handleToggle}
        className="relative inline-flex items-center justify-center h-[34px] w-[34px] md:h-10 md:w-10 rounded-full bg-brand hover:bg-brand/90 transition-colors text-brand-foreground"
        aria-label="Asystent AI"
        aria-expanded={isOpen}
      >
        <svg className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#bolt-clip)">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m10.25 21.25 1-7h-6.5l9-11.5-1 8 6.5.03z"/>
          </g>
          <defs>
            <clipPath id="bolt-clip">
              <path fill="#fff" d="M0 0h24v24H0z"/>
            </clipPath>
          </defs>
        </svg>
        {mounted && messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-background rounded-full border border-brand" />
        )}
      </button>

      {/* Chat Panel - Mobile: Fixed, Desktop: Absolute */}
        {isOpen && (
          <div
              className="fixed top-0 left-0 right-0 bottom-0 md:absolute md:top-full md:right-0 md:left-auto md:bottom-auto md:mt-2 md:w-[400px] md:h-[500px] bg-card md:rounded-3xl shadow-2xl z-[9999] md:z-50 flex flex-col md:border md:border-border"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center flex-shrink-0 text-brand-foreground">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#bolt-clip-header)">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m10.25 21.25 1-7h-6.5l9-11.5-1 8 6.5.03z"/>
                    </g>
                    <defs>
                      <clipPath id="bolt-clip-header">
                        <path fill="#fff" d="M0 0h24v24H0z"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Nawigatorek</h3>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    wersja alfa, może popełniać błędy
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Clear chat button - only show when there are messages */}
                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-brand"
                    title="Wyczyść historię"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                {/* Pin button - desktop only */}
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  className={`hidden md:flex w-8 h-8 rounded-full hover:bg-muted items-center justify-center transition-colors ${isPinned ? 'text-brand' : 'text-muted-foreground'}`}
                  title={isPinned ? "Odepnij okno" : "Przypnij okno"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
                {/* Close button */}
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setIsPinned(false)
                  }}
                  className="w-8 h-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                  title="Zamknij"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="relative flex-1 overflow-hidden">
              {/* Gradient mask at top - only show when scrolled */}
              <div
                className={`absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
                  showGradient ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Gradient mask at bottom - always visible */}
              <div
                className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none z-10"
              />

              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto p-4 space-y-4 scrollbar-hide"
                style={{ touchAction: 'auto', WebkitOverflowScrolling: 'touch' }}
              >
              <AnimatePresence mode="wait">
                {messages.length === 0 ? (
                  isLoadingSettings ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center justify-center py-12"
                    >
                      <div className="flex gap-1">
                        <motion.div
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.15
                          }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.3
                          }}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="welcome"
                      initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                      exit={{ opacity: 0, filter: 'blur(10px)' }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col text-center px-4"
                    >
                      <div className="mb-4 whitespace-pre-line">
                        {settings?.welcomeMessage?.split('\n').map((line, i) => (
                          <p key={i} className={i === 0 ? 'font-semibold bg-gradient-to-r from-foreground to-brand bg-clip-text text-transparent mb-2' : 'text-sm text-muted-foreground'}>
                            {line}
                          </p>
                        )) || (
                          <>
                            <h4 className="font-semibold bg-gradient-to-r from-foreground to-brand bg-clip-text text-transparent mb-2">Cześć! Jestem tu aby pomóc</h4>
                            <p className="text-sm text-muted-foreground">
                              Mogę pomóc Ci w nawigacji, odpowiedzieć na pytania o FindSomeone lub pomóc znaleźć odpowiednie ogłoszenia.
                            </p>
                          </>
                        )}
                      </div>
                      <div className="space-y-2 w-full bg-muted/50 rounded-2xl p-3 border border-border/50">
                        {(settings?.suggestions || ['Jak dodać ogłoszenie?', 'Jak znaleźć specjalistę?', 'Jak działają opinie?']).map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => setInput(suggestion)}
                            className="w-full text-left px-4 py-3 rounded-xl bg-card hover:bg-muted transition-all text-sm border border-border/50 text-foreground"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )
                ) : (
                <>
                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{
                          opacity: 0,
                          scale: 0.8,
                          filter: 'blur(10px)',
                          y: message.role === 'user' ? 20 : -20
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          filter: 'blur(0px)',
                          y: 0
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.8,
                          filter: 'blur(10px)'
                        }}
                        transition={{
                          duration: 0.4,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} w-full`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-brand text-brand-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {message.role === 'assistant' ? (
                            <div className="text-sm">
                              <ReactMarkdown
                                components={{
                                  a: ({ node, ...props }) => (
                                    <a
                                      {...props}
                                      className="text-brand font-medium no-underline hover:underline"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    />
                                  ),
                                  p: ({ node, ...props }) => (
                                    <p {...props} className="my-0" />
                                  ),
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>

                        {/* Show posts if available */}
                        {message.posts && message.posts.length > 0 && (
                          <div className="w-full mt-3">
                            <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
                              {message.posts.map((post, idx) => (
                                <div key={post.id} className="flex flex-shrink-0 w-[280px] snap-center">
                                  <AIPostCard
                                    {...post}
                                    index={idx}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Show suggestions if available and few/no posts */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="w-full mt-3">
                            <p className="text-xs text-muted-foreground mb-2">Może zainteresują Cię:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setInput(suggestion)}
                                  className="px-3 py-1.5 bg-card hover:bg-muted text-foreground rounded-full text-xs transition-all border border-border/50"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        scale: 0.8,
                        filter: 'blur(10px)',
                        y: -20
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        filter: 'blur(0px)',
                        y: 0
                      }}
                      transition={{
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <motion.div
                            className="w-2 h-2 bg-muted-foreground rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-muted-foreground rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.15
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-muted-foreground rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.3
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
              </AnimatePresence>
              </div>
            </div>

            {/* Input - Fixed at bottom on mobile */}
            <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4 bg-card border-t border-border md:rounded-b-3xl">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Napisz wiadomość..."
                  className="flex-1 px-4 py-3 rounded-full bg-muted/80 text-foreground placeholder:text-muted-foreground border border-border/50 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base md:text-sm transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-[46px] h-[46px] flex-shrink-0 rounded-full bg-brand hover:brightness-110 disabled:bg-muted disabled:hover:brightness-100 text-brand-foreground disabled:text-border disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg hover:shadow-xl disabled:shadow-none border border-border/50"
                  aria-label="Wyślij wiadomość"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
