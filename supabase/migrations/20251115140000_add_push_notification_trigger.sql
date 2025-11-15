-- =====================================================
-- ADD PUSH NOTIFICATION TRIGGER
-- =====================================================
-- Creates trigger to send push notifications when activity_log is inserted

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS activity_logs_push_notification ON activity_logs;

-- Create trigger for sending push notifications on new activity
CREATE TRIGGER activity_logs_push_notification
  AFTER INSERT ON activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION send_push_notification_trigger();

COMMENT ON TRIGGER activity_logs_push_notification ON activity_logs IS
  'Automatically sends push notifications via Edge Function when new activity is logged.
   Uses send_push_notification_trigger() function to handle notification logic.';
