# FindSomeone - Platforma lokalnych ogłoszeń usługowych

Aplikacja webowa do publikowania i przeglądania lokalnych ogłoszeń usługowych. Użytkownicy mogą szukać specjalistów (hydraulik, elektryk, etc.) lub oferować swoje usługi.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **AI/ML**: OpenAI (GPT-5 nano, text-embedding-3-small), pgvector
- **Email**: Resend
- **Walidacja**: Zod, React Hook Form

## Funkcjonalności

### Zaimplementowane (MVP)
- ✅ Rejestracja i logowanie (email/password + Google OAuth)
- ✅ Landing page z opisem funkcjonalności
- ✅ Dashboard z listą ogłoszeń
- ✅ Tworzenie ogłoszeń (szukam/oferuję)
- ✅ Kategorie usług
- ✅ Lokalizacja (miasto, dzielnica)
- ✅ Budżet (min/max, typ: godzinowa/stała/negocjacja)
- ✅ Middleware dla ochrony tras
- ✅ Row Level Security (RLS) w bazie danych
- ✅ **AI-powered Search:**
  - ✅ Semantyczne wyszukiwanie (OpenAI embeddings + pgvector)
  - ✅ Smart suggestions oparte na historii użytkownika
  - ✅ Hybrid search (60% semantic + 40% full-text)
  - ✅ AI Generator synonimów (GPT-5 nano)
  - ✅ Full-text search z trigrams (typo-tolerancja)
  - ✅ Search analytics i trending queries
  - ✅ **Rate limiting** (10 req/10s per IP, zabezpieczenie przed abuse)

### Do zaimplementowania
- ⏳ Szczegóły ogłoszenia (pojedyncza strona)
- ⏳ System wiadomości (chat)
- ⏳ Profil użytkownika (edycja, avatar)
- ⏳ System ocen i opinii
- ⏳ Zapisywanie ulubionych ogłoszeń
- ⏳ Upload zdjęć do ogłoszeń
- ⏳ Powiadomienia email (Resend)
- ⏳ Mapa z lokalizacją ogłoszeń
- ⏳ Moderacja i zgłaszanie treści

## 🔮 AI Features

Projekt wykorzystuje zaawansowane AI dla lepszego doświadczenia użytkownika:

### **1. Semantyczne wyszukiwanie (Semantic Search)**
- Wykorzystuje **OpenAI text-embedding-3-small** do generowania wektorów (1536 dims)
- **pgvector** extension w PostgreSQL z HNSW indexem
- Znajduje posty o podobnym znaczeniu, nie tylko dokładne dopasowania
- Przykład: "instalator wody" → znajduje też "hydraulik", "monter instalacji"

### **2. Hybrid Search**
- **60% semantic similarity** (embeddings)
- **40% full-text search** (trigrams + synonyms)
- Najlepsze z obu światów - precyzja i elastyczność

### **3. Smart Suggestions**
Personalizowane sugestie dla zalogowanych użytkowników:
- **Behavioral:** Na podstawie historii wyszukiwań (ostatnie 90 dni)
- **Semantic:** Podobieństwo do profilu preferencji użytkownika
- **Trending:** Popularne wyszukiwania w ulubionych kategoriach

### **4. AI Generator Synonimów**
- **GPT-5 nano** generuje synonymy dla wyszukiwarki
- Panel admina: `/admin/synonyms`
- 3 tryby: Trending, Popular, Custom
- Review & approve system

### **Setup AI Features**

Szczegółowy przewodnik: [SEMANTIC_SEARCH_SETUP.md](./SEMANTIC_SEARCH_SETUP.md)

Krótka instrukcja:
1. Dodaj `OPENAI_API_KEY` do `.env.local`
2. Uruchom migracje SQL: `supabase/migrations/20250111120000_*.sql`
3. Wygeneruj embeddingi: `/admin/embeddings`
4. Gotowe! 🎉

**Koszty:** ~$0.35/miesiąc dla 1000 postów + 10k wyszukiwań

## Setup

### 1. Instalacja zależności

\`\`\`bash
npm install
\`\`\`

### 2. Konfiguracja Supabase

1. Utwórz projekt na [supabase.com](https://supabase.com)
2. Przejdź do **SQL Editor** i wykonaj zawartość pliku `supabase/schema.sql`
3. W **Authentication** -> **Providers** włącz:
   - Email (domyślnie włączony)
   - Google OAuth (opcjonalnie)
4. Skopiuj klucze z **Project Settings** -> **API**

### 3. Zmienne środowiskowe

Uzupełnij plik `.env.local`:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=twój-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=twój-anon-key

# Resend (opcjonalnie, na przyszłość)
RESEND_API_KEY=twój-resend-api-key
\`\`\`

### 4. Uruchomienie

\`\`\`bash
npm run dev
\`\`\`

Aplikacja będzie dostępna pod adresem [http://localhost:3000](http://localhost:3000)

## Struktura projektu

\`\`\`
findsomeone/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Logowanie
│   ├── signup/page.tsx             # Rejestracja
│   ├── auth/
│   │   ├── callback/route.ts       # OAuth callback
│   │   └── signout/route.ts        # Wylogowanie
│   └── dashboard/
│       ├── page.tsx                # Lista ogłoszeń
│       └── posts/
│           └── new/page.tsx        # Nowe ogłoszenie
├── components/
│   └── ui/                         # shadcn/ui komponenty
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Client-side Supabase
│   │   └── server.ts              # Server-side Supabase
│   ├── types/
│   │   └── database.ts            # TypeScript types dla DB
│   └── utils.ts
├── supabase/
│   └── schema.sql                 # Schemat bazy danych
├── middleware.ts                  # Auth middleware
└── .env.local                     # Zmienne środowiskowe
\`\`\`

## Baza danych

### Tabele
- **profiles** - profile użytkowników (rozszerzenie auth.users)
- **categories** - kategorie usług
- **posts** - ogłoszenia
- **messages** - wiadomości między użytkownikami
- **reviews** - oceny i opinie
- **saved_posts** - zapisane ogłoszenia

### Row Level Security (RLS)
Wszystkie tabele mają włączone RLS policies dla bezpieczeństwa danych.

## Dodatkowe informacje

### shadcn/ui
Projekt używa [shadcn/ui](https://ui.shadcn.com/) - komponentów zbudowanych na Radix UI i Tailwind CSS.

Dodawanie nowych komponentów:
\`\`\`bash
npx shadcn@latest add [nazwa-komponentu]
\`\`\`

### Supabase Auth
- Email/Password - domyślnie włączone
- Google OAuth - wymaga konfiguracji w Supabase dashboard
- Magic Links - możliwe do włączenia

### Deployment

Projekt jest gotowy do deploy na **Vercel**:

1. Push do GitHub
2. Import projektu w Vercel
3. Dodaj zmienne środowiskowe
4. Deploy!

## Autor

Projekt portfolio - aplikacja marketplace lokalnych usług.

## Licencja

MIT
