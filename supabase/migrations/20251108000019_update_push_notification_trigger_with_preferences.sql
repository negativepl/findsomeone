-- Update function to check user notification preferences before sending
create or replace function send_push_notification_trigger()
returns trigger as $$
declare
  notification_title text;
  notification_body text;
  notification_url text;
  user_preferences record;
  should_send boolean := false;
begin
  -- Get user notification preferences
  select
    message_notifications,
    favorite_notifications,
    review_notifications
  into user_preferences
  from profiles
  where id = NEW.user_id;

  -- Check if user wants this type of notification
  case NEW.activity_type
    when 'favorite_added' then
      should_send := COALESCE(user_preferences.favorite_notifications, true);
      notification_title := 'Nowy ulubiony!';
      notification_body := 'Ktoś dodał "' || (NEW.metadata->>'post_title') || '" do ulubionych';
      notification_url := '/dashboard/my-posts/' || NEW.post_id;

    when 'message_received' then
      should_send := COALESCE(user_preferences.message_notifications, true);
      notification_title := 'Nowa wiadomość';
      notification_body := 'Wiadomość od ' || COALESCE((NEW.metadata->>'sender_name'), 'użytkownika');
      notification_url := '/dashboard/messages';

    when 'review_received' then
      should_send := COALESCE(user_preferences.review_notifications, true);
      notification_title := 'Nowa opinia';
      notification_body := 'Otrzymałeś nową opinię';
      notification_url := '/dashboard';

    else
      should_send := true;
      notification_title := 'Nowe powiadomienie';
      notification_body := 'Masz nowe powiadomienie w FindSomeone';
      notification_url := '/dashboard';
  end case;

  -- Only send if user wants this type of notification
  if should_send then
    -- Call Edge Function to send push notification
    perform net.http_post(
      url := 'https://muotqfczovjxckzucnhh.supabase.co/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
      ),
      body := jsonb_build_object(
        'userId', NEW.user_id,
        'title', notification_title,
        'body', notification_body,
        'url', notification_url,
        'notificationId', NEW.id
      )
    );
  end if;

  return NEW;
exception
  when others then
    -- Log error but don't fail the insert
    raise warning 'Failed to send push notification: %', SQLERRM;
    return NEW;
end;
$$ language plpgsql security definer;

-- Comment update
comment on function send_push_notification_trigger() is
  'Sends push notification via Edge Function when new activity_log is created.
   Checks user notification preferences before sending.
   Requires supabase.service_role_key to be configured.';
