# Semantic Search and Smart Suggestions - Configuration Guide

## What Has Been Implemented:

### 1. Database (PostgreSQL + pgvector)
- `embedding` column in `posts` table (vector 1536 dims)
- HNSW index for ultra-fast search
- SQL functions for semantic search and hybrid search
- `user_search_preferences` table for personalization
- Extended `search_queries` table with embeddings

### 2. API Endpoints
- `/api/search/semantic` - Semantic search with embeddings
- `/api/search/suggestions` - Smart AI-based suggestions
- Updated `/api/search` - Added smart suggestions for authenticated users

### 3. UI Components
- `LiveSearchBar` - Shows smart AI suggestions for authenticated users
- `EmbeddingsManager` - Admin panel for generating embeddings
- `/admin/embeddings` - Embeddings management page

### 4. Helper Functions
- `/lib/embeddings.ts` - Functions for generating and managing embeddings
- Batch processing for efficiency
- Cost estimation

---

## Setup (Step by Step):

### Step 1: Run Database Migrations

You need to execute SQL migrations in Supabase:

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Run these files in order:

```sql
-- 1. First: Add pgvector extension and embeddings
-- File: supabase/migrations/20250111120000_add_embeddings.sql
-- Copy entire contents and run in SQL Editor

-- 2. Then: Add user search history and preferences
-- File: supabase/migrations/20250111120001_user_search_history.sql
-- Copy entire contents and run in SQL Editor
```

**Or via CLI:**
```bash
supabase db push
```

### Step 2: Verify OpenAI API Key is Set

```bash
# Check .env.local
cat .env.local | grep OPENAI_API_KEY
```

Should contain:
```
OPENAI_API_KEY=sk-proj-your-key...
```

### Step 3: Generate Embeddings for Existing Posts

1. Go to admin panel: `http://localhost:3000/admin/embeddings`
2. Click **"Generate Post Embeddings"**
3. Wait for process to complete (for 100 posts: ~30-60 seconds)
4. System will process only posts without embeddings (max 100 at a time)

**Or via API:**
```bash
curl -X POST http://localhost:3000/api/search/semantic \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{}'
```

### Step 4: Test!

#### Test 1: Semantic Search
```bash
# Search for "water installer"
# Should also find posts with "plumber", "fitter", etc.
curl "http://localhost:3000/api/search/semantic?q=water%20installer&mode=hybrid"
```

#### Test 2: Smart Suggestions (requires authentication)
```bash
curl "http://localhost:3000/api/search/suggestions" \
  -H "Cookie: your-session-cookie"
```

#### Test 3: LiveSearchBar
1. Log in
2. Open dashboard
3. Click on search bar (DON'T type anything)
4. You should see **"For You (AI)"** section with personalized suggestions

---

## How Does It Work?

### Semantic Search

1. **User enters:** "water installer"
2. **System generates embedding** for query (vector of 1536 numbers)
3. **PostgreSQL compares** query embedding with post embeddings
4. **Hybrid ranking:**
   - 60% - Semantic similarity (cosine similarity)
   - 40% - Full-text search (trigrams + synonyms)
5. **Results:** Posts with "plumber", "installation fitter", "specialist" also appear!

### Smart Suggestions

System analyzes:
1. **Behavioral:**
   - User search history (last 90 days)
   - Most clicked categories
   - Favorite cities

2. **Semantic:**
   - Creates user "preference profile" (average of embeddings)
   - Finds posts similar to profile (similarity > 0.75)
   - Returns as suggestions

3. **Trending:**
   - Popular searches in user's favorite categories
   - From last 7 days

### Example:

**User often searches for:**
- "plumber Warsaw"
- "WC installer"
- "pipe repair"

**AI system suggests:**
- "radiator installation" (semantically similar)
- "central heating service" (same category)
- "plumber Krakow" (different city, same service)

---

## Monitoring and Analytics

### Check Embedding Coverage:

```sql
-- How many posts have embeddings?
SELECT
  COUNT(*) FILTER (WHERE embedding IS NOT NULL) as with_embeddings,
  COUNT(*) FILTER (WHERE embedding IS NULL) as without_embeddings,
  COUNT(*) as total,
  ROUND(COUNT(*) FILTER (WHERE embedding IS NOT NULL)::numeric / COUNT(*) * 100, 2) as coverage_percent
FROM posts
WHERE status = 'active';
```

### Test Semantic Search:

```sql
-- Find posts semantically similar to "plumber"
SELECT
  title,
  (1 - (embedding <=> '[0.1,0.2,...]'::vector)) as similarity
FROM posts
WHERE embedding IS NOT NULL
ORDER BY embedding <=> '[0.1,0.2,...]'::vector
LIMIT 10;
```

### Check User Preferences:

```sql
-- View user preferences
SELECT
  user_id,
  preferred_categories,
  preferred_cities,
  search_frequency,
  last_search_at
FROM user_search_preferences
ORDER BY search_frequency DESC
LIMIT 10;
```

---

## Costs

### OpenAI Embeddings (text-embedding-3-small)
- **Price:** $0.02 / 1M tokens
- **Example costs:**
  - 100 posts: ~$0.01-0.02
  - 1000 posts: ~$0.10-0.15
  - 10000 posts: ~$1.00-1.50

### Estimated Usage:
- Average post: ~100-200 tokens
- 1 search query: ~10-20 tokens
- **Monthly (1000 posts + 10k searches):**
  - Posts: $0.15
  - Queries: $0.20
  - **TOTAL: ~$0.35/month**

---

## Configuration (Optional)

### 1. Threshold for Semantic Search

In `/app/api/search/semantic/route.ts`:
```typescript
const threshold = parseFloat(searchParams.get('threshold') || '0.7')
// 0.7 = default (70% similarity)
// Lower = more results (less precise)
// Higher = fewer results (more precise)
```

### 2. Weights in Hybrid Search

In `supabase/migrations/20250111120000_add_embeddings.sql`:
```sql
-- Line ~110: Change weights
(
  case when p.embedding is not null
    then (1 - (p.embedding <=> query_embedding)) * 0.6  -- 60% semantic
    else 0
  end +
  (...) * 0.4  -- 40% full-text
)
```

### 3. Smart Suggestions Limit

In `/app/api/search/suggestions/route.ts`:
```typescript
const limit = parseInt(searchParams.get('limit') || '10')
```

---

## Troubleshooting

### **"extension vector does not exist"**
**Problem:** pgvector is not installed
**Solution:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### **"Failed to generate embedding"**
**Problem:** Invalid OpenAI API key
**Solution:**
1. Check `.env.local`
2. Verify key at https://platform.openai.com/api-keys
3. Restart dev server: `npm run dev`

### **"No smart suggestions"**
**Problem:** User has no search history
**Solution:**
- This is normal for new users
- Perform a few searches, then check again
- System needs at least 2-3 searches for personalization

### **"Embeddings generation slow"**
**Problem:** Many posts to process
**Solution:**
- System processes max 100 posts at a time
- For larger amounts: run multiple times
- Or increase batch size in code (line ~172 in route.ts)

---

## Future Extensions

Possible improvements:

1. **Auto-embedding trigger**
   - Automatic embedding generation when creating post
   - Webhook or database trigger

2. **Cached embeddings**
   - Cache embeddings for frequent queries
   - Redis or Supabase Edge Functions

3. **Multi-language embeddings**
   - Support for multiple languages
   - Different models for different languages

4. **A/B Testing**
   - Compare semantic vs full-text
   - Metrics: CTR, conversion, satisfaction

5. **Query expansion with GPT**
   - Expanding queries via GPT
   - "plumber" → "plumber installer fitter water-sewage installation specialist"

---

## Files Added/Modified

### New Files:
```
/supabase/migrations/20250111120000_add_embeddings.sql
/supabase/migrations/20250111120001_user_search_history.sql
/lib/embeddings.ts
/app/api/search/semantic/route.ts
/app/api/search/suggestions/route.ts
/components/admin/EmbeddingsManager.tsx
/app/admin/embeddings/page.tsx
/SEMANTIC_SEARCH_SETUP.md (this file)
```

### Modified Files:
```
/app/api/search/route.ts (added smart suggestions)
/components/LiveSearchBar.tsx (added AI suggestions section)
/app/admin/page.tsx (added embeddings link)
```

---

## Checklist

Before production launch:

- [ ] Database migrations executed
- [ ] pgvector extension enabled
- [ ] OpenAI API key configured
- [ ] Embeddings generated for all posts
- [ ] Semantic search tested (min. 10 queries)
- [ ] Smart suggestions tested for authenticated users
- [ ] Embedding monitoring configured
- [ ] Rate limiting for API (optional but recommended)
- [ ] Database backup before migration (IMPORTANT!)

---

## Ready!

System is now fully functional! Users will have:

- **Semantic search** - finds similar meanings
- **Smart suggestions** - personalized using AI
- **Ultra-fast** - thanks to HNSW index
- **Precise** - hybrid ranking (semantic + full-text)

**Questions?** Check `/admin/embeddings` in admin panel!
