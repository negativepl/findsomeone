-- Create function to increment phone_clicks
CREATE OR REPLACE FUNCTION increment_phone_clicks(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET phone_clicks = COALESCE(phone_clicks, 0) + 1
  WHERE id = post_id;
END;
$$;
