-- Add privacy settings columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS show_phone boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_messages boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_profile_link boolean DEFAULT true;

-- Add comment to explain the columns
COMMENT ON COLUMN profiles.show_phone IS 'Whether to show phone number in post details';
COMMENT ON COLUMN profiles.show_messages IS 'Whether to show "Send Message" button in post details';
COMMENT ON COLUMN profiles.show_profile_link IS 'Whether to allow clicking on profile name/rating to view full profile';
