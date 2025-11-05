# Post Expiration and Extension System - Implementation Guide

## What Has Been Implemented:

### 1. Database Migration
File: `supabase/migrations/20251016000000_add_post_expiration.sql`

**Added fields to `posts` table:**
- `expires_at` - expiration date (default: 30 days from creation)
- `extended_count` - extension counter
- `last_extended_at` - last extension date
- `expiration_notified_at` - last expiration notification date

**Added PostgreSQL functions:**
- `expire_old_posts()` - automatically expires posts
- `extend_post_expiration(post_id)` - extends post by 30 days
- `get_posts_expiring_soon(days_before)` - returns posts expiring soon

**Updated `price_type`:**
- Added `'free'` option
- Field is now required (`NOT NULL`)

### 2. API Endpoints
File: `app/api/posts/[id]/extend/route.ts`

**Endpoint: `POST /api/posts/[id]/extend`**
- Verifies post owner
- Extends expiration by 30 days
- Increments extension counter
- Resets notifications

### 3. Edge Functions (Supabase)
File: `supabase/functions/expire-posts/index.ts`
File: `supabase/functions/notify-expiring-posts/index.ts`

**expire-posts** - Automatic expiration:
- Runs daily (cron)
- Changes post status to 'closed' when `expires_at < NOW()`

**notify-expiring-posts** - Notifications:
- Runs daily (cron)
- Sends notifications 7, 3, and 1 day before expiration
- Requires email service configuration (TODO)

### 4. Post Creation Form
File: `app/dashboard/my-posts/new/NewPostClient.tsx`

**Changes:**
- Added "Free" option in `price_type`
- `price_type` field is now required
- Reorganized layout - price type at beginning
- Price fields (min/max) disabled when "Free" selected
- Updated summary (step 6) with "Free" support

### 5. "My Listings" Dashboard
File: `app/dashboard/my-posts/MyListingsClient.tsx`

**Added:**
- Display time until expiration (e.g., "Expires in 5 days")
- Red color for posts expiring within 7 days
- "Extend by 30 days" button (RefreshCw icon)
- `handleExtendPost()` function for extensions
- Support for `price_type: 'free'` in interface
- **NOTE**: Added only in mobile list view

---

## What Still Needs to Be Done:

### 1. **Run Database Migration**
```bash
# Connect to Supabase and run:
psql "$DATABASE_URL" -f supabase/migrations/20251016000000_add_post_expiration.sql
```

Or via Supabase Dashboard:
- SQL Editor → Paste migration file contents → Run

### 2. **Deploy Edge Functions**
```bash
# Log in to Supabase CLI
supabase login

# Deploy functions
supabase functions deploy expire-posts
supabase functions deploy notify-expiring-posts

# Set environment variables
supabase secrets set CRON_SECRET=your_secret_token_here
```

### 3. **Configure Cron Jobs**
In Supabase Dashboard → Database → Webhooks/Cron:

**Post expiration** (daily at 2:00 AM):
```
0 2 * * * curl -X POST https://your-project.supabase.co/functions/v1/expire-posts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Notifications** (daily at 9:00 AM):
```
0 9 * * * curl -X POST https://your-project.supabase.co/functions/v1/notify-expiring-posts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 4. **Add Expiration UI to Desktop Version**

In file `/Users/marcinbaszewski/findsomeone/app/dashboard/my-posts/MyListingsClient.tsx`:

**Desktop List View** (around line 676):
Add before `<Clock>` element:
```tsx
{post.status === 'active' && post.expires_at && (() => {
  const expiryInfo = getExpiryText(post.expires_at)
  return expiryInfo.text && (
    <div className={`flex items-center gap-1.5 ${expiryInfo.urgent ? 'text-[#C44E35] font-semibold' : ''}`}>
      <CalendarClock className="w-4 h-4" />
      <span>{expiryInfo.text}</span>
    </div>
  )
})()}
```

**Desktop Actions** (around line 696):
Add before `{post.status === 'active' && (`:
```tsx
{post.status === 'active' && post.expires_at && getDaysUntilExpiry(post.expires_at) !== null && getDaysUntilExpiry(post.expires_at)! <= 7 && (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={(e) => handleExtendPost(post.id, e)}
          className="h-10 w-10 rounded-full border-2 border-[#C44E35] bg-[#C44E35]/10 hover:bg-[#C44E35]/20 flex items-center justify-center transition-all relative z-20"
          disabled={isPending}
        >
          <RefreshCw className="w-4 h-4 text-[#C44E35]" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-[#FAF8F3] text-black border-black/10 rounded-xl" sideOffset={5}>
        <p>Extend by 30 days</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)}
```

### 5. **Update my-posts API**
File: `app/api/my-posts/route.ts` (if exists)

Make sure it returns new fields:
```ts
select(`
  *,
  expires_at,
  extended_count,
  profiles:user_id (...)
`)
```

### 6. **Update `/dashboard/my-posts/[id]/page.tsx`**
Add new fields to query:
```ts
.select('*, expires_at, extended_count, last_extended_at, ...')
```

### 7. **Configure Email Service** (for notifications)
In `supabase/functions/notify-expiring-posts/index.ts` you'll find commented TODO:
```ts
// TODO: Send actual notification via email service (Resend, SendGrid, etc.)
```

Example Resend integration:
```ts
import { Resend } from 'resend'
const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: post.user_email,
  subject: `Your listing expires in ${daysUntilExpiry} days`,
  html: `...`
})
```

### 8. **Testing**

1. **Test post creation:**
   ```bash
   # Create new post and check if expires_at is set
   ```

2. **Test extension:**
   ```bash
   curl -X POST http://localhost:3001/api/posts/POST_ID/extend \
     -H "Authorization: Bearer YOUR_AUTH_TOKEN"
   ```

3. **Test expiration:**
   ```bash
   # Manually change expires_at to past date
   UPDATE posts SET expires_at = NOW() - INTERVAL '1 day' WHERE id = '...';

   # Call expiration function
   SELECT expire_old_posts();
   ```

4. **Test notifications:**
   ```bash
   # Set expires_at to tomorrow
   UPDATE posts SET expires_at = NOW() + INTERVAL '1 day' WHERE id = '...';

   # Call notification function
   SELECT * FROM get_posts_expiring_soon(7);
   ```

---

## Checklist

- [ ] Database migration executed
- [ ] Edge Functions deployed to Supabase
- [ ] Cron Jobs configured
- [ ] Expiration UI added to desktop version
- [ ] my-posts API updated
- [ ] Post detail page updated
- [ ] Email service configured for notifications
- [ ] Tested new post creation
- [ ] Tested post extension
- [ ] Tested automatic expiration
- [ ] Tested notification system

---

## Ready to Use

After completing above steps, system will be fully functional:
- Posts automatically expire after 30 days
- Users receive notifications 7, 3, and 1 day before expiration
- Easy one-click extension
- Support for free listings

Good luck!
