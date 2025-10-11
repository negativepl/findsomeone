# 🤖 AI Features - Dokumentacja

## Generator Synonimów AI (GPT-5 nano)

System automatycznego generowania synonimów dla wyszukiwarki wykorzystując GPT-5 nano od OpenAI.

### 🎯 Funkcjonalności

1. **Auto-generowanie synonimów** - AI analizuje terminy i generuje kontekstowe synonymy
2. **3 tryby pracy:**
   - **Trendy (7 dni)** - analizuje najpopularniejsze wyszukiwania z ostatnich 7 dni
   - **Popularne (30 dni)** - analizuje najpopularniejsze wyszukiwania z ostatnich 30 dni
   - **Własny termin** - pozwala wprowadzić dowolny termin do analizy

3. **Review & Approve System** - AI proponuje, admin wybiera co zatwierdzić
4. **Batch Processing** - możliwość zatwierdzenia wielu synonimów jednocześnie
5. **Inteligentny kontekst** - AI rozumie polski język i lokalne nazewnictwo

### 🚀 Jak używać?

1. **Przejdź do panelu admina:** `/admin/synonyms`
2. **Wybierz tryb generowania:**
   - Trendy - najlepszy dla aktualnych potrzeb
   - Popularne - szerszy zakres terminów
   - Własny termin - dla specyficznych przypadków
3. **Kliknij "Wygeneruj Synonymy AI"**
4. **Przejrzyj propozycje AI:**
   - Każda propozycja zawiera:
     - Termin główny
     - Lista synonimów (3-6 sztuk)
     - Kontekst i wyjaśnienie
5. **Zaznacz wybrane propozycje** (lub "Zaznacz wszystkie")
6. **Kliknij "Zastosuj wybrane"**

### 🔧 Konfiguracja

#### Wymagania:
- Klucz API OpenAI (GPT-5 nano)

#### Setup:
1. Dodaj do `.env.local`:
```bash
OPENAI_API_KEY=sk-proj-...
```

2. Pobierz klucz z: https://platform.openai.com/api-keys

### 💰 Koszty

GPT-5 nano to najtańszy model GPT-5:
- **Input:** $0.05 / 1M tokens
- **Output:** $0.40 / 1M tokens

Przykładowe koszty:
- 10 terminów: ~$0.01 - $0.02
- 100 terminów: ~$0.10 - $0.15

### 📊 API Endpoints

#### POST `/api/admin/synonyms/generate`
Generuje synonymy AI dla wybranych terminów.

**Request:**
```json
{
  "mode": "trending" | "popular" | "custom",
  "customTerm": "optional-term-for-custom-mode"
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "term": "hydraulik",
      "synonyms": ["instalator", "monter instalacji", "fachowiec od instalacji"],
      "context": "Osoba zajmująca się instalacjami wodno-kanalizacyjnymi i grzewczymi"
    }
  ],
  "tokensUsed": 450,
  "model": "gpt-5-nano"
}
```

#### PUT `/api/admin/synonyms/generate`
Zatwierdza i zapisuje wybrane synonymy do bazy.

**Request:**
```json
{
  "suggestions": [
    {
      "term": "hydraulik",
      "synonyms": ["instalator", "monter"],
      "context": "..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "inserted": 2,
  "synonyms": [...]
}
```

### 🎨 UI Components

**Generator AI Panel** (`/components/admin/SynonymsManager.tsx`):
- Przełączniki trybów (Trendy/Popularne/Własny)
- Przycisk generowania z loading state
- Panel z propozycjami AI
- Checkboxy do wyboru synonimów
- Batch actions (zaznacz wszystkie, zastosuj wybrane)

### 🔮 Przyszłe funkcje AI

Planowane rozszerzenia:
1. **Query Expansion** - automatyczne rozszerzanie zapytań
2. **Semantic Search** - wyszukiwanie semantyczne
3. **Query Rewriting** - poprawianie błędów i optymalizacja fraz
4. **Category Prediction** - automatyczne dopasowanie kategorii
5. **Intent Recognition** - rozpoznawanie intencji użytkownika

### 🐛 Troubleshooting

**Problem:** Błąd "Failed to generate synonyms"
- **Rozwiązanie:** Sprawdź czy `OPENAI_API_KEY` jest poprawnie ustawiony w `.env.local`

**Problem:** Brak propozycji
- **Rozwiązanie:** Wszystkie terminy już mają synonymy lub brak trending searches w bazie

**Problem:** Błąd parsowania JSON
- **Rozwiązanie:** Model czasem zwraca nieprawidłowy format - odśwież i spróbuj ponownie

### 📝 Notatki techniczne

- Model: `gpt-5-nano`
- Temperature: `0.7` (balans kreatywności i precyzji)
- Response format: `json_object` (structured output)
- Context window: 272K tokens input, 128K output
- Timeout: 30s (można zwiększyć dla większych batch'y)

### 🔐 Bezpieczeństwo

- Endpoint wymaga uprawnień **admin**
- Weryfikacja użytkownika przez Supabase Auth
- Rate limiting zalecany dla produkcji
- API key tylko w server-side components (nie w przeglądarce)
