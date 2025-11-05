-- Add advanced styling and new section type support to homepage_sections table
-- This migration adds Elementor-like customization options

-- Add spacing columns
ALTER TABLE homepage_sections
ADD COLUMN IF NOT EXISTS padding_top INTEGER,
ADD COLUMN IF NOT EXISTS padding_bottom INTEGER,
ADD COLUMN IF NOT EXISTS padding_left INTEGER,
ADD COLUMN IF NOT EXISTS padding_right INTEGER,
ADD COLUMN IF NOT EXISTS margin_top INTEGER,
ADD COLUMN IF NOT EXISTS margin_bottom INTEGER;

-- Add container width control
ALTER TABLE homepage_sections
ADD COLUMN IF NOT EXISTS container_width TEXT CHECK (container_width IN ('full', 'boxed', 'narrow'));

-- Add border and shadow options
ALTER TABLE homepage_sections
ADD COLUMN IF NOT EXISTS border_width INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS border_color TEXT,
ADD COLUMN IF NOT EXISTS border_radius INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS box_shadow TEXT;

-- Add background image options
ALTER TABLE homepage_sections
ADD COLUMN IF NOT EXISTS background_image_url TEXT,
ADD COLUMN IF NOT EXISTS background_size TEXT CHECK (background_size IN ('cover', 'contain', 'auto')) DEFAULT 'cover',
ADD COLUMN IF NOT EXISTS background_position TEXT DEFAULT 'center',
ADD COLUMN IF NOT EXISTS background_overlay_opacity INTEGER CHECK (background_overlay_opacity >= 0 AND background_overlay_opacity <= 100),
ADD COLUMN IF NOT EXISTS background_overlay_color TEXT;

-- Add comment describing new capabilities
COMMENT ON TABLE homepage_sections IS 'Homepage sections with advanced Elementor-like styling options including spacing, borders, shadows, and background images';
