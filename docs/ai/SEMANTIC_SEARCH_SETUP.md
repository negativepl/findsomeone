# Semantic search i smart suggestions - instrukcja konfiguracji

## Co zostało zaimplementowane:

### 1. Database (PostgreSQL + pgvector)
- Kolumna `embedding` w tabeli `posts` (vector 1536 dims)
- Indeks HNSW dla ultra-szybkiego wyszukiwania
- Funkcje SQL dla semantic search i hybrid search
- Tabela `user_search_preferences` dla personalizacji
- Rozszerzona tabela `search_queries` z embeddingami

### 2. Endpointy API
- `/api/search/semantic` - Wyszukiwanie semantyczne z embeddingami
- `/api/search/suggestions` - Smart suggestions oparte na AI
- Zaktualizowany `/api/search` - Dodane smart suggestions dla zalogowanych

### 3. Komponenty UI
- `LiveSearchBar` - Pokazuje smart AI suggestions dla zalogowanych
- `EmbeddingsManager` - Panel admina do generowania embeddingów
- `/admin/embeddings` - Strona zarządzania embeddingami

### 4. Funkcje pomocnicze
- `/lib/embeddings.ts` - Funkcje do generowania i zarządzania embeddingami
- Batch processing dla efektywności
- Cost estimation

---

## Setup (krok po kroku):

### Krok 1: Uruchom migracje bazy danych

Musisz wykonać migracje SQL w Supabase:

1. Otwórz Supabase Dashboard: https://supabase.com/dashboard
2. Wybierz swój projekt
3. Idź do **SQL Editor**
4. Uruchom te pliki w kolejności:

```sql
-- 1. Najpierw: Dodaj pgvector extension i embeddings
-- Plik: supabase/migrations/20250111120000_add_embeddings.sql
-- Skopiuj całą zawartość i uruchom w SQL Editor

-- 2. Potem: Dodaj user search history i preferences
-- Plik: supabase/migrations/20250111120001_user_search_history.sql
-- Skopiuj całą zawartość i uruchom w SQL Editor
```

**Albo przez CLI:**
```bash
supabase db push
```

### Krok 2: Weryfikuj że OpenAI API key jest ustawiony

```bash
# Sprawdź .env.local
cat .env.local | grep OPENAI_API_KEY
```

Powinno być:
```
OPENAI_API_KEY=sk-proj-twój-klucz...
```

### Krok 3: Wygeneruj embeddingi dla istniejących postów

1. Przejdź do panelu admina: `http://localhost:3000/admin/embeddings`
2. Kliknij **"Wygeneruj Embeddingi dla Postów"**
3. Poczekaj aż proces się zakończy (dla 100 postów: ~30-60 sekund)
4. System przetworzy tylko posty bez embeddingów (max 100 na raz)

**Lub przez API:**
```bash
curl -X POST http://localhost:3000/api/search/semantic \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{}'
```

### Krok 4: Testuj!

#### Test 1: Semantic Search
```bash
# Wyszukaj "instalator wody"
# Powinno znaleźć też posty z "hydraulik", "monter", itp.
curl "http://localhost:3000/api/search/semantic?q=instalator%20wody&mode=hybrid"
```

#### Test 2: Smart Suggestions (wymaga zalogowania)
```bash
curl "http://localhost:3000/api/search/suggestions" \
  -H "Cookie: your-session-cookie"
```

#### Test 3: LiveSearchBar
1. Zaloguj się
2. Otwórz dashboard
3. Kliknij na search bar (NIE wpisuj nic)
4. Powinieneś zobaczyć sekcję **"Dla Ciebie (AI)"** z personalizowanymi sugestiami

---

## Jak to działa?

### Semantic search (wyszukiwanie semantyczne)

1. **Użytkownik wpisuje:** "instalator wody"
2. **System generuje embedding** dla zapytania (wektor 1536 liczb)
3. **PostgreSQL porównuje** embedding zapytania z embeddingami postów
4. **Ranking hybrydowy:**
   - 60% - Podobieństwo semantyczne (cosine similarity)
   - 40% - Full-text search (trigrams + synonyms)
5. **Wyniki:** Posty z "hydraulik", "monter instalacji", "fachowiec" też się pojawią!

### Smart suggestions (inteligentne sugestie)

System analizuje:
1. **Behavioral (Behawioralne):**
   - Historia wyszukiwań użytkownika (ostatnie 90 dni)
   - Najczęściej klikane kategorie
   - Ulubione miasta

2. **Semantic (Semantyczne):**
   - Tworzy "profil preferencji" użytkownika (średnia embeddingów)
   - Znajduje posty podobne do profilu (similarity > 0.75)
   - Zwraca jako sugestie

3. **Trending (Trendujące):**
   - Popularne wyszukiwania w ulubionych kategoriach użytkownika
   - Z ostatnich 7 dni

### Przykład:

**Użytkownik często szuka:**
- "hydraulik Warszawa"
- "instalator WC"
- "naprawa rur"

**System AI proponuje:**
- "montaż grzejników" (semantycznie podobne)
- "serwis centralnego ogrzewania" (ta sama kategoria)
- "hydraulik Kraków" (inne miasto, ta sama usługa)

---

## Monitoring i analytics

### Sprawdź pokrycie embeddingów:

```sql
-- Ile postów ma embeddingi?
SELECT
  COUNT(*) FILTER (WHERE embedding IS NOT NULL) as with_embeddings,
  COUNT(*) FILTER (WHERE embedding IS NULL) as without_embeddings,
  COUNT(*) as total,
  ROUND(COUNT(*) FILTER (WHERE embedding IS NOT NULL)::numeric / COUNT(*) * 100, 2) as coverage_percent
FROM posts
WHERE status = 'active';
```

### Testuj semantic search:

```sql
-- Znajdź posty semantycznie podobne do "hydraulik"
SELECT
  title,
  (1 - (embedding <=> '[0.1,0.2,...]'::vector)) as similarity
FROM posts
WHERE embedding IS NOT NULL
ORDER BY embedding <=> '[0.1,0.2,...]'::vector
LIMIT 10;
```

### Sprawdź user preferences:

```sql
-- Zobacz preferencje użytkowników
SELECT
  user_id,
  preferred_categories,
  preferred_cities,
  search_frequency,
  last_search_at
FROM user_search_preferences
ORDER BY search_frequency DESC
LIMIT 10;
```

---

## Koszty

### OpenAI Embeddings (text-embedding-3-small)
- **Cena:** $0.02 / 1M tokenów
- **Przykładowe koszty:**
  - 100 postów: ~$0.01-0.02
  - 1000 postów: ~$0.10-0.15
  - 10000 postów: ~$1.00-1.50

### Szacunkowe zużycie:
- Średni post: ~100-200 tokenów
- 1 search query: ~10-20 tokenów
- **Miesięcznie (1000 postów + 10k searches):**
  - Posty: $0.15
  - Queries: $0.20
  - **TOTAL: ~$0.35/miesiąc**

---

## Konfiguracja (opcjonalna)

### 1. Threshold dla semantic search

W `/app/api/search/semantic/route.ts`:
```typescript
const threshold = parseFloat(searchParams.get('threshold') || '0.7')
// 0.7 = default (70% podobieństwa)
// Niżej = więcej wyników (mniej precyzyjne)
// Wyżej = mniej wyników (bardziej precyzyjne)
```

### 2. Wagi w hybrid search

W `supabase/migrations/20250111120000_add_embeddings.sql`:
```sql
-- Linia ~110: Zmień wagi
(
  case when p.embedding is not null
    then (1 - (p.embedding <=> query_embedding)) * 0.6  -- 60% semantic
    else 0
  end +
  (...) * 0.4  -- 40% full-text
)
```

### 3. Limit smart suggestions

W `/app/api/search/suggestions/route.ts`:
```typescript
const limit = parseInt(searchParams.get('limit') || '10')
```

---

## Rozwiązywanie problemów

### **"extension vector does not exist"**
**Problem:** pgvector nie jest zainstalowany
**Rozwiązanie:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### **"Failed to generate embedding"**
**Problem:** OpenAI API key niepoprawny
**Rozwiązanie:**
1. Sprawdź `.env.local`
2. Zweryfikuj key na https://platform.openai.com/api-keys
3. Restart dev server: `npm run dev`

### **"No smart suggestions"**
**Problem:** Użytkownik nie ma historii wyszukiwań
**Rozwiązanie:**
- To normalne dla nowych użytkowników
- Wykonaj kilka wyszukiwań, potem sprawdź ponownie
- System potrzebuje min. 2-3 wyszukiwań dla personalizacji

### **"Embeddings generation slow"**
**Problem:** Dużo postów do przetworzenia
**Rozwiązanie:**
- System przetwarza max 100 postów na raz
- Dla większych ilości: uruchom kilka razy
- Lub zwiększ batch size w kodzie (linia ~172 w route.ts)

---

## Przyszłe rozszerzenia

Możliwe ulepszenia:

1. **Auto-embedding trigger**
   - Automatyczne generowanie embeddings przy tworzeniu posta
   - Webhook lub database trigger

2. **Cached embeddings**
   - Cache embeddingów dla częstych zapytań
   - Redis lub Supabase Edge Functions

3. **Multi-language embeddings**
   - Obsługa wielu języków
   - Różne modele dla różnych języków

4. **A/B Testing**
   - Porównanie semantic vs full-text
   - Metryki: CTR, conversion, satisfaction

5. **Query expansion z GPT**
   - Rozszerzanie zapytań przez GPT
   - "hydraulik" → "hydraulik instalator monter instalacji wodno-kanalizacyjnych"

---

## Pliki dodane/zmienione

### Nowe pliki:
```
/supabase/migrations/20250111120000_add_embeddings.sql
/supabase/migrations/20250111120001_user_search_history.sql
/lib/embeddings.ts
/app/api/search/semantic/route.ts
/app/api/search/suggestions/route.ts
/components/admin/EmbeddingsManager.tsx
/app/admin/embeddings/page.tsx
/SEMANTIC_SEARCH_SETUP.md (ten plik)
```

### Zmodyfikowane pliki:
```
/app/api/search/route.ts (dodane smart suggestions)
/components/LiveSearchBar.tsx (dodana sekcja AI suggestions)
/app/admin/page.tsx (dodany link do embeddings)
```

---

## Checklist

Przed uruchomieniem na produkcji:

- [ ] Migracje bazy wykonane
- [ ] pgvector extension włączony
- [ ] OpenAI API key ustawiony
- [ ] Embeddingi wygenerowane dla wszystkich postów
- [ ] Semantic search przetestowany (min. 10 zapytań)
- [ ] Smart suggestions przetestowane dla zalogowanych
- [ ] Monitoring embeddingów skonfigurowany
- [ ] Rate limiting dla API (opcjonalne, ale zalecane)
- [ ] Backup bazy przed migracją (WAŻNE!)

---

## Gotowe!

System jest teraz w pełni funkcjonalny! Użytkownicy będą mieli:

- **Semantyczne wyszukiwanie** - znajduje podobne znaczenia
- **Smart suggestions** - personalizowane na podstawie AI
- **Ultra-szybkie** - dzięki HNSW index
- **Precyzyjne** - hybrid ranking (semantic + full-text)

**Pytania?** Sprawdź `/admin/embeddings` w panelu admina!
