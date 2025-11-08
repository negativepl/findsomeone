-- Add content bot settings to ai_settings table

ALTER TABLE ai_settings
ADD COLUMN IF NOT EXISTS content_bot_system_message TEXT,
ADD COLUMN IF NOT EXISTS content_bot_prompt TEXT,
ADD COLUMN IF NOT EXISTS content_bot_model TEXT DEFAULT 'gpt-5-nano',
ADD COLUMN IF NOT EXISTS content_bot_posts_per_category INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS content_bot_offering_ratio NUMERIC(3,2) DEFAULT 0.50;

-- Set default system message for content bot
UPDATE ai_settings
SET content_bot_system_message = 'Jesteś ekspertem w tworzeniu autentycznych, naturalnych ogłoszeń na platformie lokalnych usług. Generujesz treści, które brzmią jak napisane przez prawdziwych użytkowników - nie używasz formalnego ani korporacyjnego języka. Twoje ogłoszenia są krótkie, konkretne i przyjazne.'
WHERE content_bot_system_message IS NULL;

-- Set default prompt template for content bot
-- Variables: {categoryName}, {categoryType}, {postType}, {city}
UPDATE ai_settings
SET content_bot_prompt = 'Wygeneruj autentyczne ogłoszenie dla następujących parametrów:

Kategoria: {categoryName}
Typ kategorii: {categoryType}
Typ ogłoszenia: {postType}
Miasto: {city}

Wygeneruj ogłoszenie w następującym formacie JSON (zwróć TYLKO JSON, bez żadnych dodatkowych komentarzy):

{
  "title": "Krótki, naturalny tytuł ogłoszenia (30-60 znaków)",
  "description": "Opis 2-3 zdania, konkretny i naturalny. Bez zbędnych ozdobników, jak pisałby prawdziwy użytkownik (150-300 znaków)",
  "price_min": 50,
  "price_max": 150,
  "price_type": "hourly|fixed|negotiable"
}

WAŻNE zasady:
1. Tytuł powinien być konkretny i naturalny (np. "Szukam kogoś do przeglądu instalacji elektrycznej" zamiast "Profesjonalne usługi elektryczne")
2. Opis krótki, bez ozdobników (np. "Potrzebuję sprawdzić instalację w mieszkaniu, kilka kontaktów się obluzowało. Mieszkam na Bemowie." zamiast długich opisów)
3. Używaj polskiego, potocznego języka
4. Ceny realistyczne dla danej kategorii (research typical prices)
5. NIE używaj formalnych zwrotów ani korporacyjnego języka
6. Dla "seeking" pisz z perspektywy osoby szukającej, dla "offering" z perspektywy oferującego
7. Zwróć TYLKO poprawny JSON, bez markdown, bez dodatkowych tekstów

Generuj teraz:'
WHERE content_bot_prompt IS NULL;

COMMENT ON COLUMN ai_settings.content_bot_system_message IS 'System message for GPT when generating post content';
COMMENT ON COLUMN ai_settings.content_bot_prompt IS 'Prompt template for generating posts. Variables: {categoryName}, {categoryType}, {postType}, {city}';
COMMENT ON COLUMN ai_settings.content_bot_model IS 'OpenAI model to use for content generation (default: gpt-5-nano)';
COMMENT ON COLUMN ai_settings.content_bot_posts_per_category IS 'Number of posts to generate per category (default: 3)';
COMMENT ON COLUMN ai_settings.content_bot_offering_ratio IS 'Ratio of offering posts (0.5 = 50% offering, 50% seeking)';
