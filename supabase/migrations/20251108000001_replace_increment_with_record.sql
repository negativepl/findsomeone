-- Drop old increment_post_views function if it exists
drop function if exists increment_post_views(uuid);

-- Make sure record_post_view function exists and is correct
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

  -- Log activity for post owner (not the viewer)
  insert into activity_logs (user_id, activity_type, post_id, metadata)
  select
    posts.user_id,
    'post_viewed',
    p_post_id,
    jsonb_build_object(
      'post_title', posts.title,
      'viewer_id', p_user_id
    )
  from posts
  where posts.id = p_post_id;

exception
  when others then
    -- Silently fail if there's an error (e.g., duplicate view tracking)
    null;
end;
$$ language plpgsql security definer;

-- Grant execute permissions
grant execute on function record_post_view(uuid, uuid) to anon, authenticated;
