-- Remove existing post_viewed activity logs
delete from activity_logs where activity_type = 'post_viewed';

-- Update record_post_view function to NOT create activity logs for views
create or replace function record_post_view(
  p_post_id uuid,
  p_user_id uuid default null
)
returns void as $$
begin
  -- Insert view record
  insert into post_views (post_id, user_id)
  values (p_post_id, p_user_id);

  -- Increment post views counter
  update posts
  set views = views + 1
  where id = p_post_id;

  -- Note: We no longer create activity_logs for post views
  -- Views are still tracked in post_views table and counted in posts.views

exception
  when others then
    -- Silently fail if there's an error (e.g., duplicate view tracking)
    null;
end;
$$ language plpgsql security definer;

-- Grant execute permissions
grant execute on function record_post_view(uuid, uuid) to anon, authenticated;
