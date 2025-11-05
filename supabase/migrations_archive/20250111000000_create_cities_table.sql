-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create cities table for Polish cities
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  voivodeship TEXT, -- województwo
  county TEXT, -- powiat
  population INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better search performance
CREATE INDEX idx_cities_name ON public.cities USING gin (name gin_trgm_ops);
CREATE INDEX idx_cities_slug ON public.cities (slug);
CREATE INDEX idx_cities_voivodeship ON public.cities (voivodeship);
CREATE INDEX idx_cities_popular ON public.cities (popular) WHERE popular = true;

-- Enable Row Level Security
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read cities
CREATE POLICY "Cities are viewable by everyone"
  ON public.cities
  FOR SELECT
  USING (true);

-- Add comment
COMMENT ON TABLE public.cities IS 'Polish cities and towns data from GUS';
