# React Query Hooks - Dokumentacja

Ten folder zawiera hooki React Query do zarządzania danymi w aplikacji FindSomeone.

## 🎯 Zalety React Query

- **Automatyczne cache'owanie** - dane są cache'owane i ponownie używane
- **Optymistyczne aktualizacje** - UI aktualizuje się natychmiast przed potwierdzeniem z serwera
- **Automatyczne odświeżanie** - dane są automatycznie odświeżane w tle
- **Loading states** - wbudowane stany ładowania i błędów
- **Deduplikacja** - zapobiega duplikowaniu zapytań
- **Real-time feel** - automatyczne refetch dla wiadomości

## 📁 Dostępne hooki

### usePosts.ts
Hooki do zarządzania ogłoszeniami:
- `usePosts(filters)` - pobieranie listy ogłoszeń z filtrami
- `usePost(postId)` - pobieranie pojedynczego ogłoszenia
- `useDeletePost()` - usuwanie ogłoszenia
- `useUpdatePostStatus()` - zmiana statusu ogłoszenia

### useFavorites.ts
Hooki do zarządzania ulubionymi:
- `useFavoriteIds(userId)` - pobieranie ID ulubionych postów
- `useFavorites(userId)` - pobieranie pełnych danych ulubionych
- `useIsFavorite(userId, postId)` - sprawdzanie czy post jest ulubiony
- `useAddFavorite()` - dodawanie do ulubionych (z optymistyczną aktualizacją)
- `useRemoveFavorite()` - usuwanie z ulubionych (z optymistyczną aktualizacją)
- `useToggleFavorite()` - przełączanie statusu ulubionego

### useMessages.ts
Hooki do zarządzania wiadomościami:
- `useConversations(userId)` - pobieranie wszystkich konwersacji (auto-refetch co minutę)
- `useConversation(conversationId)` - pobieranie konwersacji z wiadomościami (auto-refetch co 5s)
- `useUnreadCount(userId)` - liczba nieprzeczytanych wiadomości
- `useSendMessage()` - wysyłanie wiadomości
- `useMarkAsRead()` - oznaczanie jako przeczytane
- `useCreateConversation()` - tworzenie nowej konwersacji

### useProfiles.ts
Hooki do zarządzania profilami:
- `useProfile(userId)` - pobieranie profilu użytkownika
- `useCurrentUserProfile()` - pobieranie profilu aktualnie zalogowanego
- `useUpdateProfile()` - aktualizacja profilu
- `useUploadAvatar()` - upload avatara
- `useUserPostsCount(userId)` - liczba postów użytkownika
- `useUserStats(userId)` - statystyki użytkownika

## 🔥 Przykłady użycia

### 1. Wyświetlanie listy ogłoszeń w Client Component

```tsx
'use client'

import { usePosts } from '@/lib/hooks/usePosts'

export function PostsList() {
  const { data: posts, isLoading, error } = usePosts({
    type: 'offering',
    city: 'Warszawa'
  })

  if (isLoading) return <div>Ładowanie...</div>
  if (error) return <div>Błąd: {error.message}</div>

  return (
    <div>
      {posts?.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
```

### 2. Ulubione z optymistyczną aktualizacją

```tsx
'use client'

import { useToggleFavorite, useFavoriteIds } from '@/lib/hooks/useFavorites'

export function FavoriteButton({ postId, userId }: { postId: string, userId: string }) {
  const { data: favoriteIds = [] } = useFavoriteIds(userId)
  const { toggleFavorite, isLoading } = useToggleFavorite()

  const isFavorite = favoriteIds.includes(postId)

  const handleClick = () => {
    // UI aktualizuje się natychmiast!
    toggleFavorite(userId, postId, isFavorite)
  }

  return (
    <button onClick={handleClick} disabled={isLoading}>
      {isFavorite ? '❤️' : '🤍'}
    </button>
  )
}
```

### 3. Wiadomości z auto-refresh

```tsx
'use client'

import { useConversation, useSendMessage } from '@/lib/hooks/useMessages'

export function ChatWindow({ conversationId, userId }: { conversationId: string, userId: string }) {
  const { data: conversation, isLoading } = useConversation(conversationId)
  const sendMessage = useSendMessage()

  // Automatycznie odświeża co 5 sekund - wiadomości pojawiają się w czasie rzeczywistym!

  const handleSend = (content: string) => {
    sendMessage.mutate({
      conversationId,
      senderId: userId,
      content
    })
  }

  if (isLoading) return <div>Ładowanie...</div>

  return (
    <div>
      {conversation?.messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  )
}
```

### 4. Profil użytkownika z cache'owaniem

```tsx
'use client'

import { useProfile, useUpdateProfile } from '@/lib/hooks/useProfiles'

export function UserProfile({ userId }: { userId: string }) {
  const { data: profile, isLoading } = useProfile(userId)
  const updateProfile = useUpdateProfile()

  // Dane są cache'owane przez 5 minut - kolejne wywołania są natychmiastowe!

  const handleUpdate = (updates: any) => {
    updateProfile.mutate({
      userId,
      updates
    })
  }

  if (isLoading) return <div>Ładowanie...</div>

  return (
    <div>
      <h1>{profile?.full_name}</h1>
      <p>{profile?.bio}</p>
    </div>
  )
}
```

### 5. Hybrid approach - Server Component + Client Component

Server Component dla initial load (dobry SEO):
```tsx
// app/posts/page.tsx
import { createClient } from '@/lib/supabase/server'
import { PostsClient } from './PostsClient'

export default async function PostsPage() {
  const supabase = await createClient()

  // Initial data fetch na serwerze
  const { data: initialPosts } = await supabase
    .from('posts')
    .select('*')
    .limit(20)

  // Przekaż initial data do Client Component
  return <PostsClient initialData={initialPosts} />
}
```

Client Component z React Query:
```tsx
'use client'

// app/posts/PostsClient.tsx
import { usePosts } from '@/lib/hooks/usePosts'

export function PostsClient({ initialData }: { initialData: any[] }) {
  const { data: posts } = usePosts({}, {
    initialData, // React Query użyje tych danych początkowo
  })

  // Teraz masz cache'owanie, automatyczne odświeżanie, itp!
  return <div>...</div>
}
```

## 🎨 Best Practices

1. **Używaj hooków w Client Components** - oznacz komponent jako `'use client'`
2. **Używaj query keys konsekwentnie** - to kluczowe dla cache'owania
3. **Wykorzystuj optymistyczne aktualizacje** - dla lepszego UX (favorites, likes, etc.)
4. **Invaliduj cache gdy potrzeba** - po mutacjach które zmieniają dane
5. **Używaj enabled option** - aby zapobiec niepotrzebnym zapytaniom
6. **Dostosuj staleTime i gcTime** - według potrzeb (częściej aktualizowane dane = krótszy staleTime)

## 🔄 Cache Invalidation

Przykład jak invalidować cache po akcji:
```tsx
const queryClient = useQueryClient()

// Po dodaniu posta
queryClient.invalidateQueries({ queryKey: ['posts'] })

// Po usunięciu posta
queryClient.invalidateQueries({ queryKey: ['posts'] })
queryClient.invalidateQueries({ queryKey: ['post', postId] })
```

## 📊 Monitoring

React Query Devtools są włączone w development mode. Otwórz aplikację i zobaczysz ikonkę w prawym dolnym rogu do debugowania queries.

## 🚀 Następne kroki

1. Stopniowo migruj komponenty do używania tych hooków
2. Zacznij od najpopularniejszych stron (dashboard, lista postów)
3. Testuj czy cache'owanie działa poprawnie
4. Monitoruj performance w devtools

## ❓ Pytania?

- [React Query docs](https://tanstack.com/query/latest)
- [Supabase + React Query guide](https://supabase.com/docs/guides/database/react-query)
