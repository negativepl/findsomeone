-- Update message minimum length constraint from 10 to 1 character
-- This allows users to send short messages like "Ok", "Tak", emojis, etc.

ALTER TABLE messages DROP CONSTRAINT IF EXISTS check_message_min_length;

ALTER TABLE messages ADD CONSTRAINT check_message_min_length
CHECK (char_length(trim(content)) >= 1);
