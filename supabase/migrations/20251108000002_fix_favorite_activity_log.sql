-- Fix favorite trigger to log activity for POST OWNER, not the person adding to favorites
create or replace function log_favorite_added()
returns trigger as $$
begin
  -- Log activity for the POST OWNER (not the person adding to favorites)
  insert into activity_logs (user_id, activity_type, post_id, metadata)
  select
    posts.user_id,  -- This is the post owner, not NEW.user_id (person adding favorite)
    'favorite_added',
    NEW.post_id,
    jsonb_build_object(
      'post_title', posts.title,
      'favorited_by', NEW.user_id  -- Store who added it to favorites
    )
  from posts
  where posts.id = NEW.post_id;

  return NEW;
end;
$$ language plpgsql;

-- Recreate the trigger
drop trigger if exists on_favorite_added on favorites;
create trigger on_favorite_added
  after insert on favorites
  for each row
  execute function log_favorite_added();

-- Clean up old incorrect favorite_added logs
-- These are logs where the person adding to favorites got the notification
-- instead of the post owner
delete from activity_logs
where activity_type = 'favorite_added'
  and post_id is not null
  and user_id != (select user_id from posts where posts.id = activity_logs.post_id);

-- Add some mock post_views data for testing user (only if needed)
-- This will add views for the last 7 days
do $$
declare
  target_user_id uuid := '25639a62-e695-4c04-b4e7-3018974c50a1';
  user_post_ids uuid[];
  days_ago int;
  views_per_day int;
  i int;
begin
  -- Get all active posts for this user
  select array_agg(id) into user_post_ids
  from posts
  where user_id = target_user_id
    and status = 'active';

  -- Only proceed if user has posts
  if array_length(user_post_ids, 1) > 0 then
    -- Add views for the last 7 days
    for days_ago in 0..6 loop
      -- Random number of views per day (between 5 and 25)
      views_per_day := floor(random() * 20 + 5)::int;

      for i in 1..views_per_day loop
        -- Pick a random post from user's posts
        insert into post_views (post_id, user_id, created_at)
        values (
          user_post_ids[floor(random() * array_length(user_post_ids, 1) + 1)],
          null,  -- Anonymous view
          now() - (days_ago || ' days')::interval - (floor(random() * 86400) || ' seconds')::interval
        );
      end loop;
    end loop;

    -- Also update the views counter on posts
    update posts
    set views = (
      select count(*)
      from post_views
      where post_views.post_id = posts.id
    )
    where user_id = target_user_id;
  end if;
end $$;
