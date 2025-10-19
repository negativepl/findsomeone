-- Migration: Prevent messages to AI bot
-- This migration adds a check constraint to prevent sending messages to the AI bot user

-- Add check constraint to messages table to prevent sending messages to AI bot
ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_no_ai_bot_receiver;

ALTER TABLE messages
ADD CONSTRAINT messages_no_ai_bot_receiver
CHECK (receiver_id != '00000000-0000-0000-0000-000000000002');

-- Update RLS policies to also prevent this at the policy level
DROP POLICY IF EXISTS "Users can send messages to other users" ON messages;

CREATE POLICY "Users can send messages to other users"
ON messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND sender_id != receiver_id
  AND receiver_id != '00000000-0000-0000-0000-000000000002'::uuid
);
