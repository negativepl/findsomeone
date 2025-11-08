-- Add user preferences columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS message_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'pl',
ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'light';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_preferences ON profiles(email_notifications, message_notifications);
