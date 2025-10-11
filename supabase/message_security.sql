-- Additional security measures for messages

-- 1. Add constraint to prevent sending messages to yourself
alter table messages
add constraint check_not_self_message
check (sender_id != receiver_id);

-- 2. Function to check message rate limiting
-- Prevents spam by limiting messages per user per hour
create or replace function check_message_rate_limit(user_id uuid)
returns boolean as $$
declare
  message_count integer;
begin
  -- Count messages sent by this user in the last hour
  select count(*) into message_count
  from messages
  where sender_id = user_id
    and created_at > now() - interval '1 hour';

  -- Allow max 20 messages per hour
  return message_count < 20;
end;
$$ language plpgsql security definer;

-- 3. Function to check if user is sending too many messages to same person
create or replace function check_conversation_spam(sender uuid, receiver uuid)
returns boolean as $$
declare
  recent_messages integer;
begin
  -- Count messages sent to this specific person in last 5 minutes
  select count(*) into recent_messages
  from messages
  where sender_id = sender
    and receiver_id = receiver
    and created_at > now() - interval '5 minutes';

  -- Allow max 3 messages per 5 minutes to the same person
  return recent_messages < 3;
end;
$$ language plpgsql security definer;

-- 4. Add minimum content length check (prevent empty/useless messages)
alter table messages
add constraint check_message_min_length
check (char_length(trim(content)) >= 10);

-- 5. Add maximum content length check (prevent abuse)
alter table messages
add constraint check_message_max_length
check (char_length(content) <= 2000);

-- 6. Update messages policy to include rate limiting
drop policy if exists "Users can send messages" on messages;

create policy "Users can send messages"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and sender_id != receiver_id
    and check_message_rate_limit(sender_id)
    and check_conversation_spam(sender_id, receiver_id)
  );

-- Grant permissions
grant execute on function check_message_rate_limit(uuid) to authenticated;
grant execute on function check_conversation_spam(uuid, uuid) to authenticated;
