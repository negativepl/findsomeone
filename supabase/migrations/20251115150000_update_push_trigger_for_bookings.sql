-- =====================================================
-- UPDATE PUSH NOTIFICATION TRIGGER FOR BOOKINGS
-- =====================================================
-- Updates send_push_notification_trigger to support booking_request

CREATE OR REPLACE FUNCTION send_push_notification_trigger()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_body TEXT;
  notification_url TEXT;
  user_preferences RECORD;
  should_send BOOLEAN := false;
BEGIN
  -- Get user notification preferences
  SELECT
    message_notifications,
    favorite_notifications,
    review_notifications,
    booking_notifications
  INTO user_preferences
  FROM profiles
  WHERE id = NEW.user_id;

  -- Check if user wants this type of notification
  CASE NEW.activity_type
    WHEN 'favorite_added' THEN
      should_send := COALESCE(user_preferences.favorite_notifications, true);
      notification_title := 'Nowy ulubiony!';
      notification_body := 'Ktoś dodał "' || (NEW.metadata->>'post_title') || '" do ulubionych';
      notification_url := '/dashboard/my-posts/' || NEW.post_id;

    WHEN 'message_received' THEN
      should_send := COALESCE(user_preferences.message_notifications, true);
      notification_title := 'Nowa wiadomość';
      notification_body := 'Wiadomość od ' || COALESCE((NEW.metadata->>'sender_name'), 'użytkownika');
      notification_url := '/dashboard/messages';

    WHEN 'review_received' THEN
      should_send := COALESCE(user_preferences.review_notifications, true);
      notification_title := 'Nowa opinia';
      notification_body := 'Otrzymałeś nową opinię';
      notification_url := '/dashboard';

    WHEN 'booking_request' THEN
      should_send := COALESCE(user_preferences.booking_notifications, true);
      notification_title := 'Nowa rezerwacja!';
      notification_body := COALESCE((NEW.metadata->>'client_name'), 'Ktoś') || ' chce zarezerwować termin: ' ||
                          COALESCE((NEW.metadata->>'scheduled_date'), '') || ' o ' ||
                          COALESCE((NEW.metadata->>'scheduled_time'), '');
      notification_url := '/dashboard/bookings';

    ELSE
      should_send := true;
      notification_title := 'Nowe powiadomienie';
      notification_body := 'Masz nowe powiadomienie w FindSomeone';
      notification_url := '/dashboard';
  END CASE;

  -- Only send if user wants this type of notification
  IF should_send THEN
    -- Call Edge Function to send push notification
    PERFORM net.http_post(
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
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to send push notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION send_push_notification_trigger() IS
  'Sends push notification via Edge Function when new activity_log is created.
   Checks user notification preferences before sending.
   Supports booking_request activity type.
   Requires supabase.service_role_key to be configured.';
