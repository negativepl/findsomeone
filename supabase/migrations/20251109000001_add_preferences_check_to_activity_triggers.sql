-- Update log_activity function to check user preferences
create or replace function log_activity(
  p_user_id uuid,
  p_activity_type text,
  p_post_id uuid default null,
  p_metadata jsonb default null
)
returns void as $$
declare
  user_wants_notification boolean := true;
begin
  -- Check user preferences based on activity type
  case p_activity_type
    when 'favorite_added' then
      select COALESCE(favorite_notifications, true) into user_wants_notification
      from profiles where id = p_user_id;

    when 'message_received' then
      select COALESCE(message_notifications, true) into user_wants_notification
      from profiles where id = p_user_id;

    when 'review_received' then
      select COALESCE(review_notifications, true) into user_wants_notification
      from profiles where id = p_user_id;

    else
      -- For other activity types (post_created, post_viewed, etc.), always log
      user_wants_notification := true;
  end case;

  -- Only insert if user wants this type of notification
  if user_wants_notification then
    insert into activity_logs (user_id, activity_type, post_id, metadata)
    values (p_user_id, p_activity_type, p_post_id, p_metadata);
  end if;

exception
  when others then
    -- Silently fail if there's an error
    null;
end;
$$ language plpgsql security definer;

-- Update favorite trigger to use correct post owner
create or replace function log_favorite_added()
returns trigger as $$
begin
  -- Log activity for the POST OWNER (not the person adding to favorites)
  perform log_activity(
    (select user_id from posts where id = NEW.post_id),
    'favorite_added',
    NEW.post_id,
    jsonb_build_object(
      'post_title', (select title from posts where id = NEW.post_id),
      'favorited_by', NEW.user_id
    )
  );
  return NEW;
end;
$$ language plpgsql;

-- Update message trigger to check preferences via log_activity
create or replace function log_message_received()
returns trigger as $$
begin
  perform log_activity(
    NEW.receiver_id,
    'message_received',
    NEW.post_id,
    jsonb_build_object(
      'sender_id', NEW.sender_id,
      'sender_name', (select full_name from profiles where id = NEW.sender_id)
    )
  );
  return NEW;
end;
$$ language plpgsql;
