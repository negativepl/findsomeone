-- Function to send push notification via Edge Function
create or replace function send_push_notification_trigger()
returns trigger as $$
declare
  notification_title text;
  notification_body text;
  notification_url text;
begin
  -- Build notification content based on activity type
  case NEW.activity_type
    when 'favorite_added' then
      notification_title := 'Nowy ulubiony!';
      notification_body := 'Ktoś dodał "' || (NEW.metadata->>'post_title') || '" do ulubionych';
      notification_url := '/dashboard/my-posts/' || NEW.post_id;

    when 'message_received' then
      notification_title := 'Nowa wiadomość';
      notification_body := 'Wiadomość od ' || COALESCE((NEW.metadata->>'sender_name'), 'użytkownika');
      notification_url := '/dashboard/messages';

    when 'review_received' then
      notification_title := 'Nowa opinia';
      notification_body := 'Otrzymałeś nową opinię';
      notification_url := '/dashboard';

    else
      notification_title := 'Nowe powiadomienie';
      notification_body := 'Masz nowe powiadomienie w FindSomeone';
      notification_url := '/dashboard';
  end case;

  -- Call Edge Function to send push notification
  -- Using pg_net to make async HTTP request
  -- Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in Supabase secrets/env
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

  return NEW;
exception
  when others then
    -- Log error but don't fail the insert
    raise warning 'Failed to send push notification: %', SQLERRM;
    return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger for new activity logs
drop trigger if exists on_activity_log_created on activity_logs;
create trigger on_activity_log_created
  after insert on activity_logs
  for each row
  execute function send_push_notification_trigger();

-- Set configuration for Supabase URL and Service Role Key
-- These need to be set in Supabase dashboard or via SQL
-- For now, we'll use ALTER DATABASE to set them (you'll need to update these values)
comment on function send_push_notification_trigger() is
  'Sends push notification via Edge Function when new activity_log is created.
   Requires app.supabase_url and app.supabase_service_role_key to be configured.';
