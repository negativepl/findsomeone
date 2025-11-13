-- Fix RLS policies for ai_settings to allow public read access for chat assistant
-- Chat assistant settings should be readable by everyone (for the chatbot to work)
-- but only admins can modify them

-- Drop old restrictive policy
DROP POLICY IF EXISTS "Admins can view AI settings" ON ai_settings;

-- Create new public read policy for ai_settings
CREATE POLICY "Anyone can view AI settings"
  ON ai_settings
  FOR SELECT
  USING (true);

-- Keep the admin-only update policy
-- (already exists from create_ai_settings.sql)
