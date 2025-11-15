-- =====================================================
-- DISABLE POST CREATED NOTIFICATIONS
-- =====================================================
-- Users shouldn't get notifications about their own posts being created
-- This removes the trigger that created "nowa aktywność" notifications

-- Drop the trigger
DROP TRIGGER IF EXISTS on_post_created ON posts;

-- Drop the function (optional, but clean)
DROP FUNCTION IF EXISTS log_post_created();

COMMENT ON TABLE activity_logs IS 'Activity logs for user notifications. post_created activity type is disabled as users should not be notified about their own posts.';
