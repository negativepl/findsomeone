-- Add DELETE policy for activity_logs so users can delete their own notifications
create policy "Users can delete their own activity logs"
  on activity_logs for delete
  using (auth.uid() = user_id);
