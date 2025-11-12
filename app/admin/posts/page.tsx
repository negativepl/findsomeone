import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PostsManagementClient } from './PostsManagementClient'

export const metadata: Metadata = {
  title: 'Zarządzanie ogłoszeniami - Panel administracyjny',
  description: 'Przeglądaj, edytuj i zarządzaj wszystkimi ogłoszeniami',
}

export default function PostsManagementPage() {
  return (
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-xl border p-0 gap-0 flex-1 flex flex-col overflow-hidden bg-card">
        <CardHeader className="h-20 flex flex-row items-center justify-between space-y-0 px-8 border-b flex-shrink-0">
          <div>
            <CardTitle className="text-base font-bold">Zarządzanie ogłoszeniami</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Przeglądaj, edytuj i zarządzaj wszystkimi ogłoszeniami użytkowników</p>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-1 overflow-y-auto flex flex-col">
          <PostsManagementClient />
        </CardContent>
      </Card>
    </div>
  )
}
