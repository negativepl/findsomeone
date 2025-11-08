-- Add is_company and is_ai_bot columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_company BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_ai_bot BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN profiles.is_company IS 'Indicates if the profile belongs to a company/business account';
COMMENT ON COLUMN profiles.is_ai_bot IS 'Indicates if the profile belongs to an AI bot';
