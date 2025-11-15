-- Add booking notification preference column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS booking_notifications BOOLEAN DEFAULT true;

-- Add comment
COMMENT ON COLUMN profiles.booking_notifications IS 'Whether the user wants to receive notifications when someone requests a booking';
