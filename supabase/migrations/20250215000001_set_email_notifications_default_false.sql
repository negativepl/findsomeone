-- Change default value for email_notifications to false
-- This affects new users only. Existing users keep their current settings.

ALTER TABLE profiles
ALTER COLUMN email_notifications SET DEFAULT false;

-- Optional: Update existing users to false (uncomment if you want this)
-- UPDATE profiles SET email_notifications = false;
