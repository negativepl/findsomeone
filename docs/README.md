# Dokumentacja FindSomeone

Witaj w dokumentacji projektu FindSomeone - polskiej platformy ogłoszeń lokalnych.

## Struktura dokumentacji

### Meta
- [`ORGANIZATION_SUMMARY.md`](./ORGANIZATION_SUMMARY.md) - Jak zorganizowano projekt (pełne podsumowanie)

### Architektura
- [`PROJECT_STRUCTURE.md`](../PROJECT_STRUCTURE.md) - Szczegółowa struktura projektu i organizacja kodu

### Testy i analizy
- [`tests/TEST_CHATBOT_ANALYSIS.md`](./tests/TEST_CHATBOT_ANALYSIS.md) - Kompleksowa analiza AI chatbota Nawigatorka

### AI i wyszukiwanie
- [`ai/`](./ai/) - Dokumentacja funkcji AI i wyszukiwania semantycznego
  - Semantic Search (pgvector + OpenAI embeddings)
  - AI Navigator - chatbot Nawigatorek
  - Hugging Face - moderacja treści

### Zgodność prawna
- [`compliance/`](./compliance/) - Zgodność prawna i moderacja treści

### Konfiguracja
- [`setup/`](./setup/) - Przewodniki konfiguracji

## Quick links

### Dla deweloperów
- [README.md](../README.md) - Główny README projektu
- [Struktura projektu](../PROJECT_STRUCTURE.md) - Pełna struktura katalogów i tabel
- [LICENSE](../LICENSE) - Licencja projektu (MIT z klauzulą niekomercyjną)

### Najnowsze testy
- [Analiza chatbota Nawigatorka](./tests/TEST_CHATBOT_ANALYSIS.md) - Zacznij tutaj

## Konwencje

### Nazewnictwo plików
- `PROJECT_*` - Dokumentacja architektury i struktury
- `TEST_*` - Raporty testów i analizy
- `*_ANALYSIS` - Szczegółowe analizy funkcjonalności

### Status dokumentów
- Aktualny - Najnowsza wersja dokumentu
- Archiwalny - Zachowany jako referencja historyczna

## Technologie

Projekt wykorzystuje:
- **Next.js 16** - App Router, Server Components
- **Supabase** - PostgreSQL, Auth, Realtime, Storage
- **OpenAI** - GPT (chatbot), text-embedding-3-small (semantic search)
- **Hugging Face** - Moderacja treści
- **pgvector** - Wyszukiwanie wektorowe
- **Lordicon** - Animowane ikony
- **Framer Motion** - Animacje UI

## Ostatnia aktualizacja

**Data:** 2025-11-01
**Zmiany:** Aktualizacja do Next.js 16, reorganizacja struktury, przepisanie dokumentacji
