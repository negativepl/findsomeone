-- Migration: Remove old AI bot trigger and function
-- This migration removes the trigger-based approach in favor of CHECK constraint and RLS policy

-- Drop the trigger
DROP TRIGGER IF EXISTS prevent_ai_bot_messaging ON messages;

-- Drop the function
DROP FUNCTION IF EXISTS check_not_ai_bot_receiver();

-- Comment: The AI bot protection is now handled by CHECK constraint and RLS policy
-- See migration 20250119000017_prevent_messages_to_ai_bot.sql
