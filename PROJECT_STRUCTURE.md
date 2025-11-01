# Struktura Projektu FindSomeone

## Przegląd

FindSomeone to aplikacja Next.js 16 wykorzystująca App Router, TypeScript i Supabase jako backend.

## Struktura katalogów

```
findsomeone/
├── app/                           # Next.js 16 App Router
│   ├── (auth)/                   # Grupa routingu dla autoryzacji
│   │   ├── login/               # Strona logowania
│   │   └── signup/              # Strona rejestracji
│   ├── about/                   # Strona "O nas"
│   ├── admin/                   # Panel administracyjny
│   │   ├── audit-logs/         # Logi akcji adminów
│   │   ├── categories/         # Zarządzanie kategoriami
│   │   ├── chat/              # Zarządzanie AI chatem
│   │   ├── embeddings/        # Zarządzanie embeddingami AI
│   │   ├── moderation/        # Moderacja ogłoszeń
│   │   ├── reports/           # Zgłoszenia użytkowników
│   │   ├── synonyms/          # Generator synonimów AI
│   │   └── users/             # Zarządzanie użytkownikami
│   ├── api/                    # API Routes
│   │   ├── admin/             # Endpointy administracyjne
│   │   ├── ai-chat/           # AI Navigator Bot
│   │   ├── posts/             # Endpointy ogłoszeń
│   │   └── users/             # Endpointy użytkowników
│   ├── banned/                 # Strona dla zbanowanych użytkowników
│   ├── contact/                # Formularz kontaktowy
│   ├── dashboard/              # Dashboard użytkownika
│   │   ├── favorites/         # Ulubione ogłoszenia
│   │   ├── messages/          # System wiadomości
│   │   ├── my-posts/          # Zarządzanie swoimi ogłoszeniami
│   │   └── profile/           # Profil użytkownika
│   ├── faq/                    # Często zadawane pytania
│   ├── how-it-works/           # Jak to działa
│   ├── install/                # Instrukcja instalacji PWA
│   ├── posts/                  # Przeglądanie ogłoszeń
│   │   └── [id]/              # Szczegóły ogłoszenia
│   ├── privacy/                # Polityka prywatności
│   ├── profile/                # Profile publiczne użytkowników
│   │   └── [userId]/          # Profil użytkownika
│   └── terms/                  # Regulamin serwisu
│
├── components/                 # Komponenty React
│   ├── admin/                 # Komponenty panelu admina
│   │   ├── AIChatSettings.tsx
│   │   ├── AuditLogs.tsx
│   │   ├── CategoryManager.tsx
│   │   ├── EmbeddingManager.tsx
│   │   ├── MessageReports.tsx
│   │   ├── ModerationQueue.tsx
│   │   ├── SynonymGenerator.tsx
│   │   └── UserManagement.tsx
│   ├── chat/                  # Komponenty AI Navigator Bot
│   │   ├── AIChatButton.tsx
│   │   └── AIChatInterface.tsx
│   ├── ui/                    # Komponenty UI (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ... (inne komponenty shadcn)
│   ├── Footer.tsx             # Stopka z GitHub badge
│   ├── Logo.tsx               # Logo aplikacji
│   ├── MobileDock.tsx         # Mobilny dock nawigacyjny
│   ├── Navbar.tsx             # Nawigacja główna
│   ├── NavbarWithHide.tsx     # Nawigacja z auto-ukrywaniem
│   └── PostCard.tsx           # Karta ogłoszenia
│
├── lib/                        # Biblioteki i narzędzia
│   ├── actions/               # Server Actions
│   │   ├── admin.ts          # Akcje administracyjne
│   │   ├── messages.ts       # Akcje wiadomości
│   │   ├── posts.ts          # Akcje ogłoszeń
│   │   └── search.ts         # Silnik wyszukiwania AI
│   ├── supabase/             # Klienty Supabase
│   │   ├── client.ts         # Klient dla Client Components
│   │   ├── middleware.ts     # Klient dla middleware
│   │   └── server.ts         # Klient dla Server Components
│   ├── types/                # Typy TypeScript
│   │   └── database.ts       # Typy tabel Supabase
│   ├── admin.ts              # Funkcje pomocnicze admina
│   └── utils.ts              # Funkcje pomocnicze
│
├── supabase/                  # Konfiguracja Supabase
│   └── migrations/           # Migracje SQL
│       ├── 20250111120000_*.sql  # Migracje bazy danych
│       └── ...
│
├── public/                    # Pliki statyczne
│   ├── icons/                # Ikony PWA
│   ├── images/               # Obrazy
│   └── manifest.json         # PWA manifest
│
├── proxy.ts                   # Proxy (następca middleware)
├── next.config.ts            # Konfiguracja Next.js
├── tailwind.config.ts        # Konfiguracja Tailwind CSS
├── tsconfig.json             # Konfiguracja TypeScript
└── package.json              # Zależności projektu
```

## Główne moduły

### 1. Autoryzacja i Użytkownicy
- **Lokalizacja:** `app/(auth)/`, `lib/supabase/`
- **Funkcje:** Logowanie, rejestracja, OAuth (Google), zarządzanie sesją
- **Technologie:** Supabase Auth, cookies, Row Level Security

### 2. Ogłoszenia
- **Lokalizacja:** `app/posts/`, `app/dashboard/my-posts/`, `lib/actions/posts.ts`
- **Funkcje:** Tworzenie, edycja, usuwanie, wyświetlanie ogłoszeń
- **Technologie:** Supabase Storage (zdjęcia), pgvector (embeddings AI)

### 3. Wyszukiwanie AI
- **Lokalizacja:** `lib/actions/search.ts`, `app/api/ai-chat/`
- **Funkcje:**
  - Wyszukiwanie semantyczne (OpenAI embeddings)
  - Wyszukiwanie hybrydowe (60% semantic + 40% fulltext)
  - AI Navigator Bot (chatbot)
  - Inteligentne sugestie
- **Technologie:** OpenAI, pgvector, Hugging Face

### 4. System Wiadomości
- **Lokalizacja:** `app/dashboard/messages/`, `lib/actions/messages.ts`
- **Funkcje:**
  - Wiadomości prywatne w czasie rzeczywistym
  - Wskaźniki obecności (online/offline)
  - System zgłoszeń
- **Technologie:** Supabase Realtime

### 5. Panel Administracyjny
- **Lokalizacja:** `app/admin/`, `components/admin/`
- **Funkcje:**
  - Moderacja ogłoszeń (z AI Hugging Face)
  - Zarządzanie kategoriami
  - Zarządzanie użytkownikami i banami
  - Logi audytowe
  - Generator synonimów AI
  - Zarządzanie embeddingami
  - Konfiguracja AI Chat
- **Technologie:** Supabase RLS, Server Actions

### 6. AI Navigator Bot (Nawigatorek)
- **Lokalizacja:** `app/api/ai-chat/`, `components/chat/`
- **Funkcje:**
  - Chatbot pomagający znaleźć ogłoszenia
  - Naturalna rozmowa z użytkownikiem
  - Integracja z wyszukiwaniem semantycznym
- **Technologie:** OpenAI GPT-4o mini, streaming responses

## Baza Danych (Supabase)

### Główne tabele:

#### `profiles`
Profile użytkowników (extends auth.users)
- Pola: full_name, bio, phone, city, avatar_url, rating, is_banned
- RLS: Użytkownicy mogą edytować tylko swoje profile

#### `posts`
Ogłoszenia użytkowników
- Pola: title, description, city, price_min, price_max, images[], embedding (vector)
- Indeksy: HNSW (semantyczne), GIN (fulltext), trigram (typo-tolerance)
- RLS: Publiczny odczyt, edycja tylko przez właściciela

#### `categories`
Kategorie ogłoszeń
- Pola: name, slug, description, icon (Lucide), sort_order
- RLS: Publiczny odczyt, edycja tylko admin

#### `messages`
Wiadomości prywatne
- Pola: sender_id, receiver_id, post_id, content, read, reported
- RLS: Dostęp tylko dla nadawcy i odbiorcy
- Realtime: Subskrypcje dla live updates

#### `favorites`
Ulubione ogłoszenia
- Pola: user_id, post_id
- RLS: Użytkownik widzi tylko swoje ulubione

#### `reviews`
Oceny i opinie
- Pola: reviewer_id, reviewee_id, post_id, rating (1-5), comment
- RLS: Publiczny odczyt, dodawanie tylko zalogowani

#### `search_analytics`
Analityka wyszukiwania
- Pola: user_id, query, results_count, clicked_post_id, ip_address
- Funkcje: Rate limiting, trending queries

#### `synonyms`
Synonimy dla wyszukiwarki (AI-generated)
- Pola: term, synonym, status (pending/approved/rejected), generated_by_ai
- RLS: Admin zarządza

#### `admin_audit_logs`
Logi akcji adminów
- Pola: admin_id, action_type, target_table, target_id, old_values, new_values
- RLS: Tylko admin ma dostęp
- Automatyczne czyszczenie po 2 latach

#### `ai_chat_settings`
Ustawienia AI Navigator Bot
- Pola: enabled, model, system_prompt, max_tokens, temperature
- RLS: Admin zarządza, publiczny odczyt enabled

## Funkcje PostgreSQL

### Wyszukiwanie
- `search_posts_hybrid()` - Hybrydowe wyszukiwanie (semantic + fulltext)
- Automatyczne generowanie embeddingów przy dodawaniu ogłoszenia

### Moderacja
- Automatyczne logowanie akcji adminów
- Trigger do aktualizacji średniej oceny użytkownika

### Czyszczenie
- Automatyczne usuwanie starych logów audytu (>2 lata)
- Scheduler Supabase (co niedzielę o 2:00)

## Kluczowe technologie

### Frontend
- **Next.js 16** - App Router, Server Components, Server Actions
- **TypeScript** - Silne typowanie
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Komponenty UI
- **Framer Motion** - Animacje
- **React Hook Form + Zod** - Formularze i walidacja

### Backend
- **Supabase** - PostgreSQL, Auth, Realtime, Storage
- **OpenAI** - Embeddings (text-embedding-3-small), GPT (chat)
- **Hugging Face** - Moderacja treści
- **pgvector** - Wyszukiwanie wektorowe
- **Row Level Security** - Bezpieczeństwo na poziomie bazy

### DevOps
- **Vercel** - Hosting i deployment
- **GitHub** - Kontrola wersji
- **Resend** - Wysyłanie emaili

## Bezpieczeństwo

### Row Level Security (RLS)
Wszystkie tabele chronione politykami RLS:
- Użytkownicy widzą tylko swoje dane
- Wiadomości dostępne tylko dla uczestników
- Admin ma pełny dostęp (przez security definer functions)

### Rate Limiting
- Wyszukiwanie: 10 req/10s per IP
- API endpoints: Upstash Redis rate limiting

### Walidacja
- Zod schema dla wszystkich formularzy
- Server-side validation w Server Actions
- XSS protection
- CSRF protection

## PWA (Progressive Web App)

- **Manifest:** `/public/manifest.json`
- **Service Worker:** Generowany przez `@ducanh2912/next-pwa`
- **Icons:** `/public/icons/`
- **Instalacja:** Instrukcje na `/install`

## AI Features

### 1. Semantic Search (pgvector)
```sql
-- Przykład: search_posts_hybrid()
SELECT * FROM search_posts_hybrid(
  query_text := 'hydraulik warszawa',
  similarity_threshold := 0.7,
  semantic_weight := 0.6,
  fulltext_weight := 0.4
)
```

### 2. AI Navigator Bot (OpenAI GPT)
- Model: GPT-4o mini (konfigurowalny w panelu admina)
- Streaming responses
- Context-aware (historia konwersacji)
- Integracja z semantic search

### 3. Content Moderation (Hugging Face)
- Automatyczne sprawdzanie ogłoszeń
- Wykrywanie spam, obraźliwych treści
- Status: pending → approved/rejected

### 4. Synonym Generator (OpenAI GPT)
- Tryby: Trending, Popular, Custom
- Review & approve system
- Integracja z fulltext search

## Deployment

### Wymagania produkcyjne
- Node.js 20.9.0+
- PostgreSQL 15+ (Supabase)
- OpenAI API key
- Resend API key (email)

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
RESEND_API_KEY=
```

### Build
```bash
npm run build
npm run start
```

### Vercel Deployment
1. Push do GitHub
2. Import w Vercel
3. Dodaj env variables
4. Auto-deploy na każdy push

---

**Wersja:** 1.0.0
**Ostatnia aktualizacja:** 1.11.2025
**Next.js:** 16.0.1
