# Content Bot - Automatyczne Generowanie Ogłoszeń

## Przegląd

Content Bot to system automatycznego generowania przykładowych ogłoszeń przy użyciu AI (GPT-5 Nano). System wypełnia kategorię treścią, która:
- Jest naturalna i autentyczna (brzmi jak napisana przez prawdziwych użytkowników)
- Zawiera zdjęcia z Unsplash dopasowane do kategorii
- Jest oznaczona jako "Wygenerowana przez AI"
- Ma realistyczne ceny i lokalizacje

## Funkcje

✅ **Automatyczne generowanie postów**
- Tytuły i opisy generowane przez GPT-5 Nano
- Losowe miasta z całej Polski
- Realistyczne ceny dla danej kategorii
- Mix postów "Szukam" i "Oferuję" (konfigurowalny ratio)

✅ **Integracja ze zdjęciami**
- Automatyczne pobieranie zdjęć z Unsplash API
- Dopasowanie zdjęć do kategorii (np. dla "Hydraulika" → zdjęcia narzędzi hydraulicznych)
- Fallback bez zdjęć jeśli API niedostępne

✅ **Panel administracyjny**
- Live progress bar podczas generowania
- Statystyki wygenerowanych postów
- Możliwość usunięcia wszystkich postów AI jednym kliknięciem

✅ **Wizualne oznaczenie AI**
- Fioletowo-różowy badge "AI" z ikoną Sparkles
- Widoczny na listach postów i stronie szczegółów
- Responsywne rozmiary (sm/md/lg)

## Instalacja

### 1. Uruchom migracje

```bash
# Dodaj flagę is_ai_generated i utwórz konto bota
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20250119000001_add_ai_generated_posts.sql

# Dodaj ustawienia bota do ai_settings
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20250119000002_add_content_bot_settings.sql
```

Lub przez Supabase Dashboard:
1. Otwórz SQL Editor
2. Wklej zawartość każdej migracji
3. Uruchom

### 2. Konfiguracja zmiennych środowiskowych

Dodaj do `.env.local`:

```bash
# Wymagane
OPENAI_API_KEY=sk-xxx  # Twój klucz API OpenAI

# Opcjonalne (bez tego posty będą bez zdjęć)
UNSPLASH_ACCESS_KEY=xxx  # Twój klucz Unsplash API
```

#### Jak uzyskać klucz Unsplash:
1. Idź na https://unsplash.com/developers
2. Zarejestruj się / zaloguj
3. Utwórz nową aplikację ("New Application")
4. Skopiuj "Access Key"
5. **Ważne**: Free tier = 50 zapytań/godzinę

### 3. Restart serwera

```bash
npm run dev
```

## Użycie

### Panel Administracyjny

Przejdź do: **`https://twoja-domena.app/admin/content-bot`**

#### Generowanie postów:

1. Kliknij **"Wygeneruj ogłoszenia dla wszystkich kategorii"**
2. Potwierdź dialog (operacja może zająć 5-10 minut dla ~500 postów)
3. Obserwuj progress bar:
   - Pokazuje aktualny postęp (np. "35 / 170")
   - Wyświetla nazwę kategorii w trakcie przetwarzania
   - Informuje o typie posta (Szukam/Oferuję)

#### Usuwanie postów AI:

1. Kliknij **"Usuń wszystkie ogłoszenia AI (X)"**
2. Potwierdź dialog
3. Wszystkie posty z `is_ai_generated = true` zostaną usunięte

### Konfiguracja (w AI Settings)

Ustawienia bota znajdują się w tabeli `ai_settings`:

```sql
SELECT
  content_bot_system_message,     -- System message dla GPT
  content_bot_prompt,              -- Template promptu
  content_bot_model,               -- Model (domyślnie: gpt-5-nano)
  content_bot_posts_per_category,  -- Ile postów na kategorię (domyślnie: 3)
  content_bot_offering_ratio       -- Ratio "Oferuję" (0.5 = 50%)
FROM ai_settings;
```

#### Zmiana ratio Szukam/Oferuję:

```sql
UPDATE ai_settings
SET content_bot_offering_ratio = 0.7  -- 70% oferuję, 30% szukam
WHERE id = '00000000-0000-0000-0000-000000000001';
```

#### Zmiana liczby postów na kategorię:

```sql
UPDATE ai_settings
SET content_bot_posts_per_category = 5  -- 5 postów zamiast 3
WHERE id = '00000000-0000-0000-0000-000000000001';
```

## Struktura techniczna

### Pliki backend:

- **`lib/unsplash.ts`** - Helper do pobierania zdjęć z Unsplash
- **`app/api/admin/content-bot/generate-post/route.ts`** - Endpoint do generowania pojedynczego posta
- **`app/api/admin/content-bot/generate-bulk/route.ts`** - Endpoint streamingu dla bulk generation
- **`app/api/admin/content-bot/delete-all/route.ts`** - Endpoint do usuwania/liczenia postów AI

### Pliki frontend:

- **`components/admin/ContentBotPanel.tsx`** - Panel administracyjny
- **`components/AIGeneratedBadge.tsx`** - Komponent badge AI
- **`app/admin/content-bot/page.tsx`** - Strona panelu

### Migracje:

- **`20250119000001_add_ai_generated_posts.sql`** - Dodaje `is_ai_generated`, tworzy konto bota
- **`20250119000002_add_content_bot_settings.sql`** - Dodaje ustawienia bota do `ai_settings`

## Szczegóły techniczne

### Konto bota

- **User ID**: `00000000-0000-0000-0000-000000000002`
- **Email**: `contentbot@findsomeone.app`
- **Full Name**: "FindSomeone Bot"
- **Verified**: `true`
- Wszystkie posty AI należą do tego konta

### Generowanie postów

1. Bot pobiera wszystkie kategorie z bazy
2. Dla każdej kategorii:
   - Losuje miasto z listy 27 polskich miast
   - Generuje typ posta (seeking/offering) według ratio
   - Wywołuje GPT-5 Nano z promptem
   - Parsuje JSON response (title, description, price_min, price_max, price_type)
   - Pobiera zdjęcie z Unsplash (jeśli dostępne)
   - Tworzy post z flagą `is_ai_generated = true`
3. Opóźnienie 500ms między postami (rate limiting)

### Format JSON od GPT:

```json
{
  "title": "Szukam hydraulika w Warszawie - pilne",
  "description": "Potrzebuję naprawy kranu w łazience. Cieknie od wczoraj. Bemowo, mogę płacić gotówką.",
  "price_min": 80,
  "price_max": 150,
  "price_type": "fixed"
}
```

### Mapowanie kategorii → Unsplash search terms

Przykłady:
- "Hydraulika" → "plumber plumbing pipes"
- "Elektryka" → "electrician electrical work"
- "Ogrodnictwo" → "gardening plants landscaping"

Pełna lista w: `lib/unsplash.ts` → `mapCategoryToSearchTerm()`

## Limity i optymalizacja

### Rate Limits:

- **OpenAI GPT-5 Nano**: Teoretycznie nielimitowany, ale dodane 500ms delay
- **Unsplash Free tier**: 50 zapytań/godzinę
  - Dla 170 kategorii × 3 posty = **510 zapytań** = **~11 godzin** generowania
  - Lub uruchom bez `UNSPLASH_ACCESS_KEY` (posty bez zdjęć = szybsze)

### Czas generowania:

- **Bez zdjęć**: ~2-3 minuty dla 500 postów
- **Ze zdjęciami**: ~10-15 minut (przez rate limit Unsplash)

### Optymalizacja:

1. **Zwiększ delay** jeśli dostajesz rate limit errors:
   ```typescript
   // W generate-bulk/route.ts, linia 164
   await new Promise(resolve => setTimeout(resolve, 1000)) // 500ms → 1000ms
   ```

2. **Generuj bez zdjęć** dla szybkiego testowania:
   - Usuń `UNSPLASH_ACCESS_KEY` z `.env.local`
   - Bot pominie pobieranie zdjęć

3. **Paid Unsplash** (jeśli potrzebujesz więcej):
   - Plus plan: 5000 zapytań/godzinę
   - https://unsplash.com/pricing

## Rozwiązywanie problemów

### Problem: "AI settings not found"
**Rozwiązanie**: Uruchom migrację `20250119000002_add_content_bot_settings.sql`

### Problem: "No content generated" lub błędy GPT
**Rozwiązanie**:
- Sprawdź `OPENAI_API_KEY` w `.env.local`
- Upewnij się że masz dostęp do GPT-5 Nano
- Sprawdź logi API w konsoli

### Problem: Brak zdjęć w postach
**Rozwiązanie**:
- Dodaj `UNSPLASH_ACCESS_KEY` do `.env.local`
- Sprawdź limit 50 zapytań/godzinę w Unsplash dashboard

### Problem: "Unauthorized" w endpointach
**Rozwiązanie**: Upewnij się że jesteś zalogowany jako admin

### Problem: Progress bar się zawiesza
**Rozwiązanie**:
- Sprawdź konsole przeglądarki (F12)
- Upewnij się że backend nie zwrócił błędu
- Odśwież stronę i spróbuj ponownie

## FAQ

**Q: Czy mogę edytować posty wygenerowane przez AI?**
A: Tak, zachowują się jak normalne posty. Możesz je edytować w dashboard.

**Q: Czy posty AI są widoczne dla wszystkich użytkowników?**
A: Tak, są public i mają badge "AI" aby użytkownicy wiedzieli że to przykładowa treść.

**Q: Czy mogę zmienić miasta które bot używa?**
A: Tak, edytuj `POLISH_CITIES` w `generate-bulk/route.ts` lub `generate-post/route.ts`

**Q: Czy mogę generować tylko dla wybranych kategorii?**
A: Obecnie tylko "all categories". Możesz zmodyfikować endpoint aby przyjmował `categoryIds[]`

**Q: Jak zmienić prompt dla GPT?**
A: Edytuj `content_bot_prompt` w tabeli `ai_settings` przez SQL lub dodaj UI w panelu admin

## Rozszerzenia (TODO)

Możliwe przyszłe rozszerzenia:

- [ ] UI do edycji ustawień bota w panelu admin
- [ ] Wybór konkretnych kategorii do generowania
- [ ] Preview postów przed zapisaniem
- [ ] Harmonogram automatycznego generowania
- [ ] Integracja z DALL-E dla custom obrazów
- [ ] Eksport/import promptów
- [ ] A/B testing różnych promptów

## Support

W razie problemów:
1. Sprawdź logi w konsoli przeglądarki (F12)
2. Sprawdź logi API w terminalu (`npm run dev`)
3. Sprawdź tabele w Supabase SQL Editor
4. Zgłoś issue na GitHub

---

**Autor**: Claude Code
**Wersja**: 1.0.0
**Data**: 2025-01-19
