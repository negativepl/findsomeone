# Wytyczne dotyczące prywatności wiadomości i moderacji

## 1. Polityka dostępu do wiadomości prywatnych

### Zasada ogólna
**Wiadomości prywatne użytkowników są chronione i nie są rutynowo przeglądane przez administratorów.**

### Wyjątki - kiedy możemy przejrzeć wiadomości:

1. **Zgłoszenie przez użytkownika**
   - Użytkownik zgłosił wiadomość jako spam, molestowanie lub treść niestosowną
   - Dostęp tylko do zgłoszonej wiadomości
   - Każdy dostęp jest logowany w systemie

2. **Nakaz sądowy**
   - Na podstawie prawomocnego nakazu sądowego
   - Dokumentacja prawna przechowywana

3. **Podejrzenie naruszenia prawa**
   - Podejrzenie działalności przestępczej (oszustwa, handel nielegalnymi towarami)
   - Tylko po konsultacji prawnej

### NIGDY nie przeglądamy wiadomości:
- ❌ Z ciekawości
- ❌ Do celów marketingowych
- ❌ Do analiz użytkowników (bez anonimizacji)
- ❌ Na żądanie osób trzecich (bez nakazu)

## 2. System zgłaszania wiadomości

### Dla użytkowników:
- Każdy użytkownik może zgłosić niestosowną wiadomość
- Kategorie zgłoszeń:
  - Spam
  - Molestowanie
  - Treść niestosowna
  - Oszustwo
  - Inne

### Dla administratorów:
- Dostęp tylko do zgłoszonych wiadomości
- Obowiązek udokumentowania przyczyny dostępu
- Automatyczne logowanie w systemie audit trail

## 3. Przechowywanie danych

### Czas przechowywania:
- **Wiadomości aktywne**: Przez czas korzystania z platformy
- **Wiadomości po usunięciu konta**: 30 dni (backup), potem trwałe usunięcie
- **Logi dostępu adminów**: 2 lata (wymóg RODO)
- **Zgłoszenia**: 2 lata od rozstrzygnięcia

### Prawa użytkowników (RODO):
- ✅ Prawo dostępu do swoich danych
- ✅ Prawo do usunięcia danych (prawo do bycia zapomnianym)
- ✅ Prawo do przenoszenia danych
- ✅ Prawo do sprzeciwu wobec przetwarzania

## 4. Zabezpieczenia techniczne

### Obecne zabezpieczenia:
- ✅ Row Level Security (RLS) - tylko nadawca i odbiorca widzą wiadomości
- ✅ Szyfrowanie podczas transmisji (HTTPS)
- ✅ Rate limiting (anty-spam)
- ✅ Walidacja treści
- ✅ Audit logs dla dostępu adminów

### Rekomendowane dodatkowe zabezpieczenia:
- 🔄 End-to-end encryption (opcjonalnie dla bardzo wrażliwych wiadomości)
- 🔄 Automatyczne usuwanie starych wiadomości (np. po 2 latach)
- 🔄 2FA dla kont administratorów
- 🔄 Monitoring nietypowej aktywności

## 5. Procedury dla zespołu

### Procedura moderacji zgłoszenia:

1. **Otrzymanie zgłoszenia**
   - System automatycznie tworzy ticket
   - Powiadomienie dla zespołu moderacji

2. **Weryfikacja zgłoszenia**
   - Sprawdzenie historii użytkownika (czy to pierwsze zgłoszenie)
   - Ocena poważności zgłoszenia

3. **Przegląd wiadomości**
   - Dostęp TYLKO do zgłoszonej wiadomości
   - Logowanie dostępu w systemie audit
   - Udokumentowanie przyczyny przeglądu

4. **Decyzja**
   - Zgłoszenie zasadne: ostrzeżenie/ban użytkownika
   - Zgłoszenie niezasadne: odrzucenie, ewentualne ostrzeżenie dla zgłaszającego
   - Aktualizacja statusu zgłoszenia

5. **Dokumentacja**
   - Zapisanie decyzji i uzasadnienia
   - Powiadomienie zaangażowanych stron (jeśli wymagane)

### Procedura dostępu do wiadomości (dla adminów):

```sql
-- ZAWSZE używaj funkcji logującej dostęp:
SELECT log_admin_message_access(
  current_user_id,  -- ID admina
  message_id,       -- ID wiadomości
  report_id,        -- ID zgłoszenia (jeśli dotyczy)
  'Przegląd zgłoszenia #123 - podejrzenie oszustwa' -- Powód
);

-- Następnie dopiero przejrzyj wiadomość
```

## 6. Co musicie zaktualizować w dokumentach

### A) Polityka Prywatności - dodać sekcję:

**"Wiadomości prywatne i moderacja"**

```
Twoje wiadomości prywatne są chronione i szyfrowane. Nie przeglądamy ich
rutynowo. Dostęp do wiadomości może nastąpić wyłącznie w przypadku:

1. Zgłoszenia przez użytkownika (spam, molestowanie)
2. Nakazu sądowego
3. Podejrzenia działalności przestępczej

Każdy dostęp administratora do wiadomości jest automatycznie logowany
w systemie audytu. Masz prawo zażądać informacji o dostępach do Twoich danych.
```

### B) Regulamin - dodać punkt:

**"Zgłaszanie niewłaściwych treści"**

```
Użytkownicy mogą zgłaszać niewłaściwe wiadomości za pomocą przycisku
"Zgłoś" w oknie czatu. Zgłoszenia są weryfikowane przez zespół moderacji
w ciągu 24-48 godzin. Fałszywe zgłoszenia mogą skutkować ostrzeżeniem
lub zawieszeniem konta.
```

### C) Dostęp w bazie danych

**NIE logujcie się bezpośrednio do bazy jako postgres/admin!**

Zamiast tego:
1. Zbudujcie panel administracyjny w aplikacji
2. Używajcie funkcji `get_reported_messages()`
3. System automatycznie zaloguje dostęp

## 7. Checklist compliance

### Podstawowa infrastruktura
- [x] Uruchomić SQL z systemem zgłaszania (`message_reporting_system.sql`)
- [x] Zbudować panel administracyjny do przeglądania zgłoszeń
- [x] Dodać przycisk "Zgłoś" w oknie czatu
- [x] Zbudować panel Audit Logs (`/admin/audit-logs`)
- [x] Dodać funkcję automatycznego czyszczenia logów (`cleanup_old_audit_logs()`)

### Audit Logs i RODO
- [ ] Uruchomić SQL: `add_audit_logs_function.sql` w Supabase
- [ ] Włączyć pg_cron extension w Supabase Dashboard
- [ ] Zaplanować cron job do czyszczenia logów (patrz: `AUDIT_LOGS_SETUP.md`)
- [ ] Przetestować czy logi się tworzą przy przeglądaniu zgłoszeń
- [ ] Przetestować funkcję `get_user_audit_logs()` dla użytkowników

### Dokumentacja prawna
- [ ] Zaktualizować Politykę Prywatności (dodać sekcję o audit logs)
- [ ] Zaktualizować Regulamin (dodać punkt o zgłaszaniu)
- [ ] Dodać email privacy@[domena].pl dla żądań RODO

### Procedury operacyjne
- [ ] Przeszkolić zespół z procedur moderacji
- [ ] Zapisać procedury w wewnętrznej dokumentacji
- [ ] Wyznaczyć osobę odpowiedzialną za moderację
- [ ] Wyznaczyć osobę odpowiedzialną za żądania RODO
- [ ] Regularnie przeglądać audit logi (co miesiąc)

### Opcjonalne ale zalecane
- [ ] Skonfigurować powiadomienia email dla zgłoszeń
- [ ] Dodać 2FA dla kont administratorów
- [ ] Skonfigurować monitoring nietypowej aktywności
- [ ] Rozważyć E2E encryption dla wrażliwych wiadomości

## 8. Kary za nieprawidłowy dostęp

**Ważne dla zespołu:**
- Nieautoryzowany dostęp do wiadomości = naruszenie RODO
- Kary RODO: do 20 mln EUR lub 4% obrotu rocznego
- Możliwa odpowiedzialność karna
- Utrata zaufania użytkowników

## 9. Kontakt dla zapytań prawnych

Wyznaczcie osobę odpowiedzialną za:
- Odpowiedzi na żądania RODO (prawo dostępu, usunięcia)
- Kontakt z organami ścigania (nakazy sądowe)
- Zarządzanie incydentami bezpieczeństwa

Email: privacy@[wasza-domena].pl (MUSI być dostępny!)

---

**Data ostatniej aktualizacji:** [DATA]
**Wersja:** 1.0
