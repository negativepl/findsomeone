'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import Lottie from 'lottie-react'
import { LottieIcon } from './LottieIcon'
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

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showGradient, setShowGradient] = useState(false)
  const [settings, setSettings] = useState<ChatSettings | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const logoLottieRef = useRef<any>(null)
  const logoIntervalRef = useRef<NodeJS.Timeout>()
  const logoInitialDelayRef = useRef<NodeJS.Timeout>()
  const [logoAnimationData, setLogoAnimationData] = useState<any>(null)
  const [showLogoLottie, setShowLogoLottie] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
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

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsHovered(true)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    // TEMPORARY: Disabled auto-close for debugging
    // if (closeTimeoutRef.current) {
    //   clearTimeout(closeTimeoutRef.current)
    // }
    // closeTimeoutRef.current = setTimeout(() => {
    //   setIsOpen(false)
    // }, 200)
  }

  // Load logo animation when chat opens
  useEffect(() => {
    if (isOpen && !logoAnimationData) {
      fetch('/animations/sparkles-chat.json')
        .then(response => response.json())
        .then(data => {
          setLogoAnimationData(data)
          setTimeout(() => {
            setShowLogoLottie(true)
          }, 100)
        })
        .catch(error => console.error('Error loading logo animation:', error))
    }
  }, [isOpen, logoAnimationData])

  // Auto-play logo animation
  useEffect(() => {
    if (logoLottieRef.current && logoAnimationData && showLogoLottie) {
      const playAnimation = () => {
        if (logoLottieRef.current) {
          logoLottieRef.current.goToAndPlay(0, true)
        }
      }

      // Initial play with delay (wait 800ms before first animation)
      logoInitialDelayRef.current = setTimeout(playAnimation, 800)

      // Repeat every 5 seconds
      logoIntervalRef.current = setInterval(playAnimation, 5000)

      return () => {
        if (logoIntervalRef.current) {
          clearInterval(logoIntervalRef.current)
        }
        if (logoInitialDelayRef.current) {
          clearTimeout(logoInitialDelayRef.current)
        }
      }
    }
  }, [logoAnimationData, showLogoLottie])

  // Block body scroll when chat is open on mobile
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll but allow chat scroll
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  // Don't render if assistant is disabled
  if (settings && !settings.enabled) {
    return null
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* AI Button in Navbar */}
      <button
        className="relative inline-flex items-center justify-center h-[34px] w-[34px] md:h-10 md:w-10 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] transition-colors"
        aria-label="Asystent AI"
        aria-expanded={isOpen}
      >
        <LottieIcon
          animationPath="/animations/ai-assistant.json"
          fallbackSvg={
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 25 24">
              <g clipPath="url(#so68geZKzSa)">
                <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.25 4.75h6.5c3.31 0 6 2.69 6 6v2.5c0 3.31-2.69 6-6 6H3.25v-8.5c0-3.31 2.69-6 6-6"/>
                <circle cx="8.5" cy="12" r="1" fill="#fff"/>
                <path fill="#fff" d="M13.5 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                <circle cx="16.5" cy="12" r="1" fill="#fff"/>
              </g>
              <defs>
                <clipPath id="so68geZKzSa">
                  <path fill="#fff" d="M.5 0h24v24H.5z"/>
                </clipPath>
              </defs>
            </svg>
          }
          className="h-4 w-4 md:h-5 md:w-5"
          isHovered={isHovered}
        />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border-2 border-[#C44E35]" />
        )}
      </button>

      {/* Chat Panel - Mobile: Fixed, Desktop: Absolute */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 bottom-0 md:absolute md:top-full md:right-0 md:left-auto md:bottom-auto md:mt-2 md:w-[400px] md:h-[500px] bg-white md:rounded-3xl shadow-2xl z-[9999] md:z-50 flex flex-col md:border md:border-black/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 relative">
                  {/* SVG - always visible until Lottie is ready */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                      showLogoLottie ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    <img src="/icons/sparkles-chat.svg" alt="AI Chat" className="w-5 h-5" />
                  </div>

                  {/* Lottie - fades in when ready */}
                  {logoAnimationData && (
                    <div
                      className={`w-5 h-5 transition-opacity duration-300 ${
                        showLogoLottie ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Lottie
                        lottieRef={logoLottieRef}
                        animationData={logoAnimationData}
                        loop={false}
                        autoplay={false}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-black">Asystent FindSomeone</h3>
                  <p className="text-xs text-black/60">Zadaj mi pytanie</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="relative flex-1 overflow-hidden">
              {/* Gradient mask at top - only show when scrolled */}
              <div
                className={`absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
                  showGradient ? 'opacity-100' : 'opacity-0'
                }`}
              />

              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto p-4 space-y-4"
                style={{ touchAction: 'auto', WebkitOverflowScrolling: 'touch' }}
              >
              {messages.length === 0 ? (
                <div className="flex flex-col text-center px-4">
                  <div className="mb-4 whitespace-pre-line">
                    {settings?.welcomeMessage?.split('\n').map((line, i) => (
                      <p key={i} className={i === 0 ? 'font-semibold bg-gradient-to-r from-[#1A1A1A] to-[#C44E35] bg-clip-text text-transparent mb-2' : 'text-sm text-black/60'}>
                        {line}
                      </p>
                    )) || (
                      <>
                        <h4 className="font-semibold bg-gradient-to-r from-[#1A1A1A] to-[#C44E35] bg-clip-text text-transparent mb-2">Cześć! Jestem tu aby pomóc</h4>
                        <p className="text-sm text-black/60">
                          Mogę pomóc Ci w nawigacji, odpowiedzieć na pytania o FindSomeone lub pomóc znaleźć odpowiednie ogłoszenia.
                        </p>
                      </>
                    )}
                  </div>
                  <div className="space-y-2 w-full">
                    {(settings?.suggestions || ['Jak dodać ogłoszenie?', 'Jak znaleźć specjalistę?', 'Jak działają opinie?']).map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(suggestion)}
                        className="w-full text-left px-4 py-3 rounded-2xl bg-black/5 hover:bg-[#C44E35]/10 hover:text-[#C44E35] transition-all text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
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
                              ? 'bg-[#C44E35] text-white'
                              : 'bg-black/5 text-black'
                          }`}
                        >
                          {message.role === 'assistant' ? (
                            <div className="text-sm">
                              <ReactMarkdown
                                components={{
                                  a: ({ node, ...props }) => (
                                    <a
                                      {...props}
                                      className="text-[#C44E35] font-medium no-underline hover:underline"
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
                          <div className="w-full mt-3 grid grid-cols-1 gap-3">
                            {message.posts.map((post, idx) => (
                              <AIPostCard
                                key={post.id}
                                {...post}
                                index={idx}
                              />
                            ))}
                          </div>
                        )}

                        {/* Show suggestions if available and few/no posts */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="w-full mt-3">
                            <p className="text-xs text-black/60 mb-2">Może zainteresują Cię:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setInput(suggestion)}
                                  className="px-3 py-1.5 bg-black/5 hover:bg-[#C44E35]/10 hover:text-[#C44E35] text-black rounded-full text-xs transition-all"
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
                      <div className="bg-black/5 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <motion.div
                            className="w-2 h-2 bg-black/40 rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-black/40 rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.15
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-black/40 rounded-full"
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
              </div>
            </div>

            {/* Input - Fixed at bottom on mobile */}
            <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4 bg-white border-t border-black/5">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Napisz wiadomość..."
                  className="flex-1 px-4 py-3 rounded-full bg-black/5 border-0 focus:outline-none focus:ring-2 focus:ring-[#C44E35] text-base md:text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 flex-shrink-0 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] disabled:bg-black/10 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
