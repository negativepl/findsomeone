-- Add banner_position column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS banner_position INTEGER DEFAULT 50;

-- Add constraint to keep value between 0 and 100
ALTER TABLE profiles
ADD CONSTRAINT banner_position_range CHECK (banner_position >= 0 AND banner_position <= 100);

-- Add comment to column
COMMENT ON COLUMN profiles.banner_position IS 'Vertical position of banner image (0=top, 50=center, 100=bottom)';
