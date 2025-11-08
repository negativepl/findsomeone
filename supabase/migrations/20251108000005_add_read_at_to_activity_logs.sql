-- Add read_at column to activity_logs table
alter table activity_logs
add column read_at timestamp with time zone;

-- Create index for faster queries on unread notifications
create index idx_activity_logs_user_unread on activity_logs(user_id, read_at) where read_at is null;

-- Add comment
comment on column activity_logs.read_at is 'Timestamp when the user read this notification';
