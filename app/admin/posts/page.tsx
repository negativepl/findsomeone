import { Metadata } from 'next'
import { PostsManagementClient } from './PostsManagementClient'

export const metadata: Metadata = {
  title: 'Zarządzanie ogłoszeniami - Panel administracyjny',
  description: 'Przeglądaj, edytuj i zarządzaj wszystkimi ogłoszeniami',
}

export default function PostsManagementPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Zarządzanie ogłoszeniami</h1>
        <p className="text-black/60">
          Przeglądaj, edytuj i zarządzaj wszystkimi ogłoszeniami użytkowników
        </p>
      </div>

      <PostsManagementClient />
    </>
  )
}
