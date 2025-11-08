# Supabase Archive

This folder contains archived Supabase files that are not actively used but have been preserved for historical and reference purposes.

## Structure

### 📁 `deprecated_functions/`
**Contents:** 10 old SQL files with optional/deprecated functions
**Reason for archiving:** These functions were created as experimental or optional extensions. Most have been incorporated into main migrations or are no longer used.

**Files:**
- `add_audit_logs_function.sql` - Audit logs function (included in main migrations)
- `add_favorites.sql` - Favorites system (optional)
- `add_roles.sql` - Role system (optional)
- `add_user_banning.sql` - User banning system (included in main migrations)
- `fix_realtime_rls.sql` - RLS fix for realtime (replaced by newer version)
- `fix_review_trigger.sql` - Review trigger fix (replaced)
- `increment_views.sql` - View counter (optional)
- `message_reporting_system.sql` - Message reporting system (optional)
- `message_security.sql` - Message security (included in main migrations)
- `presence_and_typing.sql` - Presence and typing status (optional)

**Can be deleted?** Not recommended - may be useful as reference or for projects derived from this codebase.

---

### 📁 `duplicate_migrations/`
**Contents:** 99 SQL files - exact duplicate of `/migrations/` folder
**Reason for archiving:** This is a backup copy of migrations that was created automatically. All these files already exist in `/migrations/`.

**Files:** All migrations from `20250110_add_user_preferences.sql` to `20251014000001_add_is_deleted_to_posts.sql` plus additional files `create_ai_settings.sql` and `add_category_synonym_settings.sql`.

**Can be deleted?** Yes - it's an exact duplicate. Kept only as additional backup.

**Size:** ~356 KB

---

### 📁 `old_scripts/`
**Contents:** Old SQL scripts that were created ad-hoc outside the migration system
**Reason for archiving:** One-time or test scripts that are not part of the main migration flow.

**Files:**
- `disable-about-section.sql` - Script to disable "About" section

**Can be deleted?** Not recommended - may be needed for quick changes in the future.

---

## Active Supabase Folders (outside archive)

- **`/migrations/`** - 99 active migrations (full database change history)
- **`/migrations_consolidated/`** - 4 consolidated migrations for new installations (recommended for new projects)
- **`/functions/`** - Edge Functions (Deno) and SQL functions
- **`/policies/`** - Row Level Security (RLS) policies

---

## Recommendations

### For Existing Installations:
- Use migrations from `/migrations/` (full history)
- Do not apply files from archive without careful review

### For New Installations:
- Use `/migrations_consolidated/` (cleaner, faster)
- Archive can be ignored

### For Developers:
- Before using anything from archive, check if it already exists in main migrations
- Archive is only for reference and emergency recovery

---

## Archive History

**Date:** 2025-11-08
**Reason:** Cleanup of Supabase project structure
**Archived by:** Claude (cleanup-supabase-migrations)

---

## Questions?

If you need to restore something from archive or have questions:
1. Check if the functionality already exists in `/migrations/` or `/migrations_consolidated/`
2. Read the documentation in `/supabase/MIGRATIONS_README.md`
3. If in doubt - consult with the team before applying archived files
