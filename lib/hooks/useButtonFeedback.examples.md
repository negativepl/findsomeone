# useButtonFeedback - Przykłady użycia

Hook do **inline feedback** w buttonach - zamiast toast notifications w prawym górnym rogu.

## Podstawowe użycie

### 1. Copy button (już zaimplementowane)

```tsx
import { useButtonFeedback } from '@/lib/hooks'
import { Copy, Check } from 'lucide-react'

function CopyButton({ text }: { text: string }) {
  const { state, triggerSuccess, triggerError } = useButtonFeedback()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      triggerSuccess()
    } catch {
      triggerError()
    }
  }

  const Icon = state === 'success' ? Check : Copy
  const label = state === 'success' ? 'Skopiowano!' : 'Kopiuj'

  return (
    <button onClick={handleCopy} disabled={state !== 'idle'}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}
```

### 2. Save/Like button

```tsx
import { Heart } from 'lucide-react'

function LikeButton({ postId }: { postId: string }) {
  const { state, triggerSuccess, triggerError } = useButtonFeedback()

  const handleLike = async () => {
    try {
      await addToFavorites(postId)
      triggerSuccess()
    } catch {
      triggerError()
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={state !== 'idle'}
      className="transition-all duration-200"
      style={{
        transform: state === 'success' ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      <Heart
        className={state === 'success' ? 'fill-red-500' : ''}
      />
      {state === 'success' ? 'Dodano!' : 'Polub'}
    </button>
  )
}
```

### 3. Delete button

```tsx
import { Trash, Check, X } from 'lucide-react'

function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const { state, triggerSuccess, triggerError } = useButtonFeedback()

  const handleDelete = async () => {
    try {
      await onDelete()
      triggerSuccess()
    } catch {
      triggerError()
    }
  }

  const Icon = state === 'success' ? Check : state === 'error' ? X : Trash
  const text = state === 'success' ? 'Usunięto' : state === 'error' ? 'Błąd' : 'Usuń'

  return (
    <button
      onClick={handleDelete}
      disabled={state !== 'idle'}
      className="text-destructive"
    >
      <Icon className="w-4 h-4" />
      {text}
    </button>
  )
}
```

### 4. Submit form button

```tsx
import { Send, Check, X } from 'lucide-react'

function SubmitButton() {
  const { state, triggerSuccess, triggerError } = useButtonFeedback()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await submitForm()
      triggerSuccess()
    } catch {
      triggerError()
    }
  }

  return (
    <button
      onClick={handleSubmit}
      disabled={state !== 'idle'}
      className="w-full"
    >
      {state === 'success' ? (
        <>
          <Check className="w-4 h-4" />
          Wysłano!
        </>
      ) : state === 'error' ? (
        <>
          <X className="w-4 h-4" />
          Spróbuj ponownie
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          Wyślij
        </>
      )}
    </button>
  )
}
```

### 5. Download button

```tsx
import { Download, Check } from 'lucide-react'

function DownloadButton({ url, filename }: { url: string; filename: string }) {
  const { state, triggerSuccess } = useButtonFeedback()

  const handleDownload = async () => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    triggerSuccess()
  }

  return (
    <button onClick={handleDownload} disabled={state !== 'idle'}>
      {state === 'success' ? (
        <>
          <Check className="w-4 h-4" />
          Pobrano!
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Pobierz
        </>
      )}
    </button>
  )
}
```

## Zaawansowane użycie

### Custom duration

```tsx
const { state, triggerSuccess } = useButtonFeedback({
  duration: 3000 // 3 sekundy zamiast domyślnych 2s
})
```

### Reset manual

```tsx
const { state, triggerSuccess, reset } = useButtonFeedback()

// Reset przed końcem duration
<button onClick={reset}>Anuluj</button>
```

### Helpers

```tsx
const { isIdle, isSuccess, isError } = useButtonFeedback()

if (isSuccess) {
  // Redirect after success
  router.push('/success')
}
```

## Dobre praktyki

### ✅ DO:
- Używaj przy akcjach które user wykonuje świadomie (click)
- Pokazuj feedback tam gdzie user patrzy (w buttonie)
- Używaj subtelnych animacji (scale 1.1, nie więcej)
- Disable button podczas feedback (unikaj double-click)

### ❌ DON'T:
- Nie używaj dla background operations
- Nie łącz z toast notifications (redundant)
- Nie używaj jaskrawych kolorów
- Nie dodawaj loadera jeśli operacja jest szybka (<300ms)

## Animacje

### Subtle scale (rekomendowane)
```tsx
<Icon
  style={{
    transform: state === 'success' ? 'scale(1.1)' : 'scale(1)',
  }}
/>
```

### Color change
```tsx
<Icon
  className={state === 'success' ? 'text-green-500' : 'text-foreground'}
/>
```

### Fill animation (dla icons jak Heart)
```tsx
<Heart
  className={cn(
    'transition-all duration-200',
    state === 'success' && 'fill-red-500 text-red-500'
  )}
/>
```

## Integracja z istniejącymi komponentami

Szukaj w projekcie wzorców:
```bash
grep -r "toast.success\|toast.error" --include="*.tsx"
```

Zamień:
```tsx
// PRZED
onClick={() => {
  doSomething()
  toast.success('Gotowe!')
}}

// PO
const { state, triggerSuccess } = useButtonFeedback()

onClick={() => {
  doSomething()
  triggerSuccess()
}}
```

## Performance

- Hook używa `useCallback` - nie powoduje re-renders
- Stan lokalny - nie wpływa na global state
- Timeout automatycznie cleanup przy unmount
