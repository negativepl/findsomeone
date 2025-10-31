-- Function to increment post views
-- This function can be called by anyone (even anonymous users) to increment view count
create or replace function increment_post_views(post_id uuid)
returns void as $$
begin
  update posts
  set views = views + 1
  where id = post_id;
end;
$$ language plpgsql security definer;

-- Grant execute permission to anonymous and authenticated users
grant execute on function increment_post_views(uuid) to anon, authenticated;
