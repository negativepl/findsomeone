-- Add banner_scale column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS banner_scale INTEGER DEFAULT 100;

-- Add constraint to keep value between 100 and 200 (100% to 200%)
ALTER TABLE profiles
ADD CONSTRAINT banner_scale_range CHECK (banner_scale >= 100 AND banner_scale <= 200);

-- Add comment to column
COMMENT ON COLUMN profiles.banner_scale IS 'Scale/zoom of banner image (100=normal, 200=2x zoom)';
