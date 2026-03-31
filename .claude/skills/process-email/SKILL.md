---
name: process-email
description: Process incoming emails and create appropriate responses with approval workflow
version: 1.0.0
---

# Process Email Skill

This skill processes incoming emails from the Needs_Action folder, analyzes them, and creates appropriate response drafts that require human approval before sending.

## Trigger

This skill is triggered when:
- New EMAIL_*.md files appear in vault/Needs_Action/
- Orchestrator detects unprocessed email tasks

## Workflow

1. **Read Email Task**: Read the email details from Needs_Action/
2. **Analyze Content**: Understand the email context and intent
3. **Check Rules**: Review Company_Handbook.md for email handling guidelines
4. **Determine Response**: Decide if response is needed and what type
5. **Draft Response**: Create appropriate email reply
6. **Create Approval**: Write approval request to Pending_Approval/
7. **Move to Done**: Move original task file to Done/

## Instructions for Claude

When this skill is invoked with an email file path:

### Step 1: Read the Email
```
Read the email file from vault/Needs_Action/EMAIL_*.md
Extract: from, subject, content, gmail_id
```

### Step 2: Analyze Intent
Determine the email's purpose:
- Information request
- Invoice/payment request
- Meeting/scheduling
- Support/help request
- General inquiry
- Spam/irrelevant

### Step 3: Check Company Rules
Read vault/Company_Handbook.md and check:
- Email response guidelines
- Tone and style requirements
- Escalation rules
- Auto-response thresholds

### Step 4: Draft Response
Create an appropriate response following these guidelines:
- Professional and courteous tone
- Address all questions/requests
- Include relevant information
- Keep it concise (under 200 words)
- Add appropriate sign-off

### Step 5: Create Approval Request
Write to vault/Pending_Approval/EMAIL_REPLY_{gmail_id}.md:

```markdown
---
type: approval_request
action: send_email
to: {original_sender_email}
subject: Re: {original_subject}
gmail_id: {original_gmail_id}
created: {current_timestamp}
expires: {timestamp_24h_from_now}
status: pending
priority: normal
---

## Original Email
**From:** {sender}
**Subject:** {subject}
**Received:** {date}

{original_content_snippet}

## Proposed Response

{drafted_response}

## Reasoning
{brief_explanation_of_why_this_response}

## To Approve
Move this file to vault/Approved/ folder.

## To Reject
Move this file to vault/Rejected/ folder with reason.

## To Modify
Edit the "Proposed Response" section above, then move to Approved/.
```

### Step 6: Log and Complete
- Log action to vault/Logs/{today}.log
- Move original email file from Needs_Action/ to Done/
- Update Dashboard.md with "Email processed: {subject}"

## Example Usage

```bash
# Triggered by orchestrator or manually
claude code /process-email vault/Needs_Action/EMAIL_abc123.md
```

## Error Handling

- If email file not found: Log error and skip
- If Company_Handbook.md missing: Use default professional tone
- If unable to determine intent: Create approval request asking for human guidance
- If email is spam: Move directly to Done/ without creating approval

## Success Criteria

- Approval request created in Pending_Approval/
- Original email moved to Done/
- Action logged
- Dashboard updated

## Notes

- Never send emails directly - always create approval requests
- For urgent emails (marked priority: high), flag in approval request
- If email requires complex action (invoice generation, etc.), create a Plan.md instead
- Keep response drafts professional and aligned with Company_Handbook guidelines
