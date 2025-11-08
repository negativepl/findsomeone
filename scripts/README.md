# FindSomeone Scripts

Collection of utility scripts for project management and testing.

## Directory Structure

```
scripts/
├── tests/              # Test scripts
├── utils/              # Diagnostic utilities
└── *.ts/js            # Production scripts
```

## Test Scripts (tests/)

### Chatbot Testing
- **`test-chatbot-quick.js`** - Quick test with 5 different chatbot queries (recommended)
- **`test-chatbot-comprehensive.js`** - Full test with 15 queries (requires rate limit bypass)
- **`test-chatbot.js`** - Basic chatbot test
- **`test-diverse-queries.js`** - Test with diverse query types

**Usage:**
```bash
node scripts/tests/test-chatbot-quick.js
```

## Diagnostic Utilities (utils/)

### AI Diagnostics
- **`check-ai-settings.js`** - Checks AI chatbot configuration
- **`check-ai-prompt.js`** - Verifies system prompt
- **`check-posts.js`** - Checks posts status

**Usage:**
```bash
node scripts/utils/check-ai-settings.js
```

## Production Scripts (root)

- `generate-site-embeddings.ts` - Generates embeddings for posts
- `setup-site-embeddings.ts` - Sets up embeddings configuration
- `change-ai-model.js` - Changes AI model
- `run-migration.js` - Runs database migrations

## Quick Start

```bash
# Test chatbot
node scripts/tests/test-chatbot-quick.js

# Check AI configuration
node scripts/utils/check-ai-settings.js
```

For more information, see [`docs/tests/`](../docs/tests/)
