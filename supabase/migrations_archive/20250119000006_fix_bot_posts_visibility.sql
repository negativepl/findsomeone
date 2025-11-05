-- Fix RLS policy to allow everyone (including anon users) to view bot posts
-- This ensures that posts created by WypeBniaczek (Content Bot) are visible to all users

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;

CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (
    -- Active posts that are not deleted (viewable by everyone including anon)
    (status = 'active' AND is_deleted = false)
    -- OR user's own posts (for logged in users to see their drafts/pending posts)
    OR user_id = auth.uid()
  );

-- Note: Bot posts with user_id = '00000000-0000-0000-0000-000000000002'
-- will be visible to everyone (including anon) because they have status='active' and is_deleted=false
