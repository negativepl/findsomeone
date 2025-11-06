# Supabase Database Configuration

This directory contains all database migrations, functions, policies, and documentation for the FindSomeone application.

## Directory Structure

```
supabase/
├── migrations/                    # 100 incremental migration files (timestamped)
├── migrations_consolidated/       # 4 consolidated files for new installations
├── functions/                     # SQL functions (search, analytics, synonyms)
├── policies/                      # Additional RLS policies
├── archive/                       # Deprecated SQL files (not used)
├── schema.sql                     # Complete database schema
└── *.md                          # Documentation files
```

## Quick Start

### For New Installations

Use the consolidated migrations for fast setup (~30 seconds):

```bash
cd supabase/migrations_consolidated
psql $DATABASE_URL -f 01_core_schema.sql
psql $DATABASE_URL -f 02_ai_features.sql
psql $DATABASE_URL -f 03_admin_features.sql
psql $DATABASE_URL -f 04_reference_data.sql
```

📖 See [migrations_consolidated/README.md](./migrations_consolidated/README.md) for details.

### For Existing Installations

Use incremental migrations in order:

```bash
cd supabase/migrations
# Run migrations in chronological order
ls -1 *.sql | sort | while read file; do
  psql $DATABASE_URL -f "$file"
done
```

📖 See [MIGRATIONS_README.md](./MIGRATIONS_README.md) for details.

## Documentation

- **[MIGRATIONS_README.md](./MIGRATIONS_README.md)** - Migration guide and directory structure
- **[migrations_consolidated/README.md](./migrations_consolidated/README.md)** - Detailed consolidated migrations docs
- **[STORAGE_SETUP.md](./STORAGE_SETUP.md)** - Setup for post images, avatars, banners
- **[AVATAR_STORAGE_SETUP.md](./AVATAR_STORAGE_SETUP.md)** - Avatar-specific storage configuration
- **[ENABLE_REALTIME.md](./ENABLE_REALTIME.md)** - Enable realtime for messaging
- **[AUDIT_LOGS_SETUP.md](./AUDIT_LOGS_SETUP.md)** - Admin audit logging setup

## Database Features

### Core Tables
- `profiles` - User profiles with preferences and settings
- `posts` - Listings/posts with moderation
- `categories` - Hierarchical category structure (182 categories)
- `cities` - Polish cities database (49 cities)
- `messages` - Private messaging system
- `reviews` - User ratings and reviews
- `favorites` - Saved/favorited posts

### AI Features
- **Semantic Search** - pgvector embeddings (1536 dimensions)
- **Autocomplete** - Google-style search suggestions
- **AI Chatbot** - Conversational search assistant
- **Search Analytics** - Track and analyze user searches

### Admin Features
- **Post Moderation** - Workflow with auto and manual moderation
- **Reporting System** - User reports for posts and messages
- **Audit Logs** - GDPR-compliant admin action tracking
- **Page Builder** - Configurable homepage sections

### Security
- **Row Level Security (RLS)** - All tables protected
- **Role-based Access** - User, moderator, admin roles
- **GDPR Compliance** - Data retention and audit trails

## Post-Migration Setup

After running migrations, complete these steps:

### 1. Create Storage Buckets

In Supabase Dashboard → Storage, create:
- `avatars` - User profile pictures
- `banners` - Profile banners
- `post-images` - Listing images

### 2. Set First Admin

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### 3. Enable Extensions

In Supabase Dashboard → Database → Extensions:
- ✅ `uuid-ossp` - UUID generation
- ✅ `pg_trgm` - Fuzzy text search
- ✅ `vector` - pgvector for embeddings

### 4. Enable Realtime

In Supabase Dashboard → Database → Replication:
- ✅ `messages`
- ✅ `profiles`

### 5. Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
OPENAI_API_KEY=sk-your-key  # Optional, for AI features
```

## Migration History

### Recent Changes (November 6, 2025)

✅ Removed duplicate `migrations_archive/` (was exact copy)
✅ Fixed migration timestamps (2025-10 → 2025-02)
✅ Added timestamps to undated migrations
✅ Updated all documentation

### Statistics

- **Total Migrations**: 100 files
- **Consolidated**: 4 files (96% reduction)
- **Total Lines**: 7,621 → 2,051 (73% reduction)
- **Tables**: 17 core tables
- **Functions**: 30+ SQL functions
- **RLS Policies**: 30+ security policies

## Troubleshooting

**Error: "extension vector does not exist"**
→ Enable pgvector in Dashboard → Database → Extensions

**Error: "relation already exists"**
→ Some migrations already applied. `IF NOT EXISTS` clauses are included for safety.

**Error: "permission denied"**
→ Use service role key or ensure admin access

**Missing data after migration?**
→ Ensure `04_reference_data.sql` ran successfully

## Contributing

When adding database changes:

1. **New installations**: Update appropriate consolidated file
2. **Existing installations**: Create new timestamped migration in `migrations/`
3. **Format**: `YYYYMMDDHHMMSS_description.sql`
4. **Test**: Run on fresh database before committing

## Support

- Check detailed docs in `MIGRATIONS_README.md`
- Review `migrations_consolidated/README.md` for schema details
- Open GitHub issue for problems

---

**Database Version**: 1.0.0
**Last Updated**: November 6, 2025
**Compatible With**: PostgreSQL 15+, pgvector 0.5.0+
