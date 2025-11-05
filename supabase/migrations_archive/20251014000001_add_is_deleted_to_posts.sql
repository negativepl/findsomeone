-- Add is_deleted column to posts table for soft deletion
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS posts_is_deleted_idx ON posts(is_deleted);

-- Update the Posts policies to exclude deleted posts from public view
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;

CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (
    (status = 'active' AND is_deleted = false)
    OR user_id = auth.uid()
  );
