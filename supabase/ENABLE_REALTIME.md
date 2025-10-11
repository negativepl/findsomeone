# Włączanie Realtime w Supabase

Jeśli wiadomości nie przychodzą w czasie rzeczywistym, musisz włączyć Realtime dla tabeli `messages`.

## Krok 1: Przejdź do Supabase Dashboard

1. Otwórz https://supabase.com/dashboard
2. Wybierz swój projekt
3. Przejdź do **Database** → **Replication**

## Krok 2: Włącz Realtime dla tabeli messages

1. Znajdź tabelę `messages` na liście
2. W kolumnie "Realtime" **włącz** przełącznik (toggle)
3. Upewnij się, że jest zaznaczone:
   - ✅ Insert
   - ✅ Update
   - ✅ Delete (opcjonalnie)

## Krok 3: Opcjonalnie - włącz też dla user_presence

Jeśli chcesz aby status online/offline działał realtime:
1. Znajdź tabelę `user_presence`
2. Włącz Realtime dla niej również

## Alternatywnie - przez SQL

Możesz też wykonać to przez SQL Editor:

```sql
-- Enable realtime for messages table
alter publication supabase_realtime add table messages;

-- Enable realtime for user_presence table
alter publication supabase_realtime add table user_presence;
```

## Testowanie

Po włączeniu:
1. Odśwież obie karty czatu (F5)
2. Wyślij wiadomość z jednego konta
3. Powinna pojawić się natychmiast na drugim koncie bez odświeżania!

## Debug

Jeśli nadal nie działa, sprawdź w konsoli przeglądarki (F12):
- Szukaj błędów związanych z "realtime" lub "channel"
- Sprawdź czy widzisz "SUBSCRIBED" w logach
