-- Set replica identity to FULL for activity_logs to enable realtime
alter table activity_logs replica identity full;

-- Make sure the table is in the realtime publication
do $$
begin
  -- Check if table is already in publication
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
    and schemaname = 'public'
    and tablename = 'activity_logs'
  ) then
    -- Add table to publication if not already there
    alter publication supabase_realtime add table activity_logs;
  end if;
end $$;
