-- Add banner_url column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Add comment to column
COMMENT ON COLUMN profiles.banner_url IS 'URL to user profile banner image (1200x400 recommended)';
