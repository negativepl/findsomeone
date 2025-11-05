# GDPR Compliance Summary - Messaging System

## What We Have (Ready)

### 1. Technical Infrastructure
- `admin_message_access_logs` table - stores every admin access
- `log_admin_message_access()` function - automatically logs access
- RLS (Row Level Security) - only sender and receiver see messages
- `get_reported_messages()` function - admin-only, automatically logs access

### 2. Reporting System
- "Report" button in chat (`/components/ReportMessageDialog.tsx`)
- Reports panel for admins (`/app/admin/reports/page.tsx`)
- 5 report categories: spam, harassment, inappropriate content, fraud, other
- Moderation actions: dismiss, warn, delete message, ban user

### 3. Audit Logs Panel
- `/admin/audit-logs` page - admin access history
- `get_admin_access_logs()` function - fetches logs for panel
- `get_user_audit_logs(user_id)` function - users can see who viewed their messages
- `cleanup_old_audit_logs()` function - removes logs older than 2 years
- Statistics: log count, unique admins, report-based access

### 4. User Management
- User banning with reason
- User unbanning (`/app/admin/banned-users/page.tsx`)
- Ban history in `user_bans` table
- Access blocking for banned users (middleware)

### 5. Documentation
- `PRIVACY_AND_MODERATION_GUIDELINES.md` - procedures for team
- `AUDIT_LOGS_SETUP.md` - configuration instructions
- SQL function comments
- Compliance checklist - what's done, what's TODO

## What You Need to Do (TODO)

### Critical (Before Production)

1. **Run SQL in Supabase**
   ```sql
   -- In Supabase SQL Editor:
   1. Run: /supabase/add_audit_logs_function.sql
   2. Database → Extensions → Enable pg_cron
   3. Schedule cron job (see: AUDIT_LOGS_SETUP.md)
   ```

2. **Update Privacy Policy**

   Add section (in `/app/privacy/page.tsx`):

   ```markdown
   ## Private Messages and Moderation

   Your private messages are protected and not routinely reviewed.
   Access to messages may occur only in case of:

   1. User report (spam, harassment)
   2. Court order
   3. Suspected criminal activity

   Every administrator access is automatically logged in the audit system.
   Logs are stored for 2 years and automatically deleted.

   You have the right to request information about access to your messages.
   ```

3. **Add GDPR Contact Email**
   ```
   privacy@[your-domain].com
   ```

   This email MUST work and be monitored!

### Important (Within a Week)

4. **Test the System**
   - [ ] Report test message
   - [ ] Review report as admin
   - [ ] Check if log appears in `/admin/audit-logs`
   - [ ] Manually call `cleanup_old_audit_logs()`

5. **Designate Responsible Persons**
   - [ ] Moderator (reviewing reports)
   - [ ] GDPR Officer (responding to user requests)

### Optional (But Recommended)

6. **Add 2FA for Admins**
   - Supabase supports 2FA out of the box
   - Settings → Enable MFA

7. **Monitoring**
   - Set alert if report count > 10/day
   - Regularly check audit logs (monthly)

## How to Respond to GDPR Requests?

### Scenario 1: User wants to know who viewed their messages

1. Verify user identity
2. In Supabase SQL Editor:
   ```sql
   SELECT * FROM get_user_audit_logs('user-uuid');
   ```
3. Export to CSV
4. Send to user email (within 30 days)

### Scenario 2: User wants to delete their data

1. Confirm identity
2. In Supabase:
   ```sql
   -- Delete audit logs
   DELETE FROM admin_message_access_logs
   WHERE message_id IN (
     SELECT id FROM messages
     WHERE sender_id = 'user-uuid' OR receiver_id = 'user-uuid'
   );

   -- Delete messages
   DELETE FROM messages
   WHERE sender_id = 'user-uuid' OR receiver_id = 'user-uuid';

   -- Delete profile
   DELETE FROM profiles WHERE id = 'user-uuid';
   ```
3. Confirm deletion (within 30 days)

## Compliance Monitoring

### What to Check Regularly?

**Monthly:**
- [ ] Report count vs previous month
- [ ] Report response time (should be < 48h)
- [ ] Audit log count
- [ ] Check if cron job executes (`SELECT * FROM cron.job_run_details`)

**Quarterly:**
- [ ] Review moderation procedures
- [ ] Check if privacy@ email works
- [ ] Audit admin permissions

**Yearly:**
- [ ] Full GDPR compliance audit
- [ ] Update privacy policy if laws changed
- [ ] Team training on procedures

## FAQ

### Q: Can I view message content in the database?
**A:** Yes, BUT:
- Only if you have business need (report, court order)
- ALWAYS must log access using `log_admin_message_access()`
- User has right to know you did this

### Q: How long do we keep messages?
**A:**
- Active accounts: no limit (as long as user wants)
- After account deletion: 30 days backup, then permanent deletion
- Audit logs: 2 years, then automatic deletion

### Q: What if I receive a court order?
**A:**
1. Contact lawyer
2. Verify order is valid
3. Log access in system: `log_admin_message_access()`
4. Provide only what order requires
5. Keep documentation

### Q: Must I inform user I viewed their messages?
**A:** NO need to actively inform, BUT:
- User has right to ask (GDPR)
- Then you must provide audit logs
- Therefore ALWAYS log access with real reason!

## Contact for Questions

- **Technical:** Check `AUDIT_LOGS_SETUP.md`
- **Legal/GDPR:** Consult with GDPR specialist lawyer
- **Procedures:** Check `PRIVACY_AND_MODERATION_GUIDELINES.md`

---

**Status:** System ready for production (after completing TODO)
**Date:** November 5, 2025
**Compliance:** GDPR ready
