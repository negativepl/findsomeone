import { CategoriesClient } from './CategoriesClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Zarządzanie kategoriami - Panel administracyjny",
}

export default function CategoriesAdminPage() {
  return (
    <div className="w-full h-full p-2 flex flex-col">
      <Card className="rounded-3xl border p-0 gap-0 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-8 py-4 border-b">
          <div>
            <CardTitle className="text-base font-bold">Zarządzanie kategoriami</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Dodawaj, edytuj i usuwaj kategorie ogłoszeń</p>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex-1 overflow-y-auto flex flex-col">
          <CategoriesClient />
        </CardContent>
      </Card>
    </div>
  )
}
