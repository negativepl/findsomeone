-- =====================================================
-- 03_ADMIN_FEATURES.SQL
-- Admin and moderation features
-- =====================================================
-- This file contains all admin-related functionality
-- including moderation, reporting, audit logs, and
-- homepage customization features.
-- =====================================================

-- =====================================================
-- MODERATION LOGS TABLE
-- =====================================================
-- Audit trail for post moderation actions

CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('auto_approved', 'auto_rejected', 'flagged', 'manual_approved', 'manual_rejected', 'deleted')),
  previous_status TEXT,
  new_status TEXT,
  reason TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_moderation_logs_post_id ON moderation_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created_at ON moderation_logs(created_at DESC);

-- =====================================================
-- POST REPORTS TABLE
-- =====================================================
-- User-submitted reports of problematic posts

CREATE TABLE IF NOT EXISTS post_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'scam', 'misleading', 'duplicate', 'other')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(post_id, reporter_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS post_reports_post_id_idx ON post_reports(post_id);
CREATE INDEX IF NOT EXISTS post_reports_reporter_id_idx ON post_reports(reporter_id);
CREATE INDEX IF NOT EXISTS post_reports_status_idx ON post_reports(status);
CREATE INDEX IF NOT EXISTS post_reports_created_at_idx ON post_reports(created_at DESC);

-- =====================================================
-- ADMIN POST ACCESS LOG TABLE
-- =====================================================
-- Audit trail for admin access to posts

CREATE TABLE IF NOT EXISTS admin_post_access_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  report_id UUID REFERENCES post_reports(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS admin_post_access_log_admin_id_idx ON admin_post_access_log(admin_id);
CREATE INDEX IF NOT EXISTS admin_post_access_log_post_id_idx ON admin_post_access_log(post_id);
CREATE INDEX IF NOT EXISTS admin_post_access_log_report_id_idx ON admin_post_access_log(report_id);
CREATE INDEX IF NOT EXISTS admin_post_access_log_created_at_idx ON admin_post_access_log(created_at DESC);

-- =====================================================
-- MESSAGE REPORTS TABLE
-- =====================================================
-- User-submitted reports of problematic messages

CREATE TABLE IF NOT EXISTS message_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'scam', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  first_read_at TIMESTAMP WITH TIME ZONE,
  first_read_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(message_id, reporter_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS message_reports_message_id_idx ON message_reports(message_id);
CREATE INDEX IF NOT EXISTS message_reports_reporter_id_idx ON message_reports(reporter_id);
CREATE INDEX IF NOT EXISTS message_reports_status_idx ON message_reports(status);
CREATE INDEX IF NOT EXISTS message_reports_is_read_idx ON message_reports(is_read);

COMMENT ON TABLE message_reports IS 'Stores user reports of inappropriate messages. Required for GDPR compliance and content moderation.';

-- =====================================================
-- ADMIN MESSAGE ACCESS LOGS TABLE
-- =====================================================
-- Audit trail for admin access to private messages

CREATE TABLE IF NOT EXISTS admin_message_access_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  report_id UUID REFERENCES message_reports(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS admin_logs_admin_id_idx ON admin_message_access_logs(admin_id);
CREATE INDEX IF NOT EXISTS admin_logs_message_id_idx ON admin_message_access_logs(message_id);
CREATE INDEX IF NOT EXISTS admin_logs_accessed_at_idx ON admin_message_access_logs(accessed_at DESC);

COMMENT ON TABLE admin_message_access_logs IS 'Audit trail of admin access to private messages. Required for GDPR accountability.';

-- =====================================================
-- HOMEPAGE SECTIONS TABLE
-- =====================================================
-- Configurable homepage sections for page builder

CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Section configuration
  type TEXT NOT NULL, -- 'seeking_help', 'offering_help', 'newest_posts', 'city_based', 'popular_categories', 'recently_viewed', 'custom_html', 'custom_content'
  title TEXT,
  subtitle TEXT,

  -- Display settings
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Section-specific configuration (JSONB for flexibility)
  config JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_homepage_sections_sort_order ON homepage_sections(sort_order) WHERE is_active = true;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_post_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_message_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - MODERATION LOGS
-- =====================================================

CREATE POLICY "Only admins can view moderation logs"
  ON moderation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only system can insert moderation logs"
  ON moderation_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- RLS POLICIES - POST REPORTS
-- =====================================================

CREATE POLICY "Users can view own reports"
  ON post_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON post_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- =====================================================
-- RLS POLICIES - ADMIN POST ACCESS LOG
-- =====================================================

CREATE POLICY "Admins can view audit logs"
  ON admin_post_access_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- RLS POLICIES - MESSAGE REPORTS
-- =====================================================

CREATE POLICY "Users can report messages"
  ON message_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON message_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can update reports"
  ON message_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- RLS POLICIES - ADMIN MESSAGE ACCESS LOGS
-- =====================================================

CREATE POLICY "No public access to admin logs"
  ON admin_message_access_logs FOR ALL
  USING (false);

-- =====================================================
-- RLS POLICIES - HOMEPAGE SECTIONS
-- =====================================================

CREATE POLICY "Active homepage sections are viewable by everyone"
  ON homepage_sections FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage homepage sections"
  ON homepage_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- ADMIN FUNCTIONS
-- =====================================================

-- Function to get reported posts for admin
CREATE OR REPLACE FUNCTION get_reported_posts()
RETURNS TABLE (
  report_id UUID,
  post_id UUID,
  post_title TEXT,
  post_description TEXT,
  post_status TEXT,
  post_author_id UUID,
  post_author_name TEXT,
  reporter_id UUID,
  reporter_name TEXT,
  reason TEXT,
  description TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT
    pr.id as report_id,
    pr.post_id,
    p.title as post_title,
    p.description as post_description,
    p.status as post_status,
    p.user_id as post_author_id,
    pa.full_name as post_author_name,
    pr.reporter_id,
    r.full_name as reporter_name,
    pr.reason,
    pr.description,
    pr.status,
    pr.created_at,
    pr.reviewed_by,
    pr.reviewed_at,
    pr.notes
  FROM post_reports pr
  JOIN posts p ON pr.post_id = p.id
  JOIN profiles pa ON p.user_id = pa.id
  JOIN profiles r ON pr.reporter_id = r.id
  WHERE pr.status = 'pending'
  ORDER BY pr.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin post access
CREATE OR REPLACE FUNCTION log_admin_post_access(
  p_admin_id UUID,
  p_post_id UUID,
  p_report_id UUID,
  p_action TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  INSERT INTO admin_post_access_log (admin_id, post_id, report_id, action, reason)
  VALUES (p_admin_id, p_post_id, p_report_id, p_action, p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update post_reports updated_at timestamp
CREATE OR REPLACE FUNCTION update_post_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update post_reports updated_at
DROP TRIGGER IF EXISTS post_reports_updated_at ON post_reports;
CREATE TRIGGER post_reports_updated_at
  BEFORE UPDATE ON post_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reports_updated_at();

-- Function to log admin message access
CREATE OR REPLACE FUNCTION log_admin_message_access(
  p_admin_id UUID,
  p_message_id UUID,
  p_report_id UUID,
  p_reason TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Insert access log
  INSERT INTO admin_message_access_logs (admin_id, message_id, report_id, reason)
  VALUES (p_admin_id, p_message_id, p_report_id, p_reason);

  -- Mark report as read if not already read
  UPDATE message_reports
  SET
    is_read = true,
    first_read_at = coalesce(first_read_at, NOW()),
    first_read_by = coalesce(first_read_by, p_admin_id)
  WHERE id = p_report_id AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get reported messages (for admin panel)
CREATE OR REPLACE FUNCTION get_reported_messages()
RETURNS TABLE (
  report_id UUID,
  message_id UUID,
  sender_id UUID,
  sender_name TEXT,
  receiver_id UUID,
  receiver_name TEXT,
  reporter_id UUID,
  reporter_name TEXT,
  reason TEXT,
  description TEXT,
  status TEXT,
  is_read BOOLEAN,
  first_read_at TIMESTAMP WITH TIME ZONE,
  first_read_by UUID,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT
    mr.id as report_id,
    m.id as message_id,
    m.sender_id,
    ps.full_name as sender_name,
    m.receiver_id,
    pr.full_name as receiver_name,
    mr.reporter_id,
    prep.full_name as reporter_name,
    mr.reason,
    mr.description,
    mr.status,
    mr.is_read,
    mr.first_read_at,
    mr.first_read_by,
    mr.created_at
  FROM message_reports mr
  JOIN messages m ON m.id = mr.message_id
  JOIN profiles ps ON ps.id = m.sender_id
  JOIN profiles pr ON pr.id = m.receiver_id
  JOIN profiles prep ON prep.id = mr.reporter_id
  WHERE mr.status = 'pending'
  ORDER BY mr.is_read ASC, mr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update homepage_sections updated_at timestamp
CREATE OR REPLACE FUNCTION update_homepage_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_homepage_sections_updated_at ON homepage_sections;
CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON homepage_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_homepage_sections_updated_at();

-- Function to reorder homepage sections
CREATE OR REPLACE FUNCTION reorder_homepage_sections(section_ids UUID[])
RETURNS VOID AS $$
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

-- =====================================================
-- INSERT DEFAULT HOMEPAGE SECTIONS
-- =====================================================

INSERT INTO homepage_sections (type, title, subtitle, sort_order, is_active, config) VALUES
  ('seeking_help', 'Szukają pomocy', 'Sprawdź kto potrzebuje Twoich usług', 1, true, '{"limit": 8, "post_type": "seeking", "show_see_all_button": true}'::jsonb),
  ('offering_help', 'Oferują pomoc', 'Znajdź ludzi w Twojej okolicy', 2, true, '{"limit": 8, "post_type": "offering", "show_see_all_button": true}'::jsonb),
  ('popular_categories', 'Popularne kategorie', 'Najpopularniejsze kategorie ogłoszeń', 3, true, '{"limit": 8}'::jsonb),
  ('newest_posts', 'Nowe ogłoszenia', 'Najnowsze ogłoszenia dodane przez użytkowników', 4, true, '{"limit": 8}'::jsonb),
  ('city_based', 'W Twoim mieście', 'Ogłoszenia z miasta', 5, true, '{"limit": 8, "use_geolocation": true, "show_see_all_button": true}'::jsonb),
  ('recently_viewed', 'Ostatnio wyświetlane', 'Ostatnio przeglądane ogłoszenia', 6, true, '{"limit": 8}'::jsonb)
ON CONFLICT DO NOTHING;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_reported_posts() TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_post_access(UUID, UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_message_access(UUID, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_reported_messages() TO authenticated;
GRANT EXECUTE ON FUNCTION reorder_homepage_sections(UUID[]) TO authenticated;
