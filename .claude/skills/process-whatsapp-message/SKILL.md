---
name: process-whatsapp-message
description: Process WhatsApp messages and create appropriate response drafts with approval workflow
version: 1.0.0
---

# Process WhatsApp Message Skill

This skill processes incoming WhatsApp messages, analyzes them, and creates appropriate response drafts that require human approval before sending.

## Trigger

This skill is triggered when:
- New WHATSAPP_*.md files appear in vault/Needs_Action/
- Orchestrator detects unprocessed WhatsApp messages

## Workflow

1. **Read Message**: Read the message details from Needs_Action/
2. **Analyze Content**: Understand the message context and intent
3. **Check Rules**: Review Company_Handbook.md for WhatsApp handling guidelines
4. **Determine Response**: Decide if response is needed and what type
5. **Draft Reply**: Create appropriate WhatsApp response
6. **Create Approval**: Write approval request to Pending_Approval/
7. **Move to Done**: Move original message file to Done/

## Instructions for Claude

When this skill is invoked with a WhatsApp message file path:

### Step 1: Read the Message
```
Read the message file from vault/Needs_Action/WHATSAPP_*.md
Extract: from (contact name), message text, received timestamp
```

### Step 2: Analyze Intent
Determine the message's purpose:
- Urgent request
- Invoice/payment inquiry
- General question
- Customer support
- Spam/irrelevant

### Step 3: Check Company Rules
Read vault/Company_Handbook.md and check:
- WhatsApp response guidelines
- Tone and style requirements (professional but friendly)
- Escalation rules
- Response time expectations

### Step 4: Draft Response
Create an appropriate response following these guidelines:
- Professional yet conversational tone
- Address the request directly
- Keep it concise but complete
- Include next steps if applicable
- Maintain politeness

### Step 5: Create Approval Request
Write to vault/Pending_Approval/WHATSAPP_REPLY_{contact}_{timestamp}.md:

```markdown
---
type: approval_request
action: send_whatsapp_message
contact_name: {contact_name}
created: {current_timestamp}
expires: {timestamp_24h_from_now}
status: pending
priority: high
---

## Original Message
**From:** {contact_name}
**Received:** {received_timestamp}

{original_message_text}

## Proposed Response

{drafted_response}

## Reasoning

{brief_explanation_of_why_this_response}

**Category:** {message_type}
**Priority:** High (WhatsApp messages expect quick response)

## To Approve
Move this file to vault/Approved/ folder.

## To Reject
Move this file to vault/Rejected/ folder with reason.

## To Modify
Edit the "Proposed Response" section above, then move to Approved/.
```

### Step 6: Log and Complete
- Log action to vault/Logs/{today}.log
- Move original message file from Needs_Action/ to Done/
- Update Dashboard.md with "WhatsApp message processed: {contact_name}"

## Example Usage

```bash
# Triggered by orchestrator or manually
claude code /process-whatsapp-message vault/Needs_Action/WHATSAPP_Client_20260329.md
```

## Error Handling

- If message file not found: Log error and skip
- If Company_Handbook.md missing: Use default professional tone
- If unable to determine intent: Create approval request asking for human guidance
- If message is spam: Move directly to Done/ without creating approval

## Success Criteria

- Approval request created in Pending_Approval/
- Original message moved to Done/
- Action logged
- Dashboard updated

## Notes

- Never send messages directly - always create approval requests
- WhatsApp messages are typically urgent - flag as high priority
- If message requires complex action (invoice generation, etc.), create a Plan.md instead
- Keep responses professional but friendly (WhatsApp is more casual than email)
- Respond within 24 hours for best customer experience
