-- Update Content Bot profile with friendly name and avatar

-- Update profile with avatar, rating and review count
UPDATE profiles
SET
  full_name = 'Wypełniaczek',
  avatar_url = '/wypelniaczek-avatar.webp',
  bio = 'Automatyczny pomocnik generujący przykładowe ogłoszenia. Wszystkie treści są tworzone przez AI i służą wypełnieniu platformy. 🤖',
  rating = 5.00,
  total_reviews = 69
WHERE id = '00000000-0000-0000-0000-000000000002'::uuid;

-- Update auth user metadata (for consistency)
UPDATE auth.users
SET
  raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{full_name}',
    '"Wypełniaczek"'
  )
WHERE id = '00000000-0000-0000-0000-000000000002'::uuid;

-- Set bot as always online (insert or update user_presence)
INSERT INTO user_presence (user_id, status, last_seen)
VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  'online',
  NOW()
)
ON CONFLICT (user_id)
DO UPDATE SET
  status = 'online',
  last_seen = NOW();

-- Create a function to keep bot always online
CREATE OR REPLACE FUNCTION keep_bot_online()
RETURNS trigger AS $$
BEGIN
  -- If bot's status is being changed, keep it online
  IF NEW.user_id = '00000000-0000-0000-0000-000000000002'::uuid THEN
    NEW.status := 'online';
    NEW.last_seen := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain bot online status
DROP TRIGGER IF EXISTS ensure_bot_online ON user_presence;
CREATE TRIGGER ensure_bot_online
  BEFORE INSERT OR UPDATE ON user_presence
  FOR EACH ROW
  WHEN (NEW.user_id = '00000000-0000-0000-0000-000000000002'::uuid)
  EXECUTE FUNCTION keep_bot_online();
