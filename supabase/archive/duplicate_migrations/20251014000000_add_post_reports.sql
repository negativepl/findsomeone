-- Create post_reports table
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

  -- Prevent duplicate reports from same user for same post
  UNIQUE(post_id, reporter_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS post_reports_post_id_idx ON post_reports(post_id);
CREATE INDEX IF NOT EXISTS post_reports_reporter_id_idx ON post_reports(reporter_id);
CREATE INDEX IF NOT EXISTS post_reports_status_idx ON post_reports(status);
CREATE INDEX IF NOT EXISTS post_reports_created_at_idx ON post_reports(created_at DESC);

-- Create admin_post_access_log table for audit trail
CREATE TABLE IF NOT EXISTS admin_post_access_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  report_id UUID REFERENCES post_reports(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for audit log
CREATE INDEX IF NOT EXISTS admin_post_access_log_admin_id_idx ON admin_post_access_log(admin_id);
CREATE INDEX IF NOT EXISTS admin_post_access_log_post_id_idx ON admin_post_access_log(post_id);
CREATE INDEX IF NOT EXISTS admin_post_access_log_report_id_idx ON admin_post_access_log(report_id);
CREATE INDEX IF NOT EXISTS admin_post_access_log_created_at_idx ON admin_post_access_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_post_access_log ENABLE ROW LEVEL SECURITY;

-- Post reports policies
-- Users can view only their own reports
CREATE POLICY "Users can view own reports"
  ON post_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON post_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Admin post access log policies
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON admin_post_access_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

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
CREATE TRIGGER post_reports_updated_at
  BEFORE UPDATE ON post_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reports_updated_at();

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_reported_posts() TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_post_access(UUID, UUID, UUID, TEXT, TEXT) TO authenticated;
