-- Remove and re-add activity_logs to realtime publication to fix schema mismatch
-- This forces Realtime to reload the current table schema

-- Remove from publication (if it exists)
do $$
begin
  -- Try to drop the table from publication
  alter publication supabase_realtime drop table activity_logs;
exception
  when others then
    -- Ignore error if table is not in publication
    null;
end $$;

-- Re-add to publication with current schema
alter publication supabase_realtime add table activity_logs;

-- Ensure replica identity is set
alter table activity_logs replica identity full;
