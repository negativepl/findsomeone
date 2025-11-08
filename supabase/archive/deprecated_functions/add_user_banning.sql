-- Add user banning functionality

-- Add banned fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES profiles(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS profiles_banned_idx ON profiles(banned);

-- Table for ban history (for tracking multiple bans)
CREATE TABLE IF NOT EXISTS user_bans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  banned_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  reason TEXT NOT NULL,
  report_id UUID REFERENCES message_reports(id) ON DELETE SET NULL,
  notes TEXT,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  unbanned_at TIMESTAMP WITH TIME ZONE,
  unbanned_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

-- Only admins can view ban history (will be controlled by admin functions)
CREATE POLICY "No public access to bans"
  ON user_bans FOR ALL
  USING (false);

-- Create index
CREATE INDEX user_bans_user_id_idx ON user_bans(user_id);
CREATE INDEX user_bans_banned_at_idx ON user_bans(banned_at DESC);

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id_param AND banned = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_user_banned(UUID) TO authenticated;

-- Middleware to prevent banned users from creating posts/messages
-- You'll need to add this check to your application logic

-- Add comment for documentation
COMMENT ON TABLE user_bans IS 'History of user bans for moderation tracking. Required for GDPR accountability.';
COMMENT ON COLUMN profiles.banned IS 'Whether user is currently banned from the platform';
COMMENT ON COLUMN profiles.ban_reason IS 'Public reason for ban shown to user';
