# Database Migrations

## Quick Start for New Installations

If you're setting up FindSomeone for the first time, use the **consolidated migrations** for a clean, fast setup:

```bash
# Navigate to consolidated migrations
cd supabase/migrations_consolidated

# Apply migrations in order
psql $DATABASE_URL -f 01_core_schema.sql
psql $DATABASE_URL -f 02_ai_features.sql
psql $DATABASE_URL -f 03_admin_features.sql
psql $DATABASE_URL -f 04_reference_data.sql
```

Or via Supabase CLI:
```bash
supabase db push --db-url $DATABASE_URL --migrations-dir supabase/migrations_consolidated
```

**Total time: ~30 seconds** vs ~5 minutes with original 99 files

## Directory Structure

```
supabase/
├── migrations/                    # Original 99 migration files (for existing databases)
├── migrations_archive/            # Backup of original migrations
├── migrations_consolidated/       # NEW: 4 consolidated files (for new installations)
│   ├── 01_core_schema.sql        # Core tables and structure
│   ├── 02_ai_features.sql        # AI & semantic search
│   ├── 03_admin_features.sql     # Admin & moderation
│   ├── 04_reference_data.sql     # Cities & categories data
│   └── README.md                 # Detailed documentation
└── MIGRATIONS_README.md           # This file
```

## Which Migrations Should I Use?

### ✅ Use `migrations_consolidated/` if:
- You're setting up a **new** database from scratch
- You want a clean, organized schema
- You want faster setup time
- You're contributing to the project

### ✅ Use `migrations/` if:
- You have an **existing** production database
- You need the full migration history
- You're upgrading from an older version

## What Was Consolidated?

The consolidation process analyzed all 99 original migration files and extracted the final database state:

| Metric | Before | After |
|--------|--------|-------|
| Files | 99 files | 4 files |
| Lines | 7,621 lines | 2,051 lines |
| Tables | 17 tables | 17 tables ✓ |
| Functions | 30+ functions | 30+ functions ✓ |
| Setup time | ~5 minutes | ~30 seconds |

**Everything is preserved** - just organized better!

## Migration Contents

### 01_core_schema.sql (480 lines)
Core database structure:
- Tables: profiles, posts, categories, messages, reviews, favorites
- Basic functions and RLS policies
- User authentication setup

### 02_ai_features.sql (650 lines)
AI and search features:
- pgvector extension for semantic search
- OpenAI embeddings (1536 dimensions)
- Search analytics and autocomplete
- AI chatbot configuration

### 03_admin_features.sql (492 lines)
Admin and moderation:
- Moderation workflows
- Post and message reporting
- Audit logs
- Admin RLS policies

### 04_reference_data.sql (429 lines)
Seed data:
- 49 Polish cities (20 popular)
- 182 categories with hierarchy
- Default configuration

## Post-Migration Setup

After running migrations:

1. **Create Storage Buckets** (via Supabase Dashboard):
   - `avatars` - User profile pictures
   - `banners` - User profile banners
   - `post-images` - Post/listing images

2. **Set First Admin**:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

3. **Configure Environment Variables**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   OPENAI_API_KEY=sk-your-key  # Optional, for AI features
   ```

4. **Enable Realtime** (for messaging):
   - Go to Supabase Dashboard → Database → Replication
   - Enable realtime for: `messages`, `profiles`

## Testing Migrations

To test on a fresh database:

```bash
# Create test database
supabase db branch create test-migrations

# Apply consolidated migrations
supabase db push --db-url $TEST_DB_URL --migrations-dir supabase/migrations_consolidated

# Verify schema
supabase db diff --db-url $TEST_DB_URL
```

## Troubleshooting

**Error: "extension vector does not exist"**
- Enable pgvector in Supabase Dashboard → Database → Extensions

**Error: "relation already exists"**
- You might have partially applied migrations. Use `IF NOT EXISTS` clauses are included for safety.

**Error: "permission denied"**
- Ensure you're using a service role key or have admin access

**Missing data after migration?**
- Make sure you ran `04_reference_data.sql` last
- Check that INSERT statements completed successfully

## Contributing

When adding new features:

1. **For existing installations**: Add to `migrations/` with timestamp
2. **For consolidated**: Update the appropriate consolidated file and increment version

## Questions?

See detailed documentation in `migrations_consolidated/README.md` or open an issue on GitHub.

---

**Last Updated:** November 5, 2025
**Database Version:** 1.0.0
**Compatible with:** PostgreSQL 15+, pgvector 0.5.0+
