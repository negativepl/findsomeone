-- Migration: Remove post type distinction
-- This migration removes the 'seeking' vs 'offering' type system
-- and makes all posts unified

-- Step 1: Delete all existing posts (clean slate approach)
TRUNCATE TABLE posts CASCADE;

-- Step 2: Drop dependent view
DROP VIEW IF EXISTS posts_with_pending_appeals;

-- Step 3: Remove the type column from posts table
ALTER TABLE posts DROP COLUMN IF EXISTS type;

-- Step 4: Drop the type index if it exists
DROP INDEX IF EXISTS posts_type_idx;

-- Step 5: Recreate the view without type column
CREATE OR REPLACE VIEW posts_with_pending_appeals AS
SELECT
  p.*,
  pr.full_name as user_full_name,
  pr.email as user_email
FROM posts p
LEFT JOIN profiles pr ON p.user_id = pr.id
WHERE p.appeal_status = 'pending' OR p.appeal_status = 'reviewing';

-- Grant access to authenticated users
GRANT SELECT ON posts_with_pending_appeals TO authenticated;
