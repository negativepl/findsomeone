# System Wygasania i Przedłużania Postów - Przewodnik Wdrożeniowy

## ✅ Co zostało zaimplementowane:

### 1. Migracja Bazy Danych
📁 `supabase/migrations/20251016000000_add_post_expiration.sql`

**Dodane pola do tabeli `posts`:**
- `expires_at` - data wygaśnięcia (domyślnie: 30 dni od utworzenia)
- `extended_count` - licznik przedłużeń
- `last_extended_at` - data ostatniego przedłużenia
- `expiration_notified_at` - data ostatniego powiadomienia o wygaśnięciu

**Dodane funkcje PostgreSQL:**
- `expire_old_posts()` - automatycznie wygasza posty
- `extend_post_expiration(post_id)` - przedłuża post o 30 dni
- `get_posts_expiring_soon(days_before)` - zwraca posty wygasające wkrótce

**Aktualizacja `price_type`:**
- Dodano opcję `'free'` (za darmo)
- Pole jest teraz wymagane (`NOT NULL`)

###  2. API Endpoints
📁 `app/api/posts/[id]/extend/route.ts`

**Endpoint: `POST /api/posts/[id]/extend`**
- Weryfikuje właściciela postu
- Przedłuża wygaśnięcie o 30 dni
- Inkrementuje licznik przedłużeń
- Resetuje powiadomienia

### 3. Edge Functions (Supabase)
📁 `supabase/functions/expire-posts/index.ts`
📁 `supabase/functions/notify-expiring-posts/index.ts`

**expire-posts** - Automatyczne wygaszanie:
- Uruchamiany codziennie (cron)
- Zmienia status postów na 'closed' gdy `expires_at < NOW()`

**notify-expiring-posts** - Powiadomienia:
- Uruchamiany codziennie (cron)
- Wysyła powiadomienia 7, 3 i 1 dzień przed wygaśnięciem
- ⚠️ Wymaga skonfigurowania serwisu email (TODO)

### 4. Formularz Tworzenia Postów
📁 `app/dashboard/my-posts/new/NewPostClient.tsx`

**Zmiany:**
- ✅ Dodano opcję "Za darmo" w `price_type`
- ✅ Pole `price_type` jest teraz wymagane
- ✅ Przeorganizowano layout - typ ceny na początku
- ✅ Pola ceny (min/max) są wyłączone gdy wybrano "Za darmo"
- ✅ Zaktualizowano podsumowanie (krok 6) z obsługą "Za darmo"

### 5. Dashboard "Moje Ogłoszenia"
📁 `app/dashboard/my-posts/MyListingsClient.tsx`

**Dodano:**
- ✅ Wyświetlanie czasu do wygaśnięcia (np. "Wygasa za 5 dni")
- ✅ Kolor czerwony dla postów wygasających w ciągu 7 dni
- ✅ Przycisk "Przedłuż o 30 dni" (ikona RefreshCw)
- ✅ Funkcja `handleExtendPost()` do przedłużania
- ✅ Wsparcie dla `price_type: 'free'` w interfejsie
- ⚠️ **UWAGA**: Dodano tylko w wersji mobilnej list view

---

## 🔧 Co trzeba jeszcze zrobić:

### 1. **Uruchom migrację bazy danych**
```bash
# Podłącz się do Supabase i uruchom:
psql "$DATABASE_URL" -f supabase/migrations/20251016000000_add_post_expiration.sql
```

Lub przez Supabase Dashboard:
- SQL Editor → Wklej zawartość pliku migracji → Run

### 2. **Wdróż Edge Functions**
```bash
# Zaloguj się do Supabase CLI
supabase login

# Wdróż funkcje
supabase functions deploy expire-posts
supabase functions deploy notify-expiring-posts

# Ustaw zmienne środowiskowe
supabase secrets set CRON_SECRET=your_secret_token_here
```

### 3. **Skonfiguruj Cron Jobs**
W Supabase Dashboard → Database → Webhooks/Cron:

**Wygaszanie postów** (codziennie o 2:00 AM):
```
0 2 * * * curl -X POST https://your-project.supabase.co/functions/v1/expire-posts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Powiadomienia** (codziennie o 9:00 AM):
```
0 9 * * * curl -X POST https://your-project.supabase.co/functions/v1/notify-expiring-posts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 4. **Dodaj expiration UI do wersji desktopowej**

W pliku `/Users/marcinbaszewski/findsomeone/app/dashboard/my-posts/MyListingsClient.tsx`:

**Desktop List View** (około linii 676):
Dodaj przed elementem `<Clock>`:
```tsx
{post.status === 'active' && post.expires_at && (() => {
  const expiryInfo = getExpiryText(post.expires_at)
  return expiryInfo.text && (
    <div className={`flex items-center gap-1.5 ${expiryInfo.urgent ? 'text-[#C44E35] font-semibold' : ''}`}>
      <CalendarClock className="w-4 h-4" />
      <span>{expiryInfo.text}</span>
    </div>
  )
})()}
```

**Desktop Actions** (około linii 696):
Dodaj przed `{post.status === 'active' && (`:
```tsx
{post.status === 'active' && post.expires_at && getDaysUntilExpiry(post.expires_at) !== null && getDaysUntilExpiry(post.expires_at)! <= 7 && (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={(e) => handleExtendPost(post.id, e)}
          className="h-10 w-10 rounded-full border-2 border-[#C44E35] bg-[#C44E35]/10 hover:bg-[#C44E35]/20 flex items-center justify-center transition-all relative z-20"
          disabled={isPending}
        >
          <RefreshCw className="w-4 h-4 text-[#C44E35]" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-[#FAF8F3] text-black border-black/10 rounded-xl" sideOffset={5}>
        <p>Przedłuż o 30 dni</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)}
```

### 5. **Zaktualizuj API my-posts**
📁 `app/api/my-posts/route.ts` (jeśli istnieje)

Upewnij się, że zwraca nowe pola:
```ts
select(`
  *,
  expires_at,
  extended_count,
  profiles:user_id (...)
`)
```

### 6. **Zaktualizuj stronę `/dashboard/my-posts/[id]/page.tsx`**
Dodaj nowe pola do zapytania:
```ts
.select('*, expires_at, extended_count, last_extended_at, ...')
```

### 7. **Skonfiguruj serwis Email** (do powiadomień)
W `supabase/functions/notify-expiring-posts/index.ts` znajdziesz zakomentowany TODO:
```ts
// TODO: Send actual notification via email service (Resend, SendGrid, etc.)
```

Przykład integracji z Resend:
```ts
import { Resend } from 'resend'
const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

await resend.emails.send({
  from: 'noreply@twojadomena.pl',
  to: post.user_email,
  subject: `Twoje ogłoszenie wygasa za ${daysUntilExpiry} dni`,
  html: `...`
})
```

### 8. **Testowanie**

1. **Test tworzenia postu:**
   ```bash
   # Utwórz nowy post i sprawdź czy expires_at jest ustawione
   ```

2. **Test przedłużania:**
   ```bash
   curl -X POST http://localhost:3001/api/posts/POST_ID/extend \
     -H "Authorization: Bearer YOUR_AUTH_TOKEN"
   ```

3. **Test wygaszania:**
   ```bash
   # Ręcznie zmień expires_at na przeszłą datę
   UPDATE posts SET expires_at = NOW() - INTERVAL '1 day' WHERE id = '...';

   # Wywołaj funkcję wygaszania
   SELECT expire_old_posts();
   ```

4. **Test powiadomień:**
   ```bash
   # Ustaw expires_at na jutro
   UPDATE posts SET expires_at = NOW() + INTERVAL '1 day' WHERE id = '...';

   # Wywołaj funkcję powiadomień
   SELECT * FROM get_posts_expiring_soon(7);
   ```

---

## 📋 Checklist

- [ ] Uruchomiono migrację bazy danych
- [ ] Wdrożono Edge Functions do Supabase
- [ ] Skonfigurowano Cron Jobs
- [ ] Dodano expiration UI do wersji desktopowej
- [ ] Zaktualizowano API my-posts
- [ ] Zaktualizowano stronę szczegółów postu
- [ ] Skonfigurowano serwis email dla powiadomień
- [ ] Przetestowano tworzenie nowego postu
- [ ] Przetestowano przedłużanie postu
- [ ] Przetestowano automatyczne wygaszanie
- [ ] Przetestowano system powiadomień

---

## 🚀 Gotowe do użycia

Po wykonaniu powyższych kroków system będzie w pełni funkcjonalny:
- ✅ Posty automatycznie wygasają po 30 dniach
- ✅ Użytkownicy otrzymują powiadomienia 7, 3 i 1 dzień przed wygaśnięciem
- ✅ Łatwe przedłużanie jednym kliknięciem
- ✅ Wsparcie dla bezpłatnych ogłoszeń ("Za darmo")

Powodzenia! 🎉
