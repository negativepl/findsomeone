-- Function to calculate average response time for a user
-- Only counts time when sender changes (to prevent gaming the system)
create or replace function calculate_average_response_time(
  p_user_id uuid,
  p_days_back int default 7
)
returns float as $$
declare
  avg_minutes float;
begin
  -- Calculate average response time in minutes
  -- Only count messages where the previous message in the conversation was from a different person
  with user_messages as (
    select
      m.id,
      m.post_id,
      m.sender_id,
      m.receiver_id,
      m.created_at,
      lag(m.sender_id) over (partition by m.post_id,
        least(m.sender_id, m.receiver_id),
        greatest(m.sender_id, m.receiver_id)
        order by m.created_at) as prev_sender_id,
      lag(m.created_at) over (partition by m.post_id,
        least(m.sender_id, m.receiver_id),
        greatest(m.sender_id, m.receiver_id)
        order by m.created_at) as prev_created_at
    from messages m
    where m.sender_id = p_user_id
      and m.created_at >= now() - (p_days_back || ' days')::interval
  ),
  response_times as (
    select
      extract(epoch from (created_at - prev_created_at)) / 60 as minutes
    from user_messages
    where prev_sender_id is not null
      and prev_sender_id != sender_id  -- Only count when sender changes
      and prev_created_at is not null
  )
  select avg(minutes) into avg_minutes
  from response_times;

  return coalesce(avg_minutes, 0);
end;
$$ language plpgsql security definer;

-- Grant execute permissions
grant execute on function calculate_average_response_time(uuid, int) to authenticated;
