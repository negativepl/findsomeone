# Struktura Projektu FindSomeone

## 📁 Główne Foldery

```
findsomeone/
├── app/                    # Next.js App Router - strony i API routes
│   ├── api/               # API endpoints
│   ├── posts/             # Strony z ogłoszeniami
│   ├── dashboard/         # Panel użytkownika
│   ├── admin/             # Panel admina
│   └── profile/           # Profile użytkowników
│
├── components/            # Komponenty React
│   ├── ui/               # Komponenty UI (shadcn/ui)
│   ├── admin/            # Komponenty dla admina
│   └── sections/         # Sekcje strony głównej
│
├── lib/                  # Biblioteki i utility
│   ├── supabase/         # Klienty Supabase
│   ├── actions/          # Server Actions
│   ├── hooks/            # Custom React Hooks
│   └── utils/            # Funkcje pomocnicze
│
├── docs/                 # 📚 Dokumentacja projektu
│   ├── ai/              # Dokumentacja AI i ML
│   ├── setup/           # Przewodniki konfiguracji
│   ├── compliance/      # Zgodność i prywatność
│   └── README.md        # Indeks dokumentacji
│
├── supabase/            # Konfiguracja bazy danych
│   ├── migrations/      # Migracje SQL (w kolejności czasowej)
│   ├── functions/       # SQL functions (search, embeddings, etc.)
│   ├── policies/        # Row Level Security policies
│   ├── archive/         # Stare/nieużywane pliki SQL
│   └── schema.sql       # Główna schema bazy danych
│
├── scripts/             # Skrypty pomocnicze
│   ├── fetch-cities.ts       # Pobieranie listy miast
│   ├── apply-search-fix.sh   # Fix wyszukiwarki
│   ├── run-migration.ts      # Uruchamianie migracji
│   └── start-claude.sh       # Start Claude AI
│
├── public/              # Pliki statyczne
│   ├── animations/      # Animacje Lottie
│   └── images/          # Obrazy
│
└── types/              # TypeScript type definitions
```

## 📚 Dokumentacja

Cała dokumentacja projektu znajduje się w folderze [`/docs`](./docs/):

- **AI & ML**: [`/docs/ai`](./docs/ai/) - Semantic search, embeddings, content bot
- **Setup**: [`/docs/setup`](./docs/setup/) - Konfiguracja, optymalizacja, rate limiting
- **Compliance**: [`/docs/compliance`](./docs/compliance/) - RODO, moderacja, prywatność

## 🗄️ Baza Danych

Struktura w folderze `/supabase`:

- **schema.sql** - Główna schema (tabele, indeksy, polityki RLS)
- **migrations/** - Migracje w kolejności chronologicznej (format: `YYYYMMDDHHMMSS_description.sql`)
- **functions/** - Funkcje SQL (search_posts, generate_embeddings, etc.)
- **policies/** - Polityki bezpieczeństwa RLS
- **archive/** - Stare/nieużywane pliki SQL

## 🔧 Skrypty

Wszystkie skrypty pomocnicze w folderze `/scripts`:

```bash
# Pobranie listy miast do bazy
npx tsx scripts/fetch-cities.ts

# Uruchomienie migracji
npx tsx scripts/run-migration.ts

# Start Claude AI
./scripts/start-claude.sh
```

## 🚀 Quick Start

1. **Instalacja zależności:**
   ```bash
   npm install
   ```

2. **Konfiguracja zmiennych środowiskowych:**
   ```bash
   cp .env.example .env.local
   # Edytuj .env.local i dodaj klucze API
   ```

3. **Uruchomienie dev servera:**
   ```bash
   npm run dev
   ```

4. **Dokumentacja:**
   - Zobacz [`/docs/README.md`](./docs/README.md) dla pełnej dokumentacji
   - Przeczytaj [główny README.md](./README.md) dla przeglądu projektu

## 📝 Konwencje

### Pliki i Foldery
- Komponenty React: PascalCase (`UserProfile.tsx`)
- Utility functions: camelCase (`formatDate.ts`)
- API routes: kebab-case (`/api/posts/[id]/route.ts`)
- Dokumentacja: UPPER_SNAKE_CASE.md

### SQL
- Tabele: snake_case (`user_profiles`)
- Funkcje: snake_case (`search_posts`)
- Migracje: `YYYYMMDDHHMMSS_description.sql`

### TypeScript
- Interfaces: PascalCase z `I` prefix (`IUserProfile`)
- Types: PascalCase (`UserProfile`)
- Enums: PascalCase (`PostStatus`)
