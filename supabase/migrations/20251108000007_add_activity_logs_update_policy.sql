-- Add UPDATE policy for activity_logs so users can mark their notifications as read
create policy "Users can update their own activity logs"
  on activity_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
