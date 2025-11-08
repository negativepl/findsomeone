-- Add vibration_enabled column to profiles table
alter table profiles
add column if not exists vibration_enabled boolean default false;

-- Add comment
comment on column profiles.vibration_enabled is 'Whether the user has enabled vibration feedback for mobile interactions';
