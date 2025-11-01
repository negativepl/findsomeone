# Podsumowanie compliance RODO - system wiadomości

## Co mamy (gotowe)

### 1. Infrastruktura techniczna
- Tabela `admin_message_access_logs` - przechowuje każdy dostęp admina
- Funkcja `log_admin_message_access()` - automatycznie loguje dostęp
- RLS (Row Level Security) - tylko nadawca i odbiorca widzą wiadomości
- Funkcja `get_reported_messages()` - tylko dla adminów, automatycznie loguje dostęp

### 2. System zgłaszania
- Przycisk "Zgłoś" w czacie (`/components/ReportMessageDialog.tsx`)
- Panel zgłoszeń dla adminów (`/app/admin/reports/page.tsx`)
- 5 kategorii zgłoszeń: spam, molestowanie, treść niestosowna, oszustwo, inne
- Akcje moderacyjne: odrzuć, ostrzeż, usuń wiadomość, zbanuj użytkownika

### 3. Panel audit logs
- Strona `/admin/audit-logs` - historia dostępów adminów
- Funkcja `get_admin_access_logs()` - pobiera logi dla panelu
- Funkcja `get_user_audit_logs(user_id)` - użytkownik może zobaczyć kto przeglądał jego wiadomości
- Funkcja `cleanup_old_audit_logs()` - usuwa logi starsze niż 2 lata
- Statystyki: liczba logów, uniqualni admini, dostępy ze zgłoszeń

### 4. Zarządzanie użytkownikami
- Banowanie użytkowników z powodem
- Odbanowywanie użytkowników (`/app/admin/banned-users/page.tsx`)
- Historia banów w tabeli `user_bans`
- Blokada dostępu dla zbanowanych (middleware)

### 5. Dokumentacja
- `PRIVACY_AND_MODERATION_GUIDELINES.md` - procedury dla zespołu
- `AUDIT_LOGS_SETUP.md` - instrukcja konfiguracji
- Komentarze w SQL opisujące funkcje
- Checklist compliance - co zrobione, co do zrobienia

## Co musisz zrobić (TODO)

### Krytyczne (przed produkcją)

1. **Uruchom SQL w Supabase**
   ```sql
   -- W Supabase SQL Editor:
   1. Uruchom: /supabase/add_audit_logs_function.sql
   2. Database → Extensions → Włącz pg_cron
   3. Zaplanuj cron job (patrz: AUDIT_LOGS_SETUP.md)
   ```

2. **Zaktualizuj Politykę Prywatności**

   Dodaj sekcję (w `/app/privacy/page.tsx`):

   ```markdown
   ## Wiadomości prywatne i moderacja

   Twoje wiadomości prywatne są chronione i nie są rutynowo przeglądane.
   Dostęp do wiadomości może nastąpić wyłącznie w przypadku:

   1. Zgłoszenia przez użytkownika (spam, molestowanie)
   2. Nakazu sądowego
   3. Podejrzenia działalności przestępczej

   Każdy dostęp administratora jest automatycznie logowany w systemie audytu.
   Logi są przechowywane przez 2 lata i automatycznie usuwane.

   Masz prawo zażądać informacji o dostępach do Twoich wiadomości.
   ```

3. **Dodaj email do kontaktu RODO**
   ```
   privacy@[twoja-domena].pl
   ```

   Ten email MUSI działać i być monitorowany!

### Ważne (w ciągu tygodnia)

4. **Przetestuj system**
   - [ ] Zgłoś testową wiadomość
   - [ ] Przeglądnij zgłoszenie jako admin
   - [ ] Sprawdź czy pojawił się log w `/admin/audit-logs`
   - [ ] Wywołaj manualnie `cleanup_old_audit_logs()`

5. **Wyznacz osoby odpowiedzialne**
   - [ ] Moderator (przeglądanie zgłoszeń)
   - [ ] RODO Officer (odpowiedzi na żądania użytkowników)

### Opcjonalne (ale zalecane)

6. **Dodaj 2FA dla adminów**
   - Supabase wspiera 2FA out of the box
   - Settings → Enable MFA

7. **Monitoring**
   - Ustaw alert jeśli liczba zgłoszeń > 10/dzień
   - Regularnie sprawdzaj audit logi (co miesiąc)

## Jak odpowiedzieć na żądanie RODO?

### Scenariusz 1: Użytkownik chce wiedzieć kto przeglądał jego wiadomości

1. Zweryfikuj tożsamość użytkownika
2. W Supabase SQL Editor:
   ```sql
   SELECT * FROM get_user_audit_logs('user-uuid');
   ```
3. Eksportuj do CSV
4. Wyślij na email użytkownika (w ciągu 30 dni)

### Scenariusz 2: Użytkownik chce usunąć swoje dane

1. Potwierdź tożsamość
2. W Supabase:
   ```sql
   -- Usuń audit logi
   DELETE FROM admin_message_access_logs
   WHERE message_id IN (
     SELECT id FROM messages
     WHERE sender_id = 'user-uuid' OR receiver_id = 'user-uuid'
   );

   -- Usuń wiadomości
   DELETE FROM messages
   WHERE sender_id = 'user-uuid' OR receiver_id = 'user-uuid';

   -- Usuń profil
   DELETE FROM profiles WHERE id = 'user-uuid';
   ```
3. Potwierdź usunięcie (w ciągu 30 dni)

## Monitoring compliance

### Co sprawdzać regularnie?

**Co miesiąc:**
- [ ] Liczba zgłoszeń vs poprzedni miesiąc
- [ ] Czas reakcji na zgłoszenia (powinno być < 48h)
- [ ] Liczba audit logów
- [ ] Czy cron job się wykonuje (`SELECT * FROM cron.job_run_details`)

**Co kwartał:**
- [ ] Review procedur moderacji
- [ ] Sprawdzenie czy email privacy@ działa
- [ ] Audit uprawnień adminów

**Co rok:**
- [ ] Pełny audit compliance RODO
- [ ] Update polityki prywatności jeśli zmieniły się przepisy
- [ ] Szkolenie zespołu z procedur

## FAQ

### Q: Czy mogę zobaczyć treść wiadomości w bazie danych?
**A:** Tak, ALE:
- Tylko jeśli masz biznesową potrzebę (zgłoszenie, nakaz sądowy)
- ZAWSZE musisz zalogować dostęp używając `log_admin_message_access()`
- Użytkownik ma prawo wiedzieć że to zrobiłeś

### Q: Jak długo trzymamy wiadomości?
**A:**
- Aktywne konta: bez limitu (dopóki użytkownik chce)
- Po usunięciu konta: 30 dni backup, potem trwałe usunięcie
- Audit logi: 2 lata, potem automatyczne usunięcie

### Q: Co jeśli dostanę nakaz sądowy?
**A:**
1. Skontaktuj się z prawnikiem
2. Sprawdź czy nakaz jest prawomocny
3. Zaloguj dostęp w systemie: `log_admin_message_access()`
4. Udostępnij tylko to co wymaga nakaz
5. Zachowaj dokumentację

### Q: Czy muszę informować użytkownika że przeglądałem jego wiadomości?
**A:** NIE musisz aktywnie informować, ALE:
- Użytkownik ma prawo zapytać (RODO)
- Wtedy musisz udostępnić audit logi
- Dlatego ZAWSZE loguj dostęp z prawdziwym powodem!

## Kontakt w razie wątpliwości

- **Techniczne:** Sprawdź `AUDIT_LOGS_SETUP.md`
- **Prawne/RODO:** Skonsultuj z prawnikiem specjalizującym się w RODO
- **Procedury:** Sprawdź `PRIVACY_AND_MODERATION_GUIDELINES.md`

---

**Status:** System gotowy do produkcji (po wykonaniu TODO)
**Data:** 2025-10-10
**Compliance:** RODO/GDPR ready
