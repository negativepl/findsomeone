import { Metadata } from 'next'
import ContentBotPanel from '@/components/admin/ContentBotPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Wypełniaczek - Admin Panel',
  description: 'AI-powered content generation for posts',
}

export default function ContentBotPage() {
  return (
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-xl border bg-card p-0 gap-0 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="h-20 flex flex-row items-center justify-between space-y-0 px-8 border-b flex-shrink-0">
          <div>
            <CardTitle className="text-base font-bold">Wypełniaczek</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Automatyczne generowanie przykładowych ogłoszeń przy użyciu AI
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-1 overflow-y-auto flex flex-col">
          <ContentBotPanel />
        </CardContent>
      </Card>
    </div>
  )
}
