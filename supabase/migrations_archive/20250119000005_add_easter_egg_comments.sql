-- Add Easter Egg: Funny comments in bot-generated posts
-- Wypełniaczek sometimes adds cute self-aware comments

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

🤖 EASTER EGG - W 15% przypadków dodaj na końcu opisu subtelny, zabawny komentarz od bota:
- "PS: To ogłoszenie wygenerował bot, ale naprawdę się starałem! 🤖"
- "PPS: Jestem Wypełniaczek i pozdrawiam ciepło!"
- "Btw, to ja - Wypełniaczek. Miłego dnia! ✨"
- "Generated with love by Wypełniaczek 💚"
- "Psst... jestem AI, ale nie mów nikomu 🤫"
- "Wypełniaczek was here 👋"
- "Plot twist: napisał to robot 🎭"
- "Beep boop, ogłoszenie gotowe! 🤖"

Losowo wybierz czy dodać easter egg (15% szans) i który wariant.

Generuj teraz:'
WHERE id = '00000000-0000-0000-0000-000000000001';
