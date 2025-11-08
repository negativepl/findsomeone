-- Add appeal fields to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS appeal_status TEXT DEFAULT NULL CHECK (appeal_status IN ('pending', 'reviewing', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS appeal_message TEXT,
ADD COLUMN IF NOT EXISTS appealed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS appeal_reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS appeal_reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS appeal_response TEXT;

-- Create index for faster queries on appeal status
CREATE INDEX IF NOT EXISTS idx_posts_appeal_status ON posts(appeal_status) WHERE appeal_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_appealed_at ON posts(appealed_at);

-- Add appeal action to moderation_logs
-- Update the check constraint to include 'appeal_submitted' and 'appeal_approved'
ALTER TABLE moderation_logs DROP CONSTRAINT IF EXISTS moderation_logs_action_check;
ALTER TABLE moderation_logs ADD CONSTRAINT moderation_logs_action_check
  CHECK (action IN ('auto_approved', 'auto_rejected', 'flagged', 'manual_approved', 'manual_rejected', 'deleted', 'appeal_submitted', 'appeal_approved', 'appeal_rejected'));

-- Create view for posts with pending appeals
CREATE OR REPLACE VIEW posts_with_pending_appeals AS
SELECT
  p.*,
  pr.full_name as user_full_name,
  pr.email as user_email
FROM posts p
LEFT JOIN profiles pr ON p.user_id = pr.id
WHERE p.appeal_status = 'pending' OR p.appeal_status = 'reviewing';

-- Grant access to admins
GRANT SELECT ON posts_with_pending_appeals TO authenticated;
