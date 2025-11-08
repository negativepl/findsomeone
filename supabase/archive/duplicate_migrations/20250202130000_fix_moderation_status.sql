-- Fix existing posts with incorrect status/moderation_status combinations
-- Posts that are active should have moderation_status = 'approved'
-- Posts that are pending should have appropriate moderation_status

-- Set moderation_status to 'approved' for all active posts that don't have it set
UPDATE posts
SET moderation_status = 'approved'
WHERE status = 'active'
  AND (moderation_status IS NULL OR moderation_status IN ('pending', 'checking'));

-- For AI-generated posts that are active, ensure they're marked as approved
UPDATE posts
SET moderation_status = 'approved'
WHERE status = 'active'
  AND is_ai_generated = true
  AND moderation_status IS NULL;

-- For posts that are pending but have no moderation_status, set it to pending
UPDATE posts
SET moderation_status = 'pending'
WHERE status = 'pending'
  AND moderation_status IS NULL;
