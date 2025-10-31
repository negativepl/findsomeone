# 🚀 Quick Start - AI Synonym Generator

## ✅ Co zostało zaimplementowane:

### 1. **API Endpoint** (`/api/admin/synonyms/generate`)
- ✅ Integracja z GPT-5 nano
- ✅ 3 tryby: Trending (7 dni), Popular (30 dni), Custom (własny termin)
- ✅ Automatyczne filtrowanie istniejących synonimów
- ✅ Structured JSON output
- ✅ Error handling i walidacja

### 2. **UI Components**
- ✅ Piękny panel AI w `/admin/synonyms`
- ✅ Przełączniki trybów generowania
- ✅ Loading states i feedback
- ✅ Review & approve system (checkboxy)
- ✅ Batch operations (zaznacz wszystkie, zastosuj wybrane)
- ✅ Wyświetlanie kontekstu AI dla każdej propozycji

### 3. **Infrastructure**
- ✅ OpenAI package zainstalowany
- ✅ Helper functions w `/lib/openai.ts`
- ✅ Konfiguracja modeli (GPT-5 nano/mini/standard)
- ✅ Pricing calculator
- ✅ API key validation

### 4. **Dokumentacja**
- ✅ `AI_FEATURES.md` - pełna dokumentacja funkcjonalności
- ✅ `AI_SETUP_GUIDE.md` - ten przewodnik
- ✅ `.env.example` zaktualizowany

## 🔧 Setup (TY MUSISZ TO ZROBIĆ):

### Krok 1: Dodaj klucz OpenAI API

```bash
# Otwórz .env.local i dodaj:
OPENAI_API_KEY=sk-proj-twój-klucz-tutaj
```

**Skąd wziąć klucz?**
1. Idź na: https://platform.openai.com/api-keys
2. Zaloguj się / załóż konto
3. Kliknij "Create new secret key"
4. Skopiuj klucz (zaczyna się od `sk-proj-...`)
5. Wklej do `.env.local`

### Krok 2: Restart dev server

```bash
npm run dev
```

### Krok 3: Testuj!

1. Przejdź do: `http://localhost:3000/admin/synonyms`
2. Kliknij jeden z trybów (Trendy/Popularne/Własny)
3. Kliknij "Wygeneruj Synonymy AI"
4. Zaznacz propozycje które Ci pasują
5. Kliknij "Zastosuj wybrane"
6. DONE! 🎉

## 📊 Jak to działa?

1. **Wybierasz tryb:**
   - **Trendy** → AI analizuje wyszukiwania z ostatnich 7 dni
   - **Popularne** → AI analizuje wyszukiwania z ostatnich 30 dni
   - **Własny** → Wpisujesz dowolny termin

2. **AI generuje synonymy:**
   - GPT-5 nano rozumie polski kontekst
   - Generuje 3-6 synonimów na termin
   - Dodaje wyjaśnienie/kontekst

3. **Ty decydujesz:**
   - Przeglądasz propozycje AI
   - Zaznaczasz te które chcesz
   - Jednym klikiem zapisujesz do bazy

4. **Wyszukiwarka używa synonimów:**
   - Użytkownik wpisuje "sprzątaczka"
   - Znajduje też wyniki dla "pomoc domowa", "gosposia" itp.

## 💰 Koszty

GPT-5 nano jest **super tani**:
- Input: $0.05 / 1M tokenów
- Output: $0.40 / 1M tokenów

**Przykładowe koszty:**
- 10 terminów: ~$0.01-0.02
- 100 terminów: ~$0.10-0.15
- 1000 terminów: ~$1.00-1.50

W praktyce: **parę groszy za sesję** 🤑

## 🐛 Troubleshooting

### "OpenAI API key not configured"
**Problem:** Klucz nie jest ustawiony
**Rozwiązanie:** Dodaj `OPENAI_API_KEY` do `.env.local`

### "Failed to generate synonyms"
**Problem:** Błąd komunikacji z OpenAI
**Rozwiązanie:**
1. Sprawdź czy klucz jest poprawny
2. Sprawdź czy masz credits w OpenAI
3. Sprawdź internet

### "Brak propozycji"
**Problem:** Wszystkie terminy już mają synonymy
**Rozwiązanie:** To dobrze! Spróbuj innego trybu lub własnego terminu

### Build errors w innych plikach
**Problem:** Błędy TypeScript `any` w starych plikach
**Rozwiązanie:** To nie dotyczy AI - możesz zignorować lub naprawić osobno

## 📁 Pliki które dodałem:

```
/app/api/admin/synonyms/generate/route.ts    # API endpoint
/lib/openai.ts                                # OpenAI helpers
/components/admin/SynonymsManager.tsx         # UI (zaktualizowany)
/AI_FEATURES.md                               # Dokumentacja funkcjonalności
/AI_SETUP_GUIDE.md                            # Ten przewodnik
/.env.example                                 # Zaktualizowany
```

## 🔮 Następne kroki (opcjonalne):

Jeśli chcesz rozbudować AI dalej, możemy dodać:

1. **Query Expansion** - automatyczne rozszerzanie zapytań
2. **Semantic Search** - wyszukiwanie semantyczne (podobieństwo znaczenia)
3. **Query Rewriting** - poprawianie błędów ortograficznych
4. **Intent Recognition** - rozpoznawanie intencji użytkownika
5. **Category Auto-tagging** - automatyczne dopasowanie kategorii

**Jesteś gotowy!** 🚀

Po prostu dodaj klucz API i testuj!
