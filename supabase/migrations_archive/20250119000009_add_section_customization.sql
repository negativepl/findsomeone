-- Add customization options to homepage_sections table

-- Add styling columns
ALTER TABLE homepage_sections
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS container_classes TEXT DEFAULT NULL;

-- Add visibility controls
ALTER TABLE homepage_sections
ADD COLUMN IF NOT EXISTS visible_on_mobile BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS visible_on_desktop BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN homepage_sections.background_color IS 'Background color for the section (hex code, e.g., #FFFFFF)';
COMMENT ON COLUMN homepage_sections.text_color IS 'Text color for the section (hex code, e.g., #000000)';
COMMENT ON COLUMN homepage_sections.container_classes IS 'Additional CSS classes for the section container';
COMMENT ON COLUMN homepage_sections.visible_on_mobile IS 'Whether the section is visible on mobile devices';
COMMENT ON COLUMN homepage_sections.visible_on_desktop IS 'Whether the section is visible on desktop devices';
