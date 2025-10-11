-- Real-time presence and typing indicators

-- Table to track user presence (online/offline)
create table if not exists user_presence (
  user_id uuid references profiles(id) on delete cascade primary key,
  status text check (status in ('online', 'offline', 'away')) default 'offline',
  last_seen timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table user_presence enable row level security;

-- Everyone can view presence
create policy "User presence is viewable by everyone"
  on user_presence for select
  using (true);

-- Users can update their own presence
create policy "Users can update own presence"
  on user_presence for insert
  with check (auth.uid() = user_id);

create policy "Users can update own presence status"
  on user_presence for update
  using (auth.uid() = user_id);

-- Function to update user presence
create or replace function update_user_presence(user_status text)
returns void as $$
begin
  insert into user_presence (user_id, status, last_seen, updated_at)
  values (auth.uid(), user_status, now(), now())
  on conflict (user_id)
  do update set
    status = user_status,
    last_seen = now(),
    updated_at = now();
end;
$$ language plpgsql security definer;

-- Grant permissions
grant execute on function update_user_presence(text) to authenticated;

-- Function to automatically mark users as offline after 5 minutes of inactivity
create or replace function cleanup_stale_presence()
returns void as $$
begin
  update user_presence
  set status = 'offline'
  where status = 'online'
    and last_seen < now() - interval '5 minutes';
end;
$$ language plpgsql security definer;

-- Index for better performance
create index if not exists user_presence_status_idx on user_presence(status);
create index if not exists user_presence_last_seen_idx on user_presence(last_seen);

-- Enable realtime for user_presence table
alter publication supabase_realtime add table user_presence;
