-- Add SEO description generation settings to ai_settings table

ALTER TABLE ai_settings
ADD COLUMN IF NOT EXISTS category_seo_prompt TEXT,
ADD COLUMN IF NOT EXISTS category_seo_system_message TEXT,
ADD COLUMN IF NOT EXISTS category_seo_model TEXT DEFAULT 'gpt-5-nano',
ADD COLUMN IF NOT EXISTS category_seo_max_length INTEGER DEFAULT 160,
ADD COLUMN IF NOT EXISTS category_seo_min_length INTEGER DEFAULT 120;

-- Set default prompt for SEO descriptions
UPDATE ai_settings
SET category_seo_prompt = 'Jesteś ekspertem SEO i copywriterem specjalizującym się w lokalnych ogłoszeniach usługowych.

Twoim zadaniem jest wygenerowanie krótkiego, SEO-friendly opisu dla następującej kategorii/podkategorii:

Nazwa kategorii: {categoryName}
Typ: {categoryType}
Kontekst: Lokalna platforma ogłoszeniowa w stylu OLX, skupiona na usługach i wynajmie

Wygeneruj krótki opis (120-160 znaków) który:
1. Jest naturalny i przyjazny dla użytkownika
2. Zawiera słowa kluczowe związane z kategorią
3. Zachęca do przeglądania ogłoszeń
4. Jest w języku polskim
5. NIE zawiera nazwy kategorii na początku (użytkownik już ją widzi)
6. Skupia się na korzyściach i możliwościach

Zwróć TYLKO sam opis, bez żadnych dodatkowych komentarzy czy formatowania.

Przykłady DOBRYCH opisów:
- "Znajdź profesjonalistów w Twojej okolicy. Sprawdzone opinie, konkurencyjne ceny."
- "Przeglądaj oferty od lokalnych specjalistów. Szybki kontakt, bezpieczne transakcje."
- "Wypożycz sprzęt od sąsiadów. Tańsze niż w wypożyczalni, bliżej niż myślisz."

Generuj teraz opis dla podanej kategorii.'
WHERE category_seo_prompt IS NULL;

UPDATE ai_settings
SET category_seo_system_message = 'Jesteś ekspertem SEO. Zwracasz TYLKO czysty tekst opisu bez dodatkowych komentarzy, cudzysłowów czy formatowania markdown. Opis musi mieć 120-160 znaków.'
WHERE category_seo_system_message IS NULL;
