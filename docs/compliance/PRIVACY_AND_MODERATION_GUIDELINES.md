# Privacy and Moderation Guidelines for Messages

## 1. Private Message Access Policy

### General Rule
**User private messages are protected and not routinely reviewed by administrators.**

### Exceptions - When We Can Review Messages:

1. **User Report**
   - User reported message as spam, harassment, or inappropriate content
   - Access only to reported message
   - Every access is logged in system

2. **Court Order**
   - Based on valid court order
   - Legal documentation preserved

3. **Suspected Law Violation**
   - Suspected criminal activity (fraud, illegal goods trading)
   - Only after legal consultation

### We Never Review Messages:
- Out of curiosity
- For marketing purposes
- For user analytics (without anonymization)
- At third party request (without court order)

## 2. Message Reporting System

### For Users:
- Any user can report inappropriate message
- Report categories:
  - Spam
  - Harassment
  - Inappropriate content
  - Fraud
  - Other

### For Administrators:
- Access only to reported messages
- Obligation to document reason for access
- Automatic logging in audit trail

## 3. Data Storage

### Storage Duration:
- **Active messages**: Duration of platform use
- **Messages after account deletion**: 30 days (backup), then permanent deletion
- **Admin access logs**: 2 years (GDPR requirement)
- **Reports**: 2 years from resolution

### User Rights (GDPR):
- Right to access their data
- Right to deletion (right to be forgotten)
- Right to data portability
- Right to object to processing

## 4. Technical Security

### Current Security:
- Row Level Security (RLS) - only sender and receiver see messages
- Encryption during transmission (HTTPS)
- Rate limiting (anti-spam)
- Content validation
- Audit logs for admin access

### Recommended Additional Security:
- End-to-end encryption (optionally for very sensitive messages)
- Automatic deletion of old messages (e.g., after 2 years)
- 2FA for administrator accounts
- Unusual activity monitoring

## 5. Team Procedures

### Report Moderation Procedure:

1. **Receiving Report**
   - System automatically creates ticket
   - Notification for moderation team

2. **Report Verification**
   - Check user history (is this first report)
   - Assess report severity

3. **Message Review**
   - Access ONLY to reported message
   - Log access in audit system
   - Document review reason

4. **Decision**
   - Report valid: warning/user ban
   - Report invalid: dismiss, possible warning for reporter
   - Update report status

5. **Documentation**
   - Record decision and justification
   - Notify involved parties (if required)

### Message Access Procedure (for Admins):

```sql
-- ALWAYS use access logging function:
SELECT log_admin_message_access(
  current_user_id,  -- Admin ID
  message_id,       -- Message ID
  report_id,        -- Report ID (if applicable)
  'Review report #123 - suspected fraud' -- Reason
);

-- Then review message
```

## 6. What You Need to Update in Documents

### A) Privacy Policy - Add Section:

**"Private Messages and Moderation"**

```
Your private messages are protected and encrypted. We do not review them
routinely. Access to messages may occur only in case of:

1. User report (spam, harassment)
2. Court order
3. Suspected criminal activity

Every administrator access to messages is automatically logged
in the audit system. You have the right to request information about access to your data.
```

### B) Terms of Service - Add Point:

**"Reporting Inappropriate Content"**

```
Users can report inappropriate messages using the "Report" button in the chat
window. Reports are verified by the moderation team within 24-48 hours.
False reports may result in warning or account suspension.
```

### C) Database Access

**DO NOT log directly to database as postgres/admin!**

Instead:
1. Build admin panel in application
2. Use `get_reported_messages()` function
3. System will automatically log access

## 7. Compliance Checklist

### Basic Infrastructure
- [x] Run SQL with reporting system (`message_reporting_system.sql`)
- [x] Build admin panel for reviewing reports
- [x] Add "Report" button in chat window
- [x] Build Audit Logs panel (`/admin/audit-logs`)
- [x] Add automatic log cleanup function (`cleanup_old_audit_logs()`)

### Audit Logs and GDPR
- [ ] Run SQL: `add_audit_logs_function.sql` in Supabase
- [ ] Enable pg_cron extension in Supabase Dashboard
- [ ] Schedule cron job for log cleanup (see: `AUDIT_LOGS_SETUP.md`)
- [ ] Test that logs are created when reviewing reports
- [ ] Test `get_user_audit_logs()` function for users

### Legal Documentation
- [ ] Update Privacy Policy (add audit logs section)
- [ ] Update Terms of Service (add reporting point)
- [ ] Add privacy@[domain].com email for GDPR requests

### Operational Procedures
- [ ] Train team on moderation procedures
- [ ] Document procedures in internal documentation
- [ ] Designate person responsible for moderation
- [ ] Designate person responsible for GDPR requests
- [ ] Regularly review audit logs (monthly)

### Optional But Recommended
- [ ] Configure email notifications for reports
- [ ] Add 2FA for administrator accounts
- [ ] Configure unusual activity monitoring
- [ ] Consider E2E encryption for sensitive messages

## 8. Penalties for Improper Access

**Important for Team:**
- Unauthorized message access = GDPR violation
- GDPR penalties: up to 20 million EUR or 4% of annual turnover
- Possible criminal liability
- Loss of user trust

## 9. Contact for Legal Inquiries

Designate person responsible for:
- Responding to GDPR requests (right to access, deletion)
- Contact with law enforcement (court orders)
- Security incident management

Email: privacy@[your-domain].com (MUST be available!)

---

**Last Updated:** November 5, 2025
**Version:** 1.0
