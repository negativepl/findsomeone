-- Create homepage_sections table for page builder
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Section configuration
  type TEXT NOT NULL, -- 'seeking_help', 'offering_help', 'newest_posts', 'city_based', 'popular_categories', 'recently_viewed', 'custom_html', 'custom_content'
  title TEXT, -- Override default title
  subtitle TEXT, -- Override default subtitle

  -- Display settings
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Section-specific configuration (stored as JSONB for flexibility)
  config JSONB DEFAULT '{}'::jsonb,
  -- Examples of config:
  -- { "limit": 8, "category_filter": ["uuid1", "uuid2"], "post_type": "seeking" }
  -- { "html_content": "<div>Custom HTML</div>", "css_classes": "my-custom-class" }
  -- { "show_see_all_button": true, "button_text": "Zobacz wszystkie", "button_link": "/posts" }

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index for sorting
CREATE INDEX idx_homepage_sections_sort_order ON homepage_sections(sort_order) WHERE is_active = true;

-- RLS policies
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- Anyone can view active sections
CREATE POLICY "Active homepage sections are viewable by everyone"
  ON homepage_sections FOR SELECT
  USING (is_active = true);

-- Only admins can manage sections
CREATE POLICY "Only admins can manage homepage sections"
  ON homepage_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_homepage_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON homepage_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_homepage_sections_updated_at();

-- Insert default sections (migrating current homepage structure)
INSERT INTO homepage_sections (type, title, subtitle, sort_order, is_active, config) VALUES
  ('seeking_help', 'Szukają pomocy', 'Sprawdź kto potrzebuje Twoich usług', 1, true, '{"limit": 8, "post_type": "seeking", "show_see_all_button": true}'::jsonb),
  ('offering_help', 'Oferują pomoc', 'Znajdź ludzi w Twojej okolicy', 2, true, '{"limit": 8, "post_type": "offering", "show_see_all_button": true}'::jsonb),
  ('popular_categories', 'Popularne kategorie', 'Najpopularniejsze kategorie ogłoszeń', 3, true, '{"limit": 8}'::jsonb),
  ('newest_posts', 'Nowe ogłoszenia', 'Najnowsze ogłoszenia dodane przez użytkowników', 4, true, '{"limit": 8}'::jsonb),
  ('city_based', 'W Twoim mieście', 'Ogłoszenia z miasta', 5, true, '{"limit": 8, "use_geolocation": true, "show_see_all_button": true}'::jsonb),
  ('recently_viewed', 'Ostatnio wyświetlane', 'Ostatnio przeglądane ogłoszenia', 6, true, '{"limit": 8}'::jsonb);

-- Create function to reorder sections
CREATE OR REPLACE FUNCTION reorder_homepage_sections(section_ids UUID[])
RETURNS void AS $$
DECLARE
  section_id UUID;
  new_order INTEGER := 0;
BEGIN
  FOREACH section_id IN ARRAY section_ids
  LOOP
    UPDATE homepage_sections
    SET sort_order = new_order
    WHERE id = section_id;
    new_order := new_order + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
