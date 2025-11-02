import { CategoriesClient } from './CategoriesClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Zarządzanie kategoriami - Panel administracyjny",
}

export default function CategoriesAdminPage() {
  return <CategoriesClient />
}
