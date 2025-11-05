-- Fix get_popular_categories function to handle VARCHAR icon column
-- Modified to show all categories (even without posts), sorted by post count
-- Counts posts from main category AND all subcategories

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
    c.name::TEXT,
    c.slug::TEXT,
    c.icon::TEXT,
    c.description::TEXT,
    (
      -- Count posts directly in this category
      SELECT COUNT(*)::BIGINT
      FROM posts p
      WHERE p.category_id = c.id
        AND p.status = 'active'
        AND p.is_deleted = false
    ) + (
      -- Count posts in all subcategories
      SELECT COUNT(*)::BIGINT
      FROM posts p
      INNER JOIN categories sub ON p.category_id = sub.id
      WHERE sub.parent_id = c.id
        AND p.status = 'active'
        AND p.is_deleted = false
    ) as post_count
  FROM categories c
  WHERE c.parent_id IS NULL  -- Only main categories
  ORDER BY post_count DESC, c.name ASC
  LIMIT limit_count;
END;
$$;
