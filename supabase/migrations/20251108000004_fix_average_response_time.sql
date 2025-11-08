-- Drop and recreate the function with better logic
drop function if exists calculate_average_response_time(uuid, int);

create or replace function calculate_average_response_time(
  p_user_id uuid,
  p_days_back int default 7
)
returns float as $$
declare
  avg_minutes float;
begin
  -- Calculate average response time in minutes
  -- For each conversation, find messages where:
  -- 1. Current message sender is p_user_id
  -- 2. Previous message sender was different (meaning this is a response)
  with conversation_messages as (
    -- Get all messages in conversations where the user participated
    select
      m.id,
      m.post_id,
      m.sender_id,
      m.receiver_id,
      m.created_at,
      -- Create conversation ID (same for both directions)
      least(m.sender_id, m.receiver_id) || '-' || greatest(m.sender_id, m.receiver_id) as conversation_id
    from messages m
    where (m.sender_id = p_user_id or m.receiver_id = p_user_id)
      and m.created_at >= now() - (p_days_back || ' days')::interval
  ),
  messages_with_prev as (
    -- Add previous sender info
    select
      cm.*,
      lag(cm.sender_id) over (partition by cm.conversation_id, cm.post_id order by cm.created_at) as prev_sender_id,
      lag(cm.created_at) over (partition by cm.conversation_id, cm.post_id order by cm.created_at) as prev_created_at
    from conversation_messages cm
  ),
  user_responses as (
    -- Only count messages where user is responding to someone else
    select
      extract(epoch from (created_at - prev_created_at)) / 60 as response_minutes
    from messages_with_prev
    where sender_id = p_user_id
      and prev_sender_id is not null
      and prev_sender_id != sender_id
      and prev_created_at is not null
  )
  select avg(response_minutes) into avg_minutes
  from user_responses;

  return coalesce(avg_minutes, 0);
end;
$$ language plpgsql security definer;

-- Grant execute permissions
grant execute on function calculate_average_response_time(uuid, int) to authenticated, anon;
