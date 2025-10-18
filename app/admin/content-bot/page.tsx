import { Metadata } from 'next'
import ContentBotPanel from '@/components/admin/ContentBotPanel'

export const metadata: Metadata = {
  title: 'Content Bot - Admin Panel',
  description: 'AI-powered content generation for posts',
}

export default function ContentBotPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Content Bot</h1>
        <p className="text-black/60">
          Automatyczne generowanie przykładowych ogłoszeń przy użyciu AI
        </p>
      </div>

      <ContentBotPanel />
    </div>
  )
}
