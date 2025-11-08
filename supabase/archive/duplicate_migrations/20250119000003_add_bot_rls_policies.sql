-- Add RLS policies for Content Bot to create posts

-- Policy: Allow bot user to insert posts
CREATE POLICY "Content bot can insert posts"
ON posts
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = '00000000-0000-0000-0000-000000000002'::uuid
  AND is_ai_generated = true
);

-- Policy: Allow bot user to read its own posts
CREATE POLICY "Content bot can read own posts"
ON posts
FOR SELECT
TO authenticated
USING (
  user_id = '00000000-0000-0000-0000-000000000002'::uuid
);

-- Policy: Allow bot user to update its own posts (for future edits)
CREATE POLICY "Content bot can update own posts"
ON posts
FOR UPDATE
TO authenticated
USING (
  user_id = '00000000-0000-0000-0000-000000000002'::uuid
)
WITH CHECK (
  user_id = '00000000-0000-0000-0000-000000000002'::uuid
);

-- Policy: Allow bot user to delete its own posts (for cleanup)
CREATE POLICY "Content bot can delete own posts"
ON posts
FOR DELETE
TO authenticated
USING (
  user_id = '00000000-0000-0000-0000-000000000002'::uuid
);
