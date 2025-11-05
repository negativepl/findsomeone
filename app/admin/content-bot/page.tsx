import { Metadata } from 'next'
import ContentBotPanel from '@/components/admin/ContentBotPanel'

export const metadata: Metadata = {
  title: 'Wypełniaczek - Admin Panel',
  description: 'AI-powered content generation for posts',
}

export default function ContentBotPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Wypełniaczek</h1>
        <p className="text-muted-foreground">
          Automatyczne generowanie przykładowych ogłoszeń przy użyciu AI
        </p>
      </div>

      <ContentBotPanel />
    </>
  )
}
