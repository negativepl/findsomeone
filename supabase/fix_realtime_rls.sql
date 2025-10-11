-- Fix Realtime RLS for messages table
-- This allows realtime events to bypass RLS checks

-- First, check current RLS policies
-- You should see policies that allow users to view their messages

-- The issue is that Realtime needs special handling
-- We need to make sure the table is in the publication with proper settings

-- Remove and re-add the table to publication with replica identity
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Ensure the publication includes the table
-- (This might already be done, but let's be sure)
DO $$
BEGIN
  -- Try to add the table, ignore if already exists
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- Important: Make sure realtime can read all columns
-- Grant necessary permissions
GRANT SELECT ON public.messages TO anon, authenticated;

-- For realtime to work with RLS, we need to ensure the subscription user can see changes
-- The realtime server uses the postgres role, not the authenticated user
GRANT SELECT ON public.messages TO postgres;
