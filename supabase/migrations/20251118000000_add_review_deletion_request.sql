-- =====================================================
-- ADD REVIEW DELETION REQUEST ACTIVITY TYPE
-- =====================================================
-- Adds review_deletion_request to activity_type enum

-- Update activity_logs activity_type to include review_deletion_request
ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_activity_type_check;
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_activity_type_check
  CHECK (activity_type IN ('post_created', 'post_viewed', 'message_received', 'message_sent', 'favorite_added', 'review_received', 'booking_request', 'review_deletion_request'));
