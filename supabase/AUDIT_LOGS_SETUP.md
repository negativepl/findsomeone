# Audit Logs - Setup i Konfiguracja

## 🎯 Co to jest?

Audit Logs to system śledzenia dostępów administratorów do wiadomości użytkowników. **Wymagane przez RODO** - użytkownicy mają prawo wiedzieć kto i kiedy miał dostęp do ich danych.

## 📋 Wymagania RODO

- ✅ Każdy dostęp admina do wiadomości musi być zalogowany
- ✅ Logi muszą być przechowywane przez **2 lata**
- ✅ Po 2 latach logi muszą być **automatycznie usuwane**
- ✅ Użytkownicy mogą zażądać informacji o dostępach do swoich danych

## 🚀 Instalacja (Krok po kroku)

### Krok 1: Uruchom podstawowy SQL
```sql
-- W Supabase SQL Editor, uruchom:
/supabase/add_audit_logs_function.sql
```

To utworzy:
- Funkcję `get_admin_access_logs()` - dla panelu admina
- Funkcję `get_user_audit_logs(user_id)` - dla użytkowników
- Funkcję `cleanup_old_audit_logs()` - czyszczenie starych logów

### Krok 2: Włącz pg_cron extension

1. Wejdź do Supabase Dashboard
2. Idź do: **Database → Extensions**
3. Znajdź **pg_cron** i kliknij **Enable**

### Krok 3: Zaplanuj automatyczne czyszczenie

W Supabase SQL Editor wykonaj:

```sql
-- Zaplanuj czyszczenie co niedzielę o 2:00 w nocy
SELECT cron.schedule(
  'cleanup-old-audit-logs',
  '0 2 * * 0',
  $$SELECT cleanup_old_audit_logs();$$
);
```

### Krok 4: Sprawdź czy działa

```sql
-- Zobacz zaplanowane zadania
SELECT * FROM cron.job;

-- Sprawdź historię wykonań
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

## 🧪 Testowanie

### Test 1: Manualnie wywołaj czyszczenie
```sql
SELECT * FROM cleanup_old_audit_logs();
```

Odpowiedź:
```
deleted_count | oldest_deleted
--------------+----------------
0             | null
```
(0 bo nie masz jeszcze logów starszych niż 2 lata)

### Test 2: Sprawdź obecne logi
```sql
SELECT
  COUNT(*) as total_logs,
  MIN(accessed_at) as oldest_log,
  MAX(accessed_at) as newest_log
FROM admin_message_access_logs;
```

### Test 3: Sprawdź czy admin może zobaczyć logi
```sql
-- Jako admin, wywołaj:
SELECT * FROM get_admin_access_logs(100, 0);
```

### Test 4: Sprawdź czy użytkownik może zobaczyć swoje logi
```sql
-- Jako użytkownik, wywołaj:
SELECT * FROM get_user_audit_logs('user-uuid-here');
```

## 📊 Monitoring

### Sprawdź ile logów masz
```sql
SELECT
  COUNT(*) as total_logs,
  COUNT(DISTINCT admin_id) as unique_admins,
  COUNT(CASE WHEN report_id IS NOT NULL THEN 1 END) as logs_from_reports
FROM admin_message_access_logs;
```

### Sprawdź najstarsze logi
```sql
SELECT
  accessed_at,
  AGE(NOW(), accessed_at) as age
FROM admin_message_access_logs
ORDER BY accessed_at ASC
LIMIT 5;
```

### Sprawdź logi blisko 2-letniej granicy
```sql
SELECT
  COUNT(*) as logs_near_expiry
FROM admin_message_access_logs
WHERE accessed_at < NOW() - INTERVAL '23 months';
```

## 🔧 Zarządzanie Cron Job

### Wyłącz automatyczne czyszczenie
```sql
SELECT cron.unschedule('cleanup-old-audit-logs');
```

### Zmień harmonogram (np. co miesiąc zamiast co tydzień)
```sql
-- Najpierw usuń stary
SELECT cron.unschedule('cleanup-old-audit-logs');

-- Potem dodaj nowy (1-go każdego miesiąca o 3:00)
SELECT cron.schedule(
  'cleanup-old-audit-logs',
  '0 3 1 * *',
  $$SELECT cleanup_old_audit_logs();$$
);
```

### Zobacz kiedy ostatnio się wykonał
```sql
SELECT
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
WHERE jobname = 'cleanup-old-audit-logs';
```

## ⚠️ WAŻNE - Compliance

### Co użytkownik może zażądać (RODO)?

Użytkownik może złożyć wniosek o:
1. **Prawo dostępu** - "Kto przeglądał moje wiadomości?"
   - Odpowiedź: Wywołaj `get_user_audit_logs(user_id)` i wyślij CSV

2. **Prawo do usunięcia** - "Usuńcie moje dane"
   - Musisz usunąć:
     - Profil użytkownika
     - Wiadomości (jako nadawca/odbiorca)
     - Audit logi (jako admin lub jako uczestnik wiadomości)

### Przykładowa odpowiedź na wniosek RODO:

```sql
-- 1. Wygeneruj raport dla użytkownika
SELECT
  al.accessed_at as "Data dostępu",
  pa.full_name as "Administrator",
  al.reason as "Powód dostępu",
  CASE
    WHEN al.report_id IS NOT NULL THEN 'Zgłoszenie użytkownika'
    ELSE 'Inny'
  END as "Typ dostępu"
FROM admin_message_access_logs al
JOIN profiles pa ON pa.id = al.admin_id
JOIN messages m ON m.id = al.message_id
WHERE m.sender_id = 'user-uuid' OR m.receiver_id = 'user-uuid'
ORDER BY al.accessed_at DESC;

-- 2. Eksportuj do CSV i wyślij użytkownikowi
```

## 🔐 Bezpieczeństwo

### Kto ma dostęp do funkcji?

- `get_admin_access_logs()` - tylko **admini** (sprawdzane w funkcji)
- `get_user_audit_logs()` - użytkownik widzi **tylko swoje**, admini wszystkie
- `cleanup_old_audit_logs()` - tylko **postgres** (grant do postgres)

### Jak działa logowanie?

Każde wywołanie `get_reported_messages()` lub dostęp do wiadomości przez admina **automatycznie** wywołuje:

```sql
SELECT log_admin_message_access(
  admin_id,
  message_id,
  report_id,
  'Powód dostępu'
);
```

To jest wbudowane w kod aplikacji (`lib/actions/admin-reports.ts`).

## 📝 Checklist Setup

- [ ] Uruchomiony SQL: `add_audit_logs_function.sql`
- [ ] Włączone pg_cron extension w Supabase
- [ ] Zaplanowane cron job (co niedzielę o 2:00)
- [ ] Przetestowane ręczne wywołanie `cleanup_old_audit_logs()`
- [ ] Sprawdzone czy admin widzi audit logi w panelu `/admin/audit-logs`
- [ ] Dodane do polityki prywatności: "Logi dostępu przechowywane 2 lata"
- [ ] Wyznaczona osoba odpowiedzialna za RODO zapytania

## 🆘 Troubleshooting

### Cron job się nie wykonuje?

```sql
-- Sprawdź błędy
SELECT * FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC;
```

### Funkcja zwraca error "Access denied"?

Sprawdź czy użytkownik ma rolę admin:
```sql
SELECT id, full_name, role
FROM profiles
WHERE id = auth.uid();
```

### Logi nie są usuwane?

```sql
-- Sprawdź czy są logi starsze niż 2 lata
SELECT COUNT(*)
FROM admin_message_access_logs
WHERE accessed_at < NOW() - INTERVAL '2 years';
```

---

**Data utworzenia:** 2025-10-10
**Ostatnia aktualizacja:** 2025-10-10
**Zgodność z:** RODO (GDPR), Polityka Prywatności FindSomeone
