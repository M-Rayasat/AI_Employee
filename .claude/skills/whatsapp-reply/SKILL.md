---
name: whatsapp-reply
description: Process WhatsApp messages and draft AI-powered replies for approval
version: 1.0.0
---

# WhatsApp Reply Skill

This skill processes incoming WhatsApp messages, drafts AI-powered replies using Claude, and creates approval requests.

## Workflow

1. **Detect New WhatsApp Message** - Watcher creates task in Needs_Action/
2. **Analyze Message** - Claude analyzes intent and context
3. **Draft Reply** - Claude generates appropriate response
4. **Create Approval Request** - Move to Pending_Approval/
5. **Send Reply** - After approval, send via WhatsApp

## Instructions for Claude

When you find a WHATSAPP_*.md file in vault/Needs_Action/:

### Step 1: Read and Analyze Message

```
Read the WhatsApp message file
Extract:
- Contact name
- Phone number
- Message content
- Timestamp
```

### Step 2: Draft AI Reply

Based on message content, draft an appropriate reply:

**For general inquiries:**
- Professional and friendly tone
- Answer the question directly
- Offer additional help if needed

**For urgent requests:**
- Acknowledge urgency
- Provide immediate response
- Set expectations for follow-up

**For business inquiries:**
- Professional tone
- Provide relevant information
- Include call-to-action if needed

### Step 3: Create Approval Request

Create file in vault/Pending_Approval/:

```markdown
---
type: approval_request
action: whatsapp_reply
contact: {contact_name}
phone: {phone_number}
created: {timestamp}
status: pending
priority: normal
---

## Original Message

**From:** {contact_name}
**Phone:** {phone_number}
**Received:** {timestamp}

{original_message}

## Drafted Reply

{ai_generated_reply}

## Instructions

**To Approve:**
- Review the reply above
- Edit if needed
- Move this file to vault/Approved/

**To Reject:**
- Move this file to vault/Rejected/
- Add reason in filename or content

**To Modify:**
- Edit the "Drafted Reply" section
- Move to vault/Approved/
```

### Step 4: Move Original to Done

After creating approval request:
```
Move vault/Needs_Action/WHATSAPP_*.md to vault/Done/
```

## Example Scenarios

### Scenario 1: Customer Inquiry
**Message:** "Do you have this product in stock?"
**Reply:** "Thank you for your inquiry! Yes, we currently have this product in stock. Would you like to place an order? Feel free to let me know if you need any additional information."

### Scenario 2: Urgent Request
**Message:** "Urgent - need invoice ASAP"
**Reply:** "I understand this is urgent. I'm preparing your invoice right now and will send it to you within the next 15 minutes. Thank you for your patience!"

### Scenario 3: General Question
**Message:** "What are your business hours?"
**Reply:** "Our business hours are Monday-Friday, 9 AM to 6 PM, and Saturday 10 AM to 4 PM. We're closed on Sundays. Is there anything else I can help you with?"

## Notes

- Always maintain professional and friendly tone
- Keep replies concise and clear
- Personalize when possible
- Include call-to-action when appropriate
- For complex queries, offer to call or email
