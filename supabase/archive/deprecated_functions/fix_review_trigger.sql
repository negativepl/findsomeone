-- Fix the review trigger to properly update ratings
-- This ensures ratings are calculated correctly after adding a review

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_review_created ON reviews;
DROP TRIGGER IF EXISTS on_review_updated ON reviews;
DROP TRIGGER IF EXISTS on_review_deleted ON reviews;
DROP FUNCTION IF EXISTS update_profile_rating();

-- Create improved function to update profile rating
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Determine which user's rating needs to be updated
  IF TG_OP = 'DELETE' THEN
    target_user_id := OLD.reviewed_id;
  ELSE
    target_user_id := NEW.reviewed_id;
  END IF;

  -- Update the profile with new rating and review count
  UPDATE profiles
  SET
    rating = COALESCE((
      SELECT AVG(rating)::numeric(3,2)
      FROM reviews
      WHERE reviewed_id = target_user_id
    ), 0),
    total_reviews = COALESCE((
      SELECT COUNT(*)::integer
      FROM reviews
      WHERE reviewed_id = target_user_id
    ), 0)
  WHERE id = target_user_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for INSERT, UPDATE, and DELETE
CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_rating();

CREATE TRIGGER on_review_updated
  AFTER UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_rating();

CREATE TRIGGER on_review_deleted
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_rating();

-- Manually recalculate all existing ratings (run this once to fix existing data)
UPDATE profiles p
SET
  rating = COALESCE((
    SELECT AVG(rating)::numeric(3,2)
    FROM reviews r
    WHERE r.reviewed_id = p.id
  ), 0),
  total_reviews = COALESCE((
    SELECT COUNT(*)::integer
    FROM reviews r
    WHERE r.reviewed_id = p.id
  ), 0);
