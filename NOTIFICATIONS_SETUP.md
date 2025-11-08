# Notifications System Setup Guide

This document describes the complete notification system in FindSomeone, including in-app notifications, push notifications, and user preferences.

## Overview

The notification system has two layers:
1. **In-app notifications** - shown in the notification bell within the application
2. **Push notifications** - native notifications sent to user's device (desktop/mobile)

Both layers respect user preferences set in Settings → Notifications.

## 1. Requirements

- Supabase project with pg_net extension enabled
- VAPID keys (generate your own)
- Supabase account with access to Edge Functions

## 2. Generate VAPID Keys

First, generate your VAPID keys:

```bash
npx web-push generate-vapid-keys
```

Add the generated keys to your `.env.local`:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key-here
VAPID_PRIVATE_KEY=your-private-key-here
```

**IMPORTANT:** Never commit these keys to git! Add `.env.local` to `.gitignore`.

## 3. Edge Function Configuration

### Deploy Edge Function

```bash
# Deploy the send-push-notification function
npx supabase functions deploy send-push-notification
```

### Set Secrets in Supabase

In Supabase Dashboard → Project Settings → Edge Functions → Secrets add:

```bash
# VAPID Keys (from your .env.local)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key-here
VAPID_PRIVATE_KEY=your-private-key-here

# Supabase (these should be available automatically)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Or use CLI:

```bash
npx supabase secrets set NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key-here
npx supabase secrets set VAPID_PRIVATE_KEY=your-private-key-here
```

## 4. Database Configuration

### Run Migrations

```bash
npx supabase db push
```

Migrations include:
- `push_subscriptions` table - stores push notification subscriptions per device
- `activity_logs` table - stores all notifications (in-app)
- User preference columns in `profiles` table:
  - `message_notifications` (boolean, default: true)
  - `favorite_notifications` (boolean, default: true)
  - `review_notifications` (boolean, default: true)
  - `vibration_enabled` (boolean, default: false)
- `log_activity()` function - checks preferences before creating notifications
- `send_push_notification_trigger()` - sends push notifications for activity logs
- Triggers for favorites, messages, and reviews

### Set Service Role Key in Database Config

**IMPORTANT:** The service role key is used by the trigger to authorize Edge Function calls.

In Supabase Dashboard → Settings → API → Project API keys, copy the `service_role` key.

Then execute in SQL Editor (replace `your-service-role-key-here` with your key):

```sql
-- Set service role key as PostgreSQL session parameter
-- This will be used by the trigger for authorization
alter database postgres set supabase.service_role_key = 'your-service-role-key-here';
```

**NOTE:** Never commit this key to git! Set it only through the Dashboard.

## 5. Verification

### Test Edge Function Manually

```bash
curl -X POST YOUR_SUPABASE_URL/functions/v1/send-push-notification \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "title": "Test",
    "body": "Test notification",
    "url": "/dashboard"
  }'
```

### Check Edge Function Logs

```bash
npx supabase functions logs send-push-notification
```

## 6. User Preferences

### Available Notification Settings

Users can control notifications in Settings → Notifications:

**Notification Types:**
1. **Email Notifications** (Coming soon) - notifications via email
2. **New Messages** - notifications when receiving new messages
3. **Added to Favorites** - notifications when someone favorites user's post
4. **New Reviews** - notifications when receiving reviews
5. **Push Notifications** - enable/disable push notifications on current device

**Preferences Settings:**
- **Vibrations** - haptic feedback on mobile devices (Android only, disabled on iOS and desktop)

### How It Works

**If user disables a notification type (e.g., "Added to Favorites"):**
- ❌ No entry is created in `activity_logs` (won't show in notification bell)
- ❌ No push notification is sent to their device
- Even if they have "Push notifications" enabled

**"Push Notifications" toggle:**
- Controls whether THIS device can receive push notifications
- Independent of notification type preferences
- If enabled, user will receive push for enabled notification types only

**Example:**
- Push notifications: ✅ Enabled
- New messages: ✅ Enabled
- Added to favorites: ❌ Disabled

Result: User receives push notifications for messages, but NOT for favorites.

### Automatic Sending

Notifications are sent automatically when:
- Someone adds a post to favorites (`favorite_added`)
- User receives a message (`message_received`)
- User receives a review (`review_received`)

The system checks user preferences before creating notifications.

## 7. Platforms

### Desktop
✅ All browsers support push notifications

### Android
✅ Chrome, Firefox, Edge, Samsung Internet - full support

### iOS
⚠️ Safari - only when PWA is added to home screen (iOS 16.4+):
1. Open the page in Safari
2. Click "Share" → "Add to Home Screen"
3. Open the app from the home screen icon
4. Then push notifications will work

## 8. Troubleshooting

### No Notifications at All (In-app or Push)

**Check user preferences first:**
```sql
SELECT
  email,
  message_notifications,
  favorite_notifications,
  review_notifications
FROM profiles
JOIN auth.users ON profiles.id = auth.users.id
WHERE auth.users.email = 'user-email@example.com';
```

If all are `false`, user has disabled notifications. This is expected behavior.

### Push Notifications Not Arriving (but in-app notifications work)

1. Check if user enabled push on their device:
```sql
SELECT * FROM push_subscriptions WHERE user_id = 'user-uuid';
```

2. Check Edge Function logs: `npx supabase functions logs send-push-notification`
3. Check if secrets are set: Dashboard → Edge Functions → Secrets
4. Verify trigger preferences are working correctly

### Notifications Arrive Despite Being Disabled

Check if migrations are up to date:
```sql
-- Should check preferences
SELECT prosrc FROM pg_proc WHERE proname = 'log_activity';
```

If it doesn't check preferences, run migration `20251109000001_add_preferences_check_to_activity_triggers.sql`

### Error "VAPID keys not configured"

Set secrets in Edge Functions (section 3)

### Error "Failed to send push notification"

Check if `supabase.service_role_key` is set in database config (section 4)

### Vibrations Not Working

- ✅ **Android**: Should work if enabled in preferences
- ❌ **iOS**: Not supported (vibration API not available)
- ❌ **Desktop**: Not supported (not a mobile device)

Check console for errors or user agent detection issues.

## 9. Technical Implementation

### Notification Flow

**When an action occurs (e.g., someone adds post to favorites):**

1. **Database Trigger Fires** (`log_favorite_added`)
   - Checks post owner's `favorite_notifications` preference
   - If `false`: stops here (no notification created)
   - If `true`: creates entry in `activity_logs`

2. **Activity Log Trigger Fires** (`send_push_notification_trigger`)
   - Reads notification preferences again from `profiles`
   - Checks if user wants push for this type
   - If yes: calls Edge Function to send push

3. **Edge Function** (`send-push-notification`)
   - Fetches all push subscriptions for user
   - Sends push notification to each device
   - Removes invalid subscriptions

4. **Service Worker** (`sw-push.js`)
   - Receives push on user's device
   - Shows native notification
   - Handles click to navigate to relevant page

### Key Functions

**`log_activity(user_id, activity_type, post_id, metadata)`**
- Central function for creating notifications
- Checks user preferences before inserting to `activity_logs`
- Called by all notification triggers

**`send_push_notification_trigger()`**
- PostgreSQL trigger on `activity_logs` table
- Fires AFTER INSERT
- Makes HTTP request to Edge Function via `pg_net`

## 10. Production

Before deploying to production:

1. ✅ Deploy Edge Function
2. ✅ Set all secrets
3. ✅ Run migrations
4. ✅ Set database config
5. ✅ Build PWA (PWA only works in production mode)
6. ✅ Test on real device
7. ✅ Test notification preferences
8. ✅ Verify vibrations work on Android

## Documentation

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [VAPID Keys](https://web.dev/push-notifications-web-push-protocol/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
