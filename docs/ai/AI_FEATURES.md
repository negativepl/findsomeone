# AI Features Documentation

## AI Synonym Generator

Automatic synonym generation system for the search engine using OpenAI GPT.

### Features

1. **Auto-generate synonyms** - AI analyzes terms and generates contextual synonyms
2. **3 operating modes:**
   - **Trending (7 days)** - Analyzes most popular searches from the last 7 days
   - **Popular (30 days)** - Analyzes most popular searches from the last 30 days
   - **Custom term** - Allows entering any term for analysis

3. **Review & Approve System** - AI proposes, admin chooses what to approve
4. **Batch Processing** - Ability to approve multiple synonyms at once
5. **Intelligent context** - AI understands language nuances and local terminology

### How to Use

1. **Go to admin panel:** `/admin/synonyms`
2. **Select generation mode:**
   - Trending - Best for current needs
   - Popular - Broader range of terms
   - Custom term - For specific cases
3. **Click "Generate AI Synonyms"**
4. **Review AI suggestions:**
   - Each suggestion contains:
     - Main term
     - List of synonyms (3-6 items)
     - Context and explanation
5. **Select desired suggestions** (or "Select all")
6. **Click "Apply selected"**

### Configuration

#### Requirements:
- OpenAI API key

#### Setup:
1. Add to `.env.local`:
```bash
OPENAI_API_KEY=sk-proj-...
```

2. Get your key from: https://platform.openai.com/api-keys

### Costs

OpenAI pricing varies by model. Typical costs for synonym generation:
- 10 terms: ~$0.01 - $0.02
- 100 terms: ~$0.10 - $0.15

Actual costs depend on the model used and can be configured in the admin panel.

### API Endpoints

#### POST `/api/admin/synonyms/generate`
Generates AI synonyms for selected terms.

**Request:**
```json
{
  "mode": "trending" | "popular" | "custom",
  "customTerm": "optional-term-for-custom-mode"
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "term": "plumber",
      "synonyms": ["installer", "pipe fitter", "plumbing specialist"],
      "context": "Person who works with water, drainage, and heating installations"
    }
  ],
  "tokensUsed": 450,
  "model": "gpt-4o-mini"
}
```

#### PUT `/api/admin/synonyms/generate`
Approves and saves selected synonyms to the database.

**Request:**
```json
{
  "suggestions": [
    {
      "term": "plumber",
      "synonyms": ["installer", "pipe fitter"],
      "context": "..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "inserted": 2,
  "synonyms": [...]
}
```

### UI Components

**AI Generator Panel** (`/components/admin/SynonymsManager.tsx`):
- Mode switches (Trending/Popular/Custom)
- Generate button with loading state
- AI suggestions panel
- Checkboxes for synonym selection
- Batch actions (select all, apply selected)

### Future AI Features

Planned extensions:
1. **Query Expansion** - Automatic query expansion
2. **Semantic Search** - Enhanced semantic search capabilities
3. **Query Rewriting** - Error correction and phrase optimization
4. **Category Prediction** - Automatic category matching
5. **Intent Recognition** - User intent detection

### Troubleshooting

**Problem:** Error "Failed to generate synonyms"
- **Solution:** Check if `OPENAI_API_KEY` is correctly set in `.env.local`

**Problem:** No suggestions returned
- **Solution:** All terms already have synonyms or no trending searches in database

**Problem:** JSON parsing error
- **Solution:** Model occasionally returns invalid format - refresh and try again

### Technical Notes

- Model: Configurable in admin panel (default: GPT-4o mini)
- Temperature: `0.7` (balance of creativity and precision)
- Response format: `json_object` (structured output)
- Timeout: 30s (can be increased for larger batches)

### Security

- Endpoint requires **admin** privileges
- User verification through Supabase Auth
- Rate limiting recommended for production
- API key only in server-side components (not in browser)

## AI Content Moderation

Automatic content moderation using Hugging Face API for detecting spam and inappropriate content.

See [Content Moderation Guide](../compliance/PRIVACY_AND_MODERATION_GUIDELINES.md) for details.

## Semantic Search

Vector-based search using OpenAI embeddings and pgvector.

See [Semantic Search Setup](./SEMANTIC_SEARCH_SETUP.md) for implementation details.

## AI Navigator Chatbot

Intelligent assistant helping users find listings through natural conversation.

Configuration available in admin panel at `/admin/chat-assistant`.
