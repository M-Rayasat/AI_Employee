---
name: process-facebook-comment
description: Process Facebook comments and create appropriate response drafts with approval workflow
version: 1.0.0
---

# Process Facebook Comment Skill

This skill processes Facebook comments, analyzes them, and creates appropriate response drafts that require human approval before posting.

## Trigger

This skill is triggered when:
- New FACEBOOK_COMMENT_*.md files appear in vault/Needs_Action/
- Orchestrator detects unprocessed Facebook comments

## Workflow

1. **Read Comment**: Read the comment details from Needs_Action/
2. **Analyze Content**: Understand the comment context and intent
3. **Check Rules**: Review Company_Handbook.md for Facebook handling guidelines
4. **Determine Response**: Decide if response is needed and what type
5. **Draft Reply**: Create appropriate Facebook comment reply
6. **Create Approval**: Write approval request to Pending_Approval/
7. **Move to Done**: Move original comment file to Done/

## Instructions for Claude

When this skill is invoked with a Facebook comment file path:

### Step 1: Read the Comment
```
Read the comment file from vault/Needs_Action/FACEBOOK_COMMENT_*.md
Extract: from (commenter name), comment text, post context, comment_id
```

### Step 2: Analyze Intent
Determine the comment's purpose:
- Question about services/products
- Positive feedback/praise
- Complaint or concern
- Spam or irrelevant
- Request for information
- Engagement (general conversation)

### Step 3: Check Company Rules
Read vault/Company_Handbook.md and check:
- Facebook response guidelines
- Tone and style requirements (professional but friendly)
- Escalation rules
- Response time expectations
- How to handle negative comments

### Step 4: Draft Response
Create an appropriate response following these guidelines:
- **Tone**: Friendly, professional, and helpful
- **Length**: Keep it concise (1-3 sentences usually sufficient)
- **Personalization**: Use commenter's name if appropriate
- **Value**: Provide helpful information or acknowledge feedback
- **Call-to-action**: Invite further engagement if needed (DM, website visit, etc.)

**Response Types:**
- **Appreciation**: Thank for positive feedback
- **Information**: Answer questions directly
- **Resolution**: Address concerns professionally
- **Engagement**: Continue conversation naturally
- **Redirect**: Guide to DM or website for detailed inquiries

### Step 5: Create Approval Request
Write to vault/Pending_Approval/FACEBOOK_REPLY_{commenter}_{timestamp}.md:

```markdown
---
type: approval_request
action: reply_to_facebook_comment
comment_id: {comment_id}
commenter: {commenter_name}
created: {current_timestamp}
expires: {timestamp_24h_from_now}
status: pending
priority: medium
---

## Original Comment
**From:** {commenter_name}
**On Post:** {post_preview}
**Received:** {received_timestamp}

{original_comment_text}

## Proposed Reply

{drafted_response}

## Reasoning

{brief_explanation_of_why_this_response}

**Category:** {comment_type}
**Sentiment:** {positive/neutral/negative}

## To Approve
Move this file to vault/Approved/ folder.

## To Reject
Move this file to vault/Rejected/ folder with reason.

## To Modify
Edit the "Proposed Reply" section above, then move to Approved/.
```

### Step 6: Log and Complete
- Log action to vault/Logs/{today}.log
- Move original comment file from Needs_Action/ to Done/
- Update Dashboard.md with "Facebook comment processed: {commenter_name}"

## Response Guidelines

**DO:**
- Respond promptly (within 24 hours)
- Be genuine and authentic
- Show appreciation for engagement
- Provide helpful information
- Use emojis sparingly (1-2 max)
- Keep it conversational
- Address concerns professionally

**DON'T:**
- Argue or be defensive
- Use corporate jargon
- Ignore negative comments
- Give false information
- Be overly promotional
- Use excessive emojis or caps
- Engage with trolls or spam

## Example Responses

### Positive Feedback
```
Comment: "Great work on our website! Very professional and fast service."
Reply: "Thank you so much! 😊 We're thrilled you're happy with the result. It was a pleasure working with you!"
```

### Question
```
Comment: "Do you offer mobile app development?"
Reply: "Yes, we do! We specialize in both iOS and Android app development. Feel free to send us a message or visit our website for more details. 📱"
```

### Concern
```
Comment: "I tried contacting you but got no response."
Reply: "We sincerely apologize for the delay! Please send us a direct message with your contact details, and we'll get back to you right away. Thank you for your patience."
```

### General Engagement
```
Comment: "Love this tip! Very helpful."
Reply: "Glad you found it useful! Stay tuned for more tips coming soon. 🙌"
```

## Special Cases

**Spam/Irrelevant:**
- Don't create approval request
- Mark as spam in logs
- Move directly to Done/

**Negative/Complaint:**
- Priority: High
- Suggest moving to private message
- Acknowledge concern publicly
- Offer resolution privately

**Complex Inquiry:**
- Provide brief public response
- Invite to DM or email for details
- Don't share sensitive info publicly

## Error Handling

- If comment file not found: Log error and skip
- If Company_Handbook.md missing: Use default professional tone
- If unable to determine intent: Create approval request asking for human guidance
- If comment is spam: Move directly to Done/ without creating approval

## Success Criteria

- Approval request created in Pending_Approval/
- Original comment moved to Done/
- Action logged
- Dashboard updated

## Notes

- Never reply without approval
- Facebook comments are public - be mindful of what you share
- Response time matters for engagement
- Monitor for follow-up comments
- Some comments may not need a response (simple likes/emojis)
- Negative comments handled professionally can improve brand reputation
