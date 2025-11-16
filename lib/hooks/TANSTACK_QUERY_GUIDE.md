# TanStack Query v5 - Przewodnik

## Co się zmieniło w v5?

### 1. Query Options Factory Pattern

**STARY SPOSÓB:**
```tsx
export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data } = await supabase.from('posts').select()
      return data
    }
  })
}
```

**NOWY SPOSÓB (REKOMENDOWANY):**
```tsx
// lib/hooks/query-options/posts.ts
export const postsQueryOptions = () => {
  return queryOptions({
    queryKey: ['posts'] as const,
    queryFn: async () => {
      const { data } = await supabase.from('posts').select()
      return data
    }
  })
}

// lib/hooks/usePosts.ts
export function usePosts() {
  return useQuery(postsQueryOptions())
}
```

**Korzyści:**
- ✅ **Reusable** - możesz użyć tych samych options w `useQuery`, `useSuspenseQuery`, `queryClient.prefetchQuery()`
- ✅ **Type-safe** - TypeScript automatycznie infer'uje typy
- ✅ **Testowalne** - łatwiej testować query options niż hooki
- ✅ **DRY** - nie duplikujesz queryKey i queryFn

### 2. Optimistic Updates

**STARY SPOSÓB:**
```tsx
const mutation = useMutation({
  mutationFn: deletePost,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] })
  }
})
```

**NOWY SPOSÓB (Z OPTIMISTIC UPDATES):**
```tsx
const mutation = useMutation({
  mutationFn: deletePost,
  onMutate: async (postId) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ['posts'] })

    // Snapshot poprzedniego stanu
    const previous = queryClient.getQueryData(['posts'])

    // Optimistically update - zmień UI NATYCHMIAST
    queryClient.setQueryData(['posts'], (old) =>
      old.filter(p => p.id !== postId)
    )

    return { previous } // Context dla rollback
  },
  onError: (err, variables, context) => {
    // Rollback jeśli się nie powiedzie
    queryClient.setQueryData(['posts'], context.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] })
  }
})
```

**Korzyści:**
- ✅ **Instant feedback** - UI aktualizuje się natychmiast
- ✅ **Rollback** - automatyczny rollback przy błędzie
- ✅ **Lepsza UX** - aplikacja czuje się szybsza

### 3. Infinite Queries

**STARY SPOSÓB (z useEffect):**
```tsx
const [posts, setPosts] = useState([])
const [page, setPage] = useState(0)

useEffect(() => {
  fetchPosts(page).then(data => {
    setPosts(prev => [...prev, ...data])
  })
}, [page])

// Manual pagination logic...
```

**NOWY SPOSÓB (useInfiniteQuery):**
```tsx
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
  infiniteQueryOptions({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await supabase
        .from('posts')
        .select()
        .range(pageParam * 20, (pageParam + 1) * 20 - 1)

      return {
        posts: data,
        nextPage: data.length === 20 ? pageParam + 1 : undefined
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })
)

// Użycie:
<button onClick={() => fetchNextPage()}>Load More</button>
```

**Korzyści:**
- ✅ **No useEffect** - wszystko zarządzane przez TanStack Query
- ✅ **Automatic caching** - cache dla każdej strony
- ✅ **Background refetching** - automatyczne odświeżanie
- ✅ **Error handling** - wbudowana obsługa błędów

### 4. Nowe nazwy

| v4 | v5 |
|---|---|
| `cacheTime` | `gcTime` (garbage collection time) |
| `useQuery` + `enabled: false` | `useQuery` lub `useSuspenseQuery` |
| `QueryClient.setQueryDefaults` | Bardziej precyzyjne API |

### 5. Suspense i Error Boundaries

**NOWY w v5:**
```tsx
// Automatyczne suspense
export function PostsList() {
  const { data } = useSuspenseQuery(postsQueryOptions())
  // data jest zawsze zdefiniowana! No loading state needed

  return data.map(post => <PostCard key={post.id} post={post} />)
}

// W parent component:
<Suspense fallback={<LoadingSpinner />}>
  <PostsList />
</Suspense>
```

## Najlepsze praktyki w naszym projekcie

### 1. Struktura plików

```
lib/hooks/
├── query-options/          # Query options factory
│   ├── posts.ts           # postsQueryOptions, postQueryOptions
│   └── profiles.ts        # profileQueryOptions
├── usePosts.ts            # Hooki używające query options
└── useProfiles.ts         # Hooki używające query options
```

### 2. Zawsze używaj query options

```tsx
// ✅ DOBRZE
export const postsQueryOptions = (filters) => queryOptions({...})
export const usePosts = (filters) => useQuery(postsQueryOptions(filters))

// ❌ ŹLE
export const usePosts = () => useQuery({ queryKey: ['posts'], ... })
```

### 3. Używaj optimistic updates dla mutations

```tsx
// ✅ DOBRZE - instant UI updates
const mutation = useMutation({
  onMutate: async (variables) => {
    // Optimistically update
  },
  onError: (err, vars, context) => {
    // Rollback
  }
})

// ❌ ŹLE - czekanie na server response
const mutation = useMutation({
  onSuccess: () => {
    queryClient.invalidateQueries()
  }
})
```

### 4. Używaj infinite queries dla list

```tsx
// ✅ DOBRZE - infinite scroll
const { data, fetchNextPage } = useInfiniteQuery(postsInfiniteQueryOptions())

// ❌ ŹLE - manual pagination
const [page, setPage] = useState(0)
const { data } = useQuery(['posts', page])
```

## Przykłady użycia

### Fetching danych
```tsx
function PostsList() {
  const { data, isLoading, error } = usePosts({ city: 'Warszawa' })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return data.map(post => <PostCard key={post.id} post={post} />)
}
```

### Infinite scroll
```tsx
function InfinitePostsList() {
  const { data, fetchNextPage, hasNextPage } = usePostsInfinite()

  return (
    <>
      {data.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      ))}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>Load More</button>
      )}
    </>
  )
}
```

### Mutations z optimistic updates
```tsx
function DeletePostButton({ postId }) {
  const deletePost = useDeletePost()

  return (
    <button onClick={() => deletePost.mutate(postId)}>
      {deletePost.isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
  // Post zniknie z UI NATYCHMIAST, nawet przed response z serwera!
}
```

## Migracja starego kodu

1. **Znajdź wszystkie useEffect z fetchowaniem:**
   ```tsx
   // STARE
   useEffect(() => {
     fetchData().then(setData)
   }, [])
   ```

2. **Zastąp przez useQuery:**
   ```tsx
   // NOWE
   const { data } = useQuery(dataQueryOptions())
   ```

3. **Przenieś query logic do query-options:**
   - Stwórz plik w `lib/hooks/query-options/`
   - Użyj `queryOptions()` helper
   - Export jako factory function

## Resources

- [TanStack Query v5 Docs](https://tanstack.com/query/latest)
- [Query Options Guide](https://tanstack.com/query/latest/docs/framework/react/typescript#typing-query-options)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
