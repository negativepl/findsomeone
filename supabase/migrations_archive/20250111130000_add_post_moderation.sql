-- Add moderation fields to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'checking', 'approved', 'rejected', 'flagged')),
ADD COLUMN IF NOT EXISTS moderation_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
ADD COLUMN IF NOT EXISTS moderation_details JSONB,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id);

-- Create index for faster queries on moderation status
CREATE INDEX IF NOT EXISTS idx_posts_moderation_status ON posts(moderation_status);
CREATE INDEX IF NOT EXISTS idx_posts_moderated_at ON posts(moderated_at);

-- Create moderation_logs table for audit trail
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('auto_approved', 'auto_rejected', 'flagged', 'manual_approved', 'manual_rejected', 'deleted')),
  previous_status TEXT,
  new_status TEXT,
  reason TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_logs_post_id ON moderation_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created_at ON moderation_logs(created_at DESC);

-- Update RLS policies for posts
-- Allow users to see their own pending/flagged posts
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR moderation_status = 'approved'
  );

-- Allow admins to see all posts
CREATE POLICY "Admins can view all posts" ON posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Enable RLS on moderation_logs
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view moderation logs
CREATE POLICY "Only admins can view moderation logs" ON moderation_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only system/admins can insert moderation logs
CREATE POLICY "Only system can insert moderation logs" ON moderation_logs
  FOR INSERT
  WITH CHECK (true);
