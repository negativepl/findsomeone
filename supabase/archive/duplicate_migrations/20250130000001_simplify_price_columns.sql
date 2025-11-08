-- Migration: Simplify price system
-- Replace price_min and price_max with single price column

-- Step 1: Drop dependent view
DROP VIEW IF EXISTS posts_with_pending_appeals;

-- Step 2: Add new price column
ALTER TABLE posts ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);

-- Step 3: Drop old price columns
ALTER TABLE posts DROP COLUMN IF EXISTS price_min;
ALTER TABLE posts DROP COLUMN IF EXISTS price_max;

-- Step 4: Drop price-related indexes if they exist
DROP INDEX IF EXISTS idx_posts_price_min;
DROP INDEX IF EXISTS idx_posts_price_max;

-- Step 5: Create new index on price
CREATE INDEX IF NOT EXISTS idx_posts_price ON posts(price) WHERE price IS NOT NULL;

-- Step 6: Recreate the view without price_min/price_max columns
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
