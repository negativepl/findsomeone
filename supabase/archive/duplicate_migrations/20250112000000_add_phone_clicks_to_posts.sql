-- Add phone_clicks column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS phone_clicks INTEGER DEFAULT 0;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_phone_clicks ON posts(phone_clicks);
