---
name: send-whatsapp
description: Send approved WhatsApp messages using MCP server
version: 1.0.0
---

# Send WhatsApp Skill

This skill sends approved WhatsApp messages via the WhatsApp MCP server.

## Trigger

This skill is triggered when:
- Approved WhatsApp message files appear in vault/Approved/
- Approval watcher detects WHATSAPP_REPLY_*.md files

## Workflow

1. **Read Approval**: Read approved message from Approved/
2. **Validate**: Check message is not empty
3. **Send Message**: Use WhatsApp MCP to send
4. **Log Action**: Record sending to Logs/
5. **Move to Done**: Move approval file to Done/

## Instructions for Claude

When this skill is invoked with an approved WhatsApp message file:

### Step 1: Read Approved Message
```
Read file from vault/Approved/WHATSAPP_REPLY_*.md
Extract: contact_name, message text
```

### Step 2: Validate Message
- Check message is not empty
- Verify contact name is provided

### Step 3: Send via MCP
Use WhatsApp MCP server:
```
Tool: send_message
Parameters:
  - contact_name: {contact_name}
  - message: {message_text}
```

### Step 4: Log Action
Write to vault/Logs/{today}.log:
```
[{timestamp}] WhatsApp message sent
Contact: {contact_name}
Message: {message_preview}
Status: Success
---
```

### Step 5: Complete
- Move approval file from Approved/ to Done/
- Update Dashboard.md: "Sent WhatsApp to {contact_name}"

## Error Handling

- If MCP server fails: Retry once, then alert user
- If contact not found: Alert user to check contact name
- If session expired: Alert user to re-authenticate WhatsApp Web

## Success Criteria

- Message sent successfully
- Action logged
- Approval file moved to Done/
- Dashboard updated

## Notes

- Always log all sending attempts (success and failure)
- Never send without approval
- WhatsApp Web session must be active
- Contact name must match exactly as saved in WhatsApp
