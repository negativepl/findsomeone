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
