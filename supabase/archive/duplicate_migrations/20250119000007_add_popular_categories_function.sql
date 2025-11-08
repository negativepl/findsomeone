-- Create function to get popular categories with post counts

CREATE OR REPLACE FUNCTION get_popular_categories(limit_count INT DEFAULT 8)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  icon TEXT,
  description TEXT,
  post_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.slug,
    c.icon,
    c.description,
    COUNT(p.id)::BIGINT as post_count
  FROM categories c
  LEFT JOIN posts p ON p.category_id = c.id AND p.status = 'active' AND p.is_deleted = false
  WHERE c.parent_id IS NULL  -- Only main categories
  GROUP BY c.id, c.name, c.slug, c.icon, c.description
  HAVING COUNT(p.id) > 0  -- Only categories with posts
  ORDER BY post_count DESC, c.name ASC
  LIMIT limit_count;
END;
$$;
