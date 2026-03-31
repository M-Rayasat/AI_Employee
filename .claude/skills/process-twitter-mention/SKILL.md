---
name: process-twitter-mention
description: Process Twitter mentions and create appropriate reply drafts with approval workflow
version: 1.0.0
---

# Process Twitter Mention Skill

This skill processes incoming Twitter mentions, analyzes them, and creates appropriate response drafts that require human approval before posting.

## Trigger

This skill is triggered when:
- New TWITTER_*.md files appear in vault/Needs_Action/
- Orchestrator detects unprocessed Twitter mentions

## Workflow

1. **Read Mention**: Read the mention details from Needs_Action/
2. **Analyze Content**: Understand the mention context and intent
3. **Check Rules**: Review Company_Handbook.md for Twitter handling guidelines
4. **Determine Response**: Decide if response is needed and what type
5. **Draft Reply**: Create appropriate Twitter reply (max 280 chars)
6. **Create Approval**: Write approval request to Pending_Approval/
7. **Move to Done**: Move original mention file to Done/

## Instructions for Claude

When this skill is invoked with a Twitter mention file path:

### Step 1: Read the Mention
```
Read the mention file from vault/Needs_Action/TWITTER_*.md
Extract: tweet_id, author_id, text, conversation_id
```

### Step 2: Analyze Intent
Determine the mention's purpose:
- Question/inquiry
- Feedback/comment
- Complaint/issue
- Spam/irrelevant
- Engagement/conversation

### Step 3: Check Company Rules
Read vault/Company_Handbook.md and check:
- Twitter response guidelines
- Tone and style requirements
- Escalation rules
- Auto-response thresholds

### Step 4: Draft Reply
Create an appropriate reply following these guidelines:
- Professional and friendly tone
- Maximum 280 characters
- Address the mention directly
- Include relevant hashtags if appropriate
- Keep it concise and engaging

### Step 5: Create Approval Request
Write to vault/Pending_Approval/TWITTER_REPLY_{tweet_id}.md:

```markdown
---
type: approval_request
action: reply_to_tweet
tweet_id: {original_tweet_id}
author_id: {original_author_id}
conversation_id: {conversation_id}
created: {current_timestamp}
expires: {timestamp_24h_from_now}
status: pending
priority: normal
---

## Original Mention
**Tweet ID:** {tweet_id}
**Author ID:** {author_id}
**Created:** {created_at}

{original_tweet_text}

## Proposed Reply

{drafted_reply}

**Character count:** {char_count}/280

## Reasoning

{brief_explanation_of_why_this_response}

**Category:** {mention_type}
**Priority:** {priority_level}

## To Approve
Move this file to vault/Approved/ folder.

## To Reject
Move this file to vault/Rejected/ folder with reason.

## To Modify
Edit the "Proposed Reply" section above, then move to Approved/.
```

### Step 6: Log and Complete
- Log action to vault/Logs/{today}.log
- Move original mention file from Needs_Action/ to Done/
- Update Dashboard.md with "Twitter mention processed: {tweet_id}"

## Example Usage

```bash
# Triggered by orchestrator or manually
claude code /process-twitter-mention vault/Needs_Action/TWITTER_123456.md
```

## Error Handling

- If mention file not found: Log error and skip
- If Company_Handbook.md missing: Use default professional tone
- If unable to determine intent: Create approval request asking for human guidance
- If mention is spam: Move directly to Done/ without creating approval

## Success Criteria

- Approval request created in Pending_Approval/
- Original mention moved to Done/
- Action logged
- Dashboard updated

## Notes

- Never reply directly - always create approval requests
- For urgent mentions (complaints, issues), flag in approval request
- If mention requires complex action (customer support, etc.), create a Plan.md instead
- Keep replies professional and aligned with Company_Handbook guidelines
- Respect Twitter's 280 character limit
