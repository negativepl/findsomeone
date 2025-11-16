-- Allow users to update their own banner position and scale
DO $$
BEGIN
  -- Drop the policy if it exists and recreate it
  DROP POLICY IF EXISTS "Users can update their own banner settings" ON profiles;

  -- Create the policy
  CREATE POLICY "Users can update their own banner settings"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Policy already exists, do nothing
END $$;
