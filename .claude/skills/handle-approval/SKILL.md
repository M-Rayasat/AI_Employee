---
name: handle-approval
description: Execute approved actions via MCP servers with comprehensive audit logging
version: 1.0.0
---

# Handle Approval Skill

This skill executes approved actions by reading approval files from the Approved/ folder and triggering the appropriate MCP servers or automation scripts.

## Trigger

This skill is triggered when:
- New files appear in vault/Approved/
- Approval watcher detects approved action files

## Supported Actions

- `send_email`: Send email via Email MCP server
- `linkedin_post`: Post to LinkedIn via browser automation
- `payment`: Execute payment (requires additional verification)
- `file_operation`: Perform file operations
- `custom_action`: Execute custom defined actions

## Workflow

1. **Read Approval File**: Parse approved action details
2. **Validate Action**: Ensure action is safe and authorized
3. **Execute Action**: Call appropriate MCP server or script
4. **Log Result**: Record execution details with full audit trail
5. **Move to Done**: Move approval file to Done/
6. **Update Dashboard**: Reflect completed action

## Instructions for Claude

When this skill is invoked with an approval file path:

### Step 1: Read and Parse Approval File

```
Read vault/Approved/{filename}.md
Extract from frontmatter:
- type: approval_request
- action: {action_type}
- Additional action-specific parameters
```

### Step 2: Validate Action

Check:
- File is in correct format
- Action type is supported
- Required parameters are present
- Action hasn't expired (check expires field)
- No security red flags

### Step 3: Execute Based on Action Type

#### For `send_email` Action:

```markdown
Extract:
- to: recipient email
- subject: email subject
- body: email content (from "Proposed Response" section)
- gmail_id: original email ID (for threading)

Execute:
1. Use Email MCP server to send email
2. If MCP not available, create manual instructions
3. Verify send success
```

#### For `linkedin_post` Action:

```markdown
Extract:
- Post content (from "LinkedIn Post Content" section)
- Hashtags

Execute:
1. Call /linkedin-post skill with content
2. Wait for posting confirmation
3. Capture post URL if available
```

#### For `payment` Action:

```markdown
Extract:
- amount: payment amount
- recipient: payee details
- reference: payment reference

Execute:
1. CRITICAL: Double-check amount and recipient
2. Use Payment MCP server (if configured)
3. Require additional confirmation for amounts > $100
4. Log transaction details
```

### Step 4: Comprehensive Audit Logging

Write to vault/Logs/{today}.json:

```json
{
  "timestamp": "{ISO_8601_timestamp}",
  "action_type": "{action_type}",
  "actor": "claude_code",
  "approval_file": "{filename}",
  "parameters": {
    "to": "{recipient}",
    "subject": "{subject}",
    "amount": "{amount_if_payment}"
  },
  "approval_status": "approved",
  "approved_by": "human",
  "execution_status": "success|failed|partial",
  "result": "{execution_result_details}",
  "error": "{error_message_if_failed}",
  "duration_ms": "{execution_time}"
}
```

Also append to vault/Logs/{today}.log (human-readable):

```
[{timestamp}] APPROVAL EXECUTED
Action: {action_type}
File: {filename}
Status: {success/failed}
Details: {brief_description}
Result: {outcome}
---
```

### Step 5: Handle Errors

If execution fails:
1. Log detailed error
2. Move approval file to vault/Rejected/ (not Done/)
3. Create error report in vault/Needs_Action/ERROR_{filename}.md
4. Alert user via Dashboard update

Error report format:
```markdown
---
type: execution_error
original_action: {action_type}
failed_at: {timestamp}
---

## Execution Failed

**Original Approval:** {filename}
**Action:** {action_type}
**Error:** {error_message}

## What Happened
{detailed_explanation}

## Next Steps
- [ ] Review error details
- [ ] Fix underlying issue
- [ ] Re-approve action if needed
- [ ] Update system configuration

## Technical Details
{stack_trace_or_debug_info}
```

### Step 6: Move to Done and Update

```
1. Move vault/Approved/{filename}.md to vault/Done/
2. Update vault/Dashboard.md:
   - Add to "Recent Activity" section
   - Update relevant metrics
   - Timestamp the action
```

## MCP Server Integration

### Email MCP Server

```javascript
// Expected MCP server interface
{
  "tool": "send_email",
  "parameters": {
    "to": "recipient@example.com",
    "subject": "Email subject",
    "body": "Email content",
    "reply_to_id": "gmail_message_id" // optional, for threading
  }
}
```

### Browser MCP Server (for LinkedIn)

```javascript
{
  "tool": "browser_action",
  "parameters": {
    "action": "linkedin_post",
    "content": "Post content with hashtags"
  }
}
```

## Security Safeguards

### Pre-Execution Checks

- [ ] Verify file came from Approved/ folder
- [ ] Check action hasn't expired
- [ ] Validate all required parameters present
- [ ] Ensure action type is whitelisted
- [ ] Check for suspicious patterns (SQL injection, XSS, etc.)

### Rate Limiting

- Max 10 emails per hour
- Max 3 LinkedIn posts per day
- Max 3 payments per day
- Log rate limit violations

### Sensitive Actions

For payments or irreversible actions:
- Require additional confirmation file
- Wait 5 minutes before execution
- Send pre-execution notification
- Allow cancellation window

## Retry Logic

For transient failures:
```python
max_retries = 3
retry_delay = [1, 5, 15]  # seconds

for attempt in range(max_retries):
    try:
        result = execute_action()
        break
    except TransientError as e:
        if attempt < max_retries - 1:
            wait(retry_delay[attempt])
        else:
            raise
```

## Success Criteria

- Action executed successfully
- Full audit trail logged (JSON + human-readable)
- Approval file moved to Done/
- Dashboard updated
- No errors or security violations

## Example Usage

```bash
# Triggered by approval watcher
claude code /handle-approval vault/Approved/EMAIL_REPLY_abc123.md
```

## Monitoring

Track execution metrics:
- Success rate by action type
- Average execution time
- Error frequency
- Rate limit hits
- Security violations

## Notes

- Always log before and after execution
- Never skip audit logging
- Treat all external actions as potentially failing
- Provide clear error messages for debugging
- Keep approval files for audit trail (in Done/)
- Review logs weekly for anomalies
