-- Create push_subscriptions table for Web Push notifications
create table if not exists push_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  endpoint text not null,
  keys jsonb not null, -- Contains p256dh and auth keys
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Prevent duplicate subscriptions
  unique(user_id, endpoint)
);

-- Create index for faster lookups
create index if not exists push_subscriptions_user_id_idx on push_subscriptions(user_id);

-- Enable RLS
alter table push_subscriptions enable row level security;

-- RLS policies
create policy "Users can view their own push subscriptions"
  on push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own push subscriptions"
  on push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own push subscriptions"
  on push_subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own push subscriptions"
  on push_subscriptions for delete
  using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function update_push_subscription_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger update_push_subscriptions_updated_at
  before update on push_subscriptions
  for each row
  execute function update_push_subscription_updated_at();

-- Comment for documentation
comment on table push_subscriptions is 'Stores Web Push notification subscriptions for users';
