# Email Templates - FindSomeone

Ten folder zawiera wszystkie szablony email używane przez platformę FindSomeone w integracji z Supabase Auth.

## 📋 Lista szablonów

| Szablon | Plik | Cel |
|---------|------|-----|
| **Potwierdzenie rejestracji** | `confirm-signup.html` | Wysyłany po rejestracji nowego użytkownika |
| **Resetowanie hasła** | `reset-password.html` | Wysyłany gdy użytkownik prosi o reset hasła |
| **Magic Link** | `magic-link.html` | Logowanie bez hasła |
| **Zmiana email** | `change-email.html` | Potwierdzenie zmiany adresu email |
| **Zaproszenie** | `invite-user.html` | Zaproszenie nowego użytkownika do platformy |
| **Reautentykacja** | `reauthentication.html` | Ponowne potwierdzenie tożsamości |

## 🚀 Jak wgrać szablony do Supabase

### 1. Zaloguj się do Supabase Dashboard
Przejdź do: https://supabase.com/dashboard

### 2. Wybierz swój projekt
Wybierz projekt: `muotqfczovjxckzucnhh`

### 3. Przejdź do Email Templates
**Authentication** → **Email Templates**

### 4. Wklej każdy szablon

Dla każdego typu email:

#### Reset Password (Resetowanie hasła)
- **Subject**: `Zresetuj swoje hasło - FindSomeone`
- **Body**: Skopiuj zawartość z `reset-password.html`

#### Confirm Signup (Potwierdzenie rejestracji)
- **Subject**: `Potwierdź swoje konto - FindSomeone`
- **Body**: Skopiuj zawartość z `confirm-signup.html`

#### Magic Link (Link magiczny)
- **Subject**: `Twój link do logowania - FindSomeone`
- **Body**: Skopiuj zawartość z `magic-link.html`

#### Change Email (Zmiana email)
- **Subject**: `Potwierdź zmianę adresu email - FindSomeone`
- **Body**: Skopiuj zawartość z `change-email.html`

#### Invite User (Zaproszenie)
- **Subject**: `Zaproszenie do FindSomeone`
- **Body**: Skopiuj zawartość z `invite-user.html`

#### Reauthentication (Reautentykacja)
- **Subject**: `Potwierdź swoją tożsamość - FindSomeone`
- **Body**: Skopiuj zawartość z `reauthentication.html`

### 5. Skonfiguruj URL Configuration

W **Authentication** → **URL Configuration** ustaw:

#### Site URL
```
https://findsomeone.app
```

#### Redirect URLs
Dodaj następujące URL (każdy w osobnej linii):
```
https://findsomeone.app/auth/callback
https://findsomeone.app/auth/reset-password
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
```

## 🔧 Zmienne dostępne w szablonach

Supabase udostępnia następujące zmienne do użycia w szablonach:

- `{{ .SiteURL }}` - URL główny aplikacji (np. https://findsomeone.app)
- `{{ .TokenHash }}` - Hash tokenu weryfikacyjnego
- `{{ .Token }}` - Token weryfikacyjny (niezhashowany)
- `{{ .Email }}` - Adres email użytkownika
- `{{ .RedirectTo }}` - URL przekierowania (jeśli podany)

## 📝 Struktura linków w szablonach

Wszystkie szablony używają teraz spójnej struktury linków:

### Reset Password
```html
{{ .SiteURL }}/auth/reset-password?token={{ .TokenHash }}&type=recovery
```

### Confirm Signup
```html
{{ .SiteURL }}/auth/callback?token={{ .TokenHash }}&type=signup
```

### Magic Link
```html
{{ .SiteURL }}/auth/callback?token={{ .TokenHash }}&type=magiclink
```

### Change Email
```html
{{ .SiteURL }}/auth/callback?token={{ .TokenHash }}&type=email_change
```

### Invite User
```html
{{ .SiteURL }}/auth/callback?token={{ .TokenHash }}&type=invite
```

### Reauthentication
```html
{{ .SiteURL }}/auth/callback?token={{ .TokenHash }}&type=reauthentication
```

## ✅ Weryfikacja konfiguracji

Po wgraniu szablonów, przetestuj:

1. **Rejestrację** - Załóż nowe konto
2. **Reset hasła** - Kliknij "Zapomniałeś hasła?"
3. **Zmianę email** - W ustawieniach konta zmień email

Upewnij się, że:
- ✅ Email przychodzi
- ✅ Link prowadzi do Twojej domeny (findsomeone.app)
- ✅ Po kliknięciu w link, akcja się wykonuje

## 🎨 Dostosowywanie szablonów

Szablony używają kolorów i stylu FindSomeone:
- Kolor główny: `#C44E35`
- Tło: `#FAF8F3`
- Czcionka: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`

Aby zmienić szablony:
1. Edytuj plik HTML lokalnie
2. Przetestuj w przeglądarce
3. Skopiuj zaktualizowaną zawartość do Supabase Dashboard

## ❗ Ważne uwagi

- **Nie używaj `{{ .ConfirmationURL }}`** - Ta zmienna generuje linki do Supabase API zamiast Twojej aplikacji
- **Zawsze używaj `{{ .SiteURL }}` + ścieżka** - To zapewnia przekierowanie do Twojej domeny
- **Testuj na produkcji** - Upewnij się, że Site URL w Supabase jest ustawiony na domenę produkcyjną

## 🔍 Troubleshooting

### Problem: Link prowadzi do supabase.co zamiast findsomeone.app
**Rozwiązanie**: Sprawdź czy używasz `{{ .SiteURL }}` zamiast `{{ .ConfirmationURL }}`

### Problem: Link wygasa lub nie działa
**Rozwiązanie**:
- Sprawdź czy token jest przekazywany jako `token={{ .TokenHash }}`
- Upewnij się, że type jest poprawny (recovery, signup, etc.)

### Problem: Po kliknięciu w link nic się nie dzieje
**Rozwiązanie**: Sprawdź czy route `/auth/callback` i `/auth/reset-password` poprawnie obsługują parametry `token` i `type`

## 📞 Wsparcie

W razie problemów sprawdź:
- Logi w Supabase Dashboard: **Authentication** → **Logs**
- Logi aplikacji: Console przeglądarki i terminala Next.js
