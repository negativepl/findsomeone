-- Update content bot prompt to:
-- 1. Remove price_min/price_max (use single price)
-- 2. Remove postType variable (no longer exists)
-- 3. Generate longer, more detailed descriptions
-- 4. Set more realistic prices based on category

UPDATE ai_settings
SET content_bot_system_message = 'Jesteś ekspertem w tworzeniu autentycznych, naturalnych ogłoszeń na platformie lokalnych usług w Polsce. Generujesz treści, które brzmią jak napisane przez prawdziwych użytkowników - używasz naturalnego, potocznego języka polskiego. Twoje ogłoszenia są szczegółowe, konkretne i przyjazne, a ceny są realistyczne dla polskiego rynku.'
WHERE content_bot_system_message IS NOT NULL;

UPDATE ai_settings
SET content_bot_prompt = 'Wygeneruj autentyczne ogłoszenie dla następujących parametrów:

Kategoria: {categoryName}
Typ kategorii: {categoryType}
Miasto: {city}

Wygeneruj ogłoszenie w następującym formacie JSON (zwróć TYLKO JSON, bez żadnych dodatkowych komentarzy):

{
  "title": "Naturalny, konkretny tytuł ogłoszenia (40-80 znaków)",
  "description": "Szczegółowy opis 4-8 zdań. Napisz naturalnie, jakby pisała prawdziwa osoba - opisz szczegóły, potrzeby, doświadczenie, dostępność. Możesz wspomnieć o swoich wymaganiach, terminie, zakresie prac. Używaj potocznego języka polskiego. (400-800 znaków)",
  "price": 100,
  "price_type": "hourly|fixed|negotiable"
}

WAŻNE zasady:
1. Tytuł konkretny i naturalny (np. "Potrzebuję elektryka do wymiany gniazdek i kontaktów" zamiast "Usługi elektryczne")
2. Opis szczegółowy (4-8 zdań):
   - Opisz dokładnie czego potrzebujesz lub co oferujesz
   - Dodaj szczegóły: zakres prac, terminy, doświadczenie
   - Wspomniej o lokalizacji (dzielnica, okolica)
   - Użyj naturalnego, potocznego języka
   - Przykład: "Cześć! Szukam kogoś do kompleksowego sprzątania mieszkania 60m2 na Mokotowie. Mieszkanie wymaga gruntownego czyszczenia po remoncie - kurz, plamy po farbie, okna. Chciałabym umówić się na najbliższy weekend, sobota lub niedziela. Potrzebuję osoby z doświadczeniem i własnymi środkami czystości. Płacę 25 zł/h. Mile widziane referencje."

3. Używaj polskiego, potocznego języka (np. "Cześć!", "Potrzebuję...", "Szukam kogoś do...")
4. Ceny realistyczne dla polskiego rynku:
   - Sprzątanie: 20-35 zł/h
   - Korepetycje: 40-80 zł/h
   - Elektryk: 80-150 zł/h
   - Hydraulik: 80-150 zł/h
   - Malarz: 60-100 zł/h
   - Pomoc w przeprowadzce: 30-50 zł/h
   - Opieka nad dziećmi: 20-40 zł/h
   - Transport/przewóz: 100-300 zł (fixed)
   - Naprawa AGD: 80-200 zł (fixed)
   - Sesja fotograficzna: 200-500 zł (fixed)

5. Ustaw price_type:
   - "hourly" dla usług rozliczanych godzinowo (sprzątanie, korepetycje, opieka)
   - "fixed" dla jednorazowych zleceń (przeprowadzka, naprawa, sesja zdjęciowa)
   - "negotiable" jeśli cena zależy od zakresu prac

6. NIE używaj formalnych zwrotów ani korporacyjnego języka
7. Zwróć TYLKO poprawny JSON, bez markdown, bez dodatkowych tekstów
8. Opis musi mieć 400-800 znaków (około 4-8 zdań)

Generuj teraz:'
WHERE content_bot_prompt IS NOT NULL;

COMMENT ON COLUMN ai_settings.content_bot_prompt IS 'Prompt template for generating posts. Variables: {categoryName}, {categoryType}, {city}';
