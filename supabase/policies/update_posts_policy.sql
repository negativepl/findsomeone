-- Update the posts visibility policy to show completed posts to everyone
-- This allows users to view completed posts and leave reviews

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;

CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (
    status IN ('active', 'completed')
    OR user_id = auth.uid()
  );
