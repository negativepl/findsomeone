# Archiwum Supabase

Ten folder zawiera zarchiwizowane pliki Supabase, które nie są aktywnie używane, ale zostały zachowane dla celów historycznych i referencyjnych.

## Struktura

### 📁 `deprecated_functions/`
**Zawartość:** 10 starych plików SQL z opcjonalnymi/przestarzałymi funkcjami
**Powód archiwizacji:** Funkcje te były tworzone jako eksperymentalne lub opcjonalne rozszerzenia. Większość z nich została włączona do głównych migracji lub nie jest już używana.

**Pliki:**
- `add_audit_logs_function.sql` - Funkcja audit logów (włączona w główne migracje)
- `add_favorites.sql` - System ulubionych (opcjonalny)
- `add_roles.sql` - System ról (opcjonalny)
- `add_user_banning.sql` - System banowania użytkowników (włączony w główne migracje)
- `fix_realtime_rls.sql` - Poprawka RLS dla realtime (zastąpiona nowszą wersją)
- `fix_review_trigger.sql` - Poprawka triggera recenzji (zastąpiona)
- `increment_views.sql` - Licznik wyświetleń (opcjonalny)
- `message_reporting_system.sql` - System raportowania wiadomości (opcjonalny)
- `message_security.sql` - Bezpieczeństwo wiadomości (włączone w główne migracje)
- `presence_and_typing.sql` - Status obecności i pisania (opcjonalny)

**Czy można usunąć?** Nie zalecane - mogą być użyteczne jako referencja lub dla projektów rozwijanych z tego kodu.

---

### 📁 `duplicate_migrations/`
**Zawartość:** 99 plików SQL - dokładny duplikat folderu `/migrations/`
**Powód archiwizacji:** Jest to kopia zapasowa migracji, która była tworzona automatycznie. Wszystkie te pliki istnieją już w `/migrations/`.

**Pliki:** Wszystkie migracje od `20250110_add_user_preferences.sql` do `20251014000001_add_is_deleted_to_posts.sql` oraz dodatkowe pliki `create_ai_settings.sql` i `add_category_synonym_settings.sql`.

**Czy można usunąć?** Tak - to dokładny duplikat. Zachowane tylko jako dodatkowa kopia zapasowa.

**Rozmiar:** ~356 KB

---

### 📁 `old_scripts/`
**Zawartość:** Stare skrypty SQL, które były tworzone ad-hoc poza systemem migracji
**Powód archiwizacji:** Skrypty jednorazowe lub testowe, które nie są częścią głównego flow migracji.

**Pliki:**
- `disable-about-section.sql` - Skrypt do wyłączania sekcji "O nas"

**Czy można usunąć?** Nie zalecane - mogą być potrzebne do szybkich zmian w przyszłości.

---

## Aktywne foldery Supabase (poza archiwum)

- **`/migrations/`** - 99 aktywnych migracji (pełna historia zmian bazy danych)
- **`/migrations_consolidated/`** - 4 skonsolidowane migracje dla nowych instalacji (zalecane dla nowych projektów)
- **`/functions/`** - Edge Functions (Deno) i funkcje SQL
- **`/policies/`** - Polityki Row Level Security (RLS)

---

## Zalecenia

### Dla istniejących instalacji:
- Używaj migracji z `/migrations/` (pełna historia)
- Nie stosuj plików z archiwum bez dokładnego sprawdzenia

### Dla nowych instalacji:
- Używaj `/migrations_consolidated/` (czystsze, szybsze)
- Archiwum można zignorować

### Dla deweloperów:
- Przed użyciem czegokolwiek z archiwum, sprawdź czy nie jest już w głównych migracjach
- Archiwum służy tylko do referencji i awaryjnego przywracania

---

## Historia archiwizacji

**Data:** 2025-11-08
**Powód:** Porządkowanie struktury projektu Supabase
**Zarchiwizowane przez:** Claude (cleanup-supabase-migrations)

---

## Pytania?

Jeśli potrzebujesz przywrócić coś z archiwum lub masz pytania:
1. Sprawdź czy funkcjonalność nie istnieje już w `/migrations/` lub `/migrations_consolidated/`
2. Przeczytaj dokumentację w `/supabase/MIGRATIONS_README.md`
3. W razie wątpliwości - skonsultuj z zespołem przed stosowaniem archiwalnych plików
