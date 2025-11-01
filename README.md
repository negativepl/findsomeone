# FindSomeone

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**Nowoczesna platforma lokalnych ogłoszeń i usług**

[Live Demo](https://findsomeone.app) • [Dokumentacja](./docs/README.md) • [Struktura](./PROJECT_STRUCTURE.md)

</div>

---

## O projekcie

FindSomeone to aplikacja webowa umożliwiająca publikowanie i przeglądanie lokalnych ogłoszeń. Platforma pozwala na wystawianie różnorodnych ogłoszeń - sprzedaż aut, wynajem mieszkań, poszukiwanie pracy, wynajem urządzeń, oferowanie usług i wiele więcej. Projekt wyróżnia się zaawansowanymi funkcjami takimi jak: półauomatycznym sprawdzaniem ogłoszeń przed publikacją, inteligentnym botem Nawigatorkiem, botem Wypełniaczkiem i przepięknym UX / UI.

**Wersja live:** [findsomeone.app](https://findsomeone.app)

## Kluczowe funkcje

**Chatbot - Nawigatorek**
- Inteligentny chatbot, który pomaga znaleźć idealne ogłoszenie poprzez naturalną rozmowę
- Zadawaj pytania w języku polskim, a AI zrozumie Twoje potrzeby i znajdzie najlepsze dopasowania
- Kontekstowa rozmowa - bot pamięta całą historię konwersacji
- Integracja z wyszukiwaniem semantycznym dla precyzyjnych wyników
- Dostępny tylko dla zalogowanych użytkowników

**Komunikacja**
- Wiadomości w czasie rzeczywistym (Supabase Realtime)
- Wskaźniki obecności (online/offline)
- System zgłoszeń niewłaściwych treści
- Licznik nieprzeczytanych wiadomości

**Administracja**
- Panel moderacji ogłoszeń
- Zarządzanie kategoriami
- System banów użytkowników
- Logi audytowe wszystkich akcji admina
- Generator synonimów AI dla wyszukiwarki

**UX/UI**
- Responsywny design (mobile-first)
- Animacje Framer Motion
- Dock mobilny z gestami
- Dostępność (a11y)

## Stos technologiczny

**Frontend:**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lordicon

**Backend:**
- Supabase (PostgreSQL, Auth, Realtime, Storage)
- OpenAI (embeddings, GPT)
- Hugging Face
- pgvector
- Row Level Security (RLS)

**Dodatkowe:**
- Resend
- Zod
- React Hook Form

## Instalacja lokalna

### Wymagania
- Node.js 20.9.0+
- Konto Supabase (darmowy tier)
- OpenAI API key (opcjonalnie, dla AI)

### Quick Start

```bash
# 1. Sklonuj repozytorium
git clone https://github.com/negativepl/findsomeone.git
cd findsomeone

# 2. Zainstaluj zależności
npm install

# 3. Utwórz plik .env.local
cp .env.example .env.local
# Edytuj .env.local i dodaj swoje klucze

# 4. Uruchom serwer deweloperski
npm run dev
```

### Zmienne środowiskowe

```env
# Supabase (wymagane)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (opcjonalne, dla AI)
OPENAI_API_KEY=sk-your-key

# Resend (opcjonalne, dla emaili)
RESEND_API_KEY=re-your-key
```

### Baza danych

1. Utwórz projekt w [Supabase](https://supabase.com)
2. Wykonaj migracje z `supabase/migrations/`
3. Skonfiguruj dostawców uwierzytelniania w Dashboard

## Główne tabele

- **profiles** - Profile użytkowników
- **posts** - Ogłoszenia (z embeddingami wektorowymi)
- **categories** - Kategorie usług
- **messages** - Wiadomości prywatne
- **reviews** - Oceny i opinie
- **favorites** - Ulubione ogłoszenia
- **admin_audit_logs** - Logi akcji adminów

Wszystkie tabele chronione Row Level Security (RLS).

## Deployment

Projekt gotowy do wdrożenia na **Vercel**:

1. Push do GitHub
2. Import projektu w Vercel
3. Dodaj zmienne środowiskowe
4. Deploy!

## Statystyki

- **Linie kodu:** ~15,000+
- **Komponenty:** 45+
- **Strony:** 25+
- **Tabele w bazie:** 12
- **Technologie:** 15+

## Współpraca

Projekt jest otwarty na:

- **Zgłoszenia błędów** - [Otwórz Issue](https://github.com/negativepl/findsomeone/issues)
- **Sugestie funkcji** - Podziel się w Discussions
- **Pytania** - Zapytaj w Issues lub Discussions

## Autor

**Marcin Baszewski**
- GitHub: [@negativepl](https://github.com/negativepl)
- Projekt: Portfolio - Nowoczesna platforma lokalnych usług

## Podziękowania

- [Supabase](https://supabase.com) - Backend as a Service
- [Vercel](https://vercel.com) - Hosting
- [OpenAI](https://openai.com) - AI
- [shadcn/ui](https://ui.shadcn.com) - Komponenty UI
- [Next.js](https://nextjs.org) - Framework React

---

**Jeśli projekt Ci się podoba, zostaw gwiazdkę!**

**Pytania?** Otwórz issue lub dyskusję na GitHub.
