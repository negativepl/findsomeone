-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_post_id_idx ON public.favorites(post_id);
CREATE INDEX IF NOT EXISTS favorites_created_at_idx ON public.favorites(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policies for favorites
-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can remove their own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.favorites TO authenticated;
GRANT SELECT ON public.favorites TO anon;
