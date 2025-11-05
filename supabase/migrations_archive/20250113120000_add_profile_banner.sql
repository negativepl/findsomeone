-- Add banner_url column to profiles table
alter table profiles
add column if not exists banner_url text;

-- Add comment
comment on column profiles.banner_url is 'URL to user profile banner image (for businesses/professionals)';
