'use client'

import { motion } from 'framer-motion'
import { ReportMessageDialog } from './ReportMessageDialog'
import { reportMessage } from '@/lib/actions/report-message'

interface MessageBubbleProps {
  messageId: string
  content: string
  createdAt: string
  isOwn: boolean
  senderName?: string
  senderAvatar?: string | null
  read?: boolean
}

export function MessageBubble({
  messageId,
  content,
  createdAt,
  isOwn,
  senderName,
  senderAvatar,
  read = false
}: MessageBubbleProps) {
  const handleReport = async (msgId: string, reason: string, description: string) => {
    await reportMessage(msgId, reason, description)
  }
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div
      className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} mb-4`}
      initial={{
        opacity: 0,
        y: 20,
        x: isOwn ? 20 : -20
      }}
      animate={{
        opacity: 1,
        y: 0,
        x: 0
      }}
      transition={{
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1]
      }}
    >
      {/* Avatar */}
      {!isOwn && (
        <div className="flex-shrink-0">
          {senderAvatar ? (
            <img
              src={senderAvatar}
              alt={senderName || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center">
              <span className="text-sm font-semibold text-brand-foreground">
                {senderName?.charAt(0) || 'U'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isOwn
              ? 'bg-brand text-brand-foreground rounded-tr-sm'
              : 'bg-muted text-foreground border border-border rounded-tl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed break-words">{content}</p>
        </div>

        {/* Time and Status */}
        <div className="flex items-center gap-2 mt-1 px-2">
          <span className="text-xs text-muted-foreground">
            {formatTime(createdAt)}
          </span>
          {/* Report button - only for messages from others */}
          {!isOwn && (
            <ReportMessageDialog messageId={messageId} onReport={handleReport} />
          )}
          {isOwn && (
            <span className="text-xs flex items-center">
              {read ? (
                // Double checkmark - read
                <span className="flex items-center text-brand" title="Przeczytane">
                  <svg className="w-3.5 h-3.5 -mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              ) : (
                // Single checkmark - sent
                <span className="flex items-center text-muted-foreground" title="Wysłane">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
