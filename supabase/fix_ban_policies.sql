-- Fix RLS policies for banning users

-- Allow admins to update banned status in profiles
-- First, check if user is admin, then allow update
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Add policy for admins to update profiles (for banning)
DROP POLICY IF EXISTS "Admins can ban users" ON profiles;
CREATE POLICY "Admins can ban users"
  ON profiles FOR UPDATE
  USING (
    -- Current user is admin
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to insert into user_bans
DROP POLICY IF EXISTS "No public access to bans" ON user_bans;

CREATE POLICY "Admins can insert bans"
  ON user_bans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view bans"
  ON user_bans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
