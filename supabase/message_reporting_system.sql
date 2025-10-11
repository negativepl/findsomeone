-- Message reporting system for abuse/spam
-- Required for GDPR compliance and moderation

-- Table for message reports
create table if not exists message_reports (
  id uuid default uuid_generate_v4() primary key,
  message_id uuid references messages(id) on delete cascade not null,
  reporter_id uuid references profiles(id) on delete cascade not null,
  reason text not null check (reason in ('spam', 'harassment', 'inappropriate', 'scam', 'other')),
  description text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamp with time zone,
  notes text, -- Admin notes
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(message_id, reporter_id) -- User can report same message only once
);

-- Enable RLS
alter table message_reports enable row level security;

-- Users can create reports
create policy "Users can report messages"
  on message_reports for insert
  with check (auth.uid() = reporter_id);

-- Users can view their own reports
create policy "Users can view their own reports"
  on message_reports for select
  using (auth.uid() = reporter_id);

-- Create indexes
create index message_reports_message_id_idx on message_reports(message_id);
create index message_reports_reporter_id_idx on message_reports(reporter_id);
create index message_reports_status_idx on message_reports(status);

-- Table for admin access logs (audit trail)
create table if not exists admin_message_access_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references profiles(id) on delete cascade not null,
  message_id uuid references messages(id) on delete cascade not null,
  report_id uuid references message_reports(id) on delete set null,
  reason text not null, -- Why admin accessed this message
  accessed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table admin_message_access_logs enable row level security;

-- Only admins can access logs (will be implemented with role check)
-- For now, no one can access through regular queries
create policy "No public access to admin logs"
  on admin_message_access_logs for all
  using (false);

-- Create index
create index admin_logs_admin_id_idx on admin_message_access_logs(admin_id);
create index admin_logs_message_id_idx on admin_message_access_logs(message_id);
create index admin_logs_accessed_at_idx on admin_message_access_logs(accessed_at desc);

-- Function to log admin access
create or replace function log_admin_message_access(
  p_admin_id uuid,
  p_message_id uuid,
  p_report_id uuid,
  p_reason text
)
returns void as $$
begin
  insert into admin_message_access_logs (admin_id, message_id, report_id, reason)
  values (p_admin_id, p_message_id, p_report_id, p_reason);
end;
$$ language plpgsql security definer;

-- Grant execute permission to admins only
-- (This will be controlled by your admin system)
grant execute on function log_admin_message_access(uuid, uuid, uuid, text) to authenticated;

-- Function to get reported messages (for admin panel)
-- This bypasses RLS for admins only
create or replace function get_reported_messages()
returns table (
  report_id uuid,
  message_id uuid,
  message_content text,
  sender_id uuid,
  sender_name text,
  receiver_id uuid,
  receiver_name text,
  reporter_id uuid,
  reporter_name text,
  reason text,
  description text,
  status text,
  created_at timestamp with time zone
) as $$
begin
  -- Check if user is admin
  if not exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Access denied. Admin role required.';
  end if;

  return query
  select
    mr.id as report_id,
    m.id as message_id,
    m.content as message_content,
    m.sender_id,
    ps.full_name as sender_name,
    m.receiver_id,
    pr.full_name as receiver_name,
    mr.reporter_id,
    prep.full_name as reporter_name,
    mr.reason,
    mr.description,
    mr.status,
    mr.created_at
  from message_reports mr
  join messages m on m.id = mr.message_id
  join profiles ps on ps.id = m.sender_id
  join profiles pr on pr.id = m.receiver_id
  join profiles prep on prep.id = mr.reporter_id
  where mr.status = 'pending'
  order by mr.created_at desc;
end;
$$ language plpgsql security definer;

grant execute on function get_reported_messages() to authenticated;

-- Add comment for documentation
comment on table message_reports is 'Stores user reports of inappropriate messages. Required for GDPR compliance and content moderation.';
comment on table admin_message_access_logs is 'Audit trail of admin access to private messages. Required for GDPR accountability.';
