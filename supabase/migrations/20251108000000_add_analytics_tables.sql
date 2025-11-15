-- Add post_views table to track individual views with timestamps
create table if not exists post_views (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete set null, -- nullable for anonymous views
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add activity_logs table for activity feed
create table if not exists activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  activity_type text not null check (activity_type in ('post_created', 'post_viewed', 'message_received', 'message_sent', 'favorite_added', 'review_received')),
  post_id uuid references posts(id) on delete cascade,
  metadata jsonb, -- for storing additional data like post title, sender name, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists post_views_post_id_idx on post_views(post_id);
create index if not exists post_views_created_at_idx on post_views(created_at desc);
create index if not exists post_views_user_id_idx on post_views(user_id);
create index if not exists activity_logs_user_id_idx on activity_logs(user_id);
create index if not exists activity_logs_created_at_idx on activity_logs(created_at desc);
create index if not exists activity_logs_activity_type_idx on activity_logs(activity_type);

-- Enable Row Level Security
alter table post_views enable row level security;
alter table activity_logs enable row level security;

-- post_views policies
create policy "Anyone can create post views"
  on post_views for insert
  with check (true);

create policy "Post owners can view their post views"
  on post_views for select
  using (
    post_id in (
      select id from posts where user_id = auth.uid()
    )
  );

-- activity_logs policies
create policy "Users can view their own activity logs"
  on activity_logs for select
  using (auth.uid() = user_id);

create policy "System can insert activity logs"
  on activity_logs for insert
  with check (true);

-- Function to record post view and increment counter
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

-- Function to log activity
create or replace function log_activity(
  p_user_id uuid,
  p_activity_type text,
  p_post_id uuid default null,
  p_metadata jsonb default null
)
returns void as $$
begin
  insert into activity_logs (user_id, activity_type, post_id, metadata)
  values (p_user_id, p_activity_type, p_post_id, p_metadata);
exception
  when others then
    -- Silently fail if there's an error
    null;
end;
$$ language plpgsql security definer;

-- Trigger to log when a new post is created
-- DISABLED: Users shouldn't get notifications about their own posts
-- create or replace function log_post_created()
-- returns trigger as $$
-- begin
--   perform log_activity(
--     NEW.user_id,
--     'post_created',
--     NEW.id,
--     jsonb_build_object('post_title', NEW.title)
--   );
--   return NEW;
-- end;
-- $$ language plpgsql;

-- drop trigger if exists on_post_created on posts;
-- create trigger on_post_created
--   after insert on posts
--   for each row
--   execute function log_post_created();

-- Trigger to log when a message is received
create or replace function log_message_received()
returns trigger as $$
begin
  perform log_activity(
    NEW.receiver_id,
    'message_received',
    NEW.post_id,
    jsonb_build_object(
      'sender_id', NEW.sender_id,
      'sender_name', (select full_name from profiles where id = NEW.sender_id)
    )
  );
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists on_message_created on messages;
create trigger on_message_created
  after insert on messages
  for each row
  execute function log_message_received();

-- Trigger to log when a favorite is added
create or replace function log_favorite_added()
returns trigger as $$
begin
  perform log_activity(
    NEW.user_id,
    'favorite_added',
    NEW.post_id,
    jsonb_build_object(
      'post_title', (select title from posts where id = NEW.post_id)
    )
  );
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists on_favorite_added on favorites;
create trigger on_favorite_added
  after insert on favorites
  for each row
  execute function log_favorite_added();

-- Grant execute permissions
grant execute on function record_post_view(uuid, uuid) to anon, authenticated;
grant execute on function log_activity(uuid, text, uuid, jsonb) to anon, authenticated;

-- Create a view for dashboard analytics
create or replace view dashboard_analytics as
select
  p.user_id,
  count(distinct pv.id) as total_views_last_7_days,
  count(distinct case when pv.created_at >= now() - interval '7 days' then pv.id end) as views_last_7_days,
  count(distinct case when pv.created_at >= now() - interval '30 days' then pv.id end) as views_last_30_days,
  count(distinct case when pv.created_at >= now() - interval '14 days' and pv.created_at < now() - interval '7 days' then pv.id end) as views_previous_7_days,
  count(distinct m.id) filter (where m.created_at >= now() - interval '7 days') as messages_last_7_days,
  count(distinct m.id) filter (where m.created_at >= now() - interval '30 days') as messages_last_30_days
from profiles pr
left join posts p on pr.id = p.user_id and p.status = 'active'
left join post_views pv on p.id = pv.post_id
left join messages m on pr.id = m.receiver_id
group by p.user_id;

-- Grant select on view
grant select on dashboard_analytics to authenticated;
