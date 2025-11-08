-- Add new notification preference columns to profiles table
alter table profiles
add column if not exists favorite_notifications boolean default true,
add column if not exists review_notifications boolean default true;

-- Add comments
comment on column profiles.favorite_notifications is 'Whether the user wants to receive notifications when someone favorites their post';
comment on column profiles.review_notifications is 'Whether the user wants to receive notifications when they receive a review';
