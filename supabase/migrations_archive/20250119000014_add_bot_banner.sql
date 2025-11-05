-- Add banner to Content Bot profile (Wypełniaczek)

UPDATE profiles
SET banner_url = '/wypelniaczek-banner.avif'
WHERE id = '00000000-0000-0000-0000-000000000002'::uuid;
