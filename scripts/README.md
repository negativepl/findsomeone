# 🛠️ Scripts FindSomeone

Zbiór skryptów pomocniczych do zarządzania projektem.

## 📂 Struktura

```
scripts/
├── tests/              # Skrypty testowe
├── utils/              # Narzędzia diagnostyczne
└── *.ts/js            # Skrypty produkcyjne
```

## 🧪 Testy (tests/)

### Chatbot Testing
- **`test-chatbot-quick.js`** ⭐ - Szybki test 5 różnych zapytań do chatbota
- **`test-chatbot-comprehensive.js`** - Pełny test 15 zapytań (wymaga rate limit bypass)
- **`test-chatbot.js`** - Podstawowy test chatbota
- **`test-diverse-queries.js`** - Test różnorodnych zapytań

**Uruchomienie:**
```bash
node scripts/tests/test-chatbot-quick.js
```

## 🔧 Narzędzia (utils/)

### Diagnostyka AI
- **`check-ai-settings.js`** - Sprawdza konfigurację AI chatbota
- **`check-ai-prompt.js`** - Weryfikuje system prompt
- **`check-posts.js`** - Sprawdza status postów

**Uruchomienie:**
```bash
node scripts/utils/check-ai-settings.js
```

## 🗃️ Skrypty produkcyjne (root)

- `generate-site-embeddings.ts` - Generuje embeddingi
- `setup-site-embeddings.ts` - Konfiguruje embeddingi
- `change-ai-model.js` - Zmienia model AI
- `run-migration.js` - Uruchamia migracje

## 🚀 Quick Start

```bash
# Test chatbota
node scripts/tests/test-chatbot-quick.js

# Sprawdź konfigurację AI
node scripts/utils/check-ai-settings.js
```

Więcej info: [`docs/tests/`](../docs/tests/)
