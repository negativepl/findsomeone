-- Add expiration-related fields to posts table
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT (timezone('utc'::text, now()) + interval '30 days'),
  ADD COLUMN IF NOT EXISTS extended_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_extended_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS expiration_notified_at timestamp with time zone;

-- Update price_type to include 'free' option and make it required (NOT NULL)
ALTER TABLE posts
  DROP CONSTRAINT IF EXISTS posts_price_type_check;

ALTER TABLE posts
  ADD CONSTRAINT posts_price_type_check
  CHECK (price_type IN ('hourly', 'fixed', 'negotiable', 'free'));

-- Set default value for price_type for existing rows
UPDATE posts SET price_type = 'negotiable' WHERE price_type IS NULL;

-- Make price_type NOT NULL
ALTER TABLE posts
  ALTER COLUMN price_type SET NOT NULL,
  ALTER COLUMN price_type SET DEFAULT 'negotiable';

-- Create index for efficient expiration queries
CREATE INDEX IF NOT EXISTS posts_expires_at_idx ON posts(expires_at)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS posts_expiration_notification_idx ON posts(expires_at, expiration_notified_at)
  WHERE status = 'active' AND expiration_notified_at IS NULL;

-- Function to auto-expire posts
CREATE OR REPLACE FUNCTION expire_old_posts()
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET status = 'closed',
      updated_at = timezone('utc'::text, now())
  WHERE status = 'active'
    AND expires_at < timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to extend post expiration (30 days from now)
CREATE OR REPLACE FUNCTION extend_post_expiration(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET expires_at = timezone('utc'::text, now()) + interval '30 days',
      extended_count = extended_count + 1,
      last_extended_at = timezone('utc'::text, now()),
      expiration_notified_at = NULL,
      updated_at = timezone('utc'::text, now())
  WHERE id = post_id
    AND user_id = auth.uid()
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get posts expiring soon (for notifications)
CREATE OR REPLACE FUNCTION get_posts_expiring_soon(days_before integer)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  expires_at timestamp with time zone,
  user_email text,
  user_full_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.title,
    p.expires_at,
    pr.email,
    pr.full_name
  FROM posts p
  JOIN profiles pr ON p.user_id = pr.id
  WHERE p.status = 'active'
    AND p.expires_at <= timezone('utc'::text, now()) + make_interval(days => days_before)
    AND p.expires_at > timezone('utc'::text, now())
    AND (
      p.expiration_notified_at IS NULL
      OR p.expiration_notified_at < timezone('utc'::text, now()) - interval '1 day'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON COLUMN posts.expires_at IS 'Date when the post will automatically expire';
COMMENT ON COLUMN posts.extended_count IS 'Number of times the post expiration has been extended';
COMMENT ON COLUMN posts.last_extended_at IS 'Last time the expiration was extended';
COMMENT ON COLUMN posts.expiration_notified_at IS 'Last time user was notified about upcoming expiration';
