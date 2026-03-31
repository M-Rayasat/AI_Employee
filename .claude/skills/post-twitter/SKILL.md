---
name: post-twitter
description: Post approved tweets to Twitter/X using MCP server
version: 1.0.0
---

# Post Twitter Skill

This skill posts approved tweets to Twitter/X via the Twitter MCP server.

## Trigger

This skill is triggered when:
- Approved tweet files appear in vault/Approved/
- Approval watcher detects TWITTER_POST_*.md files

## Workflow

1. **Read Approval**: Read approved tweet from Approved/
2. **Validate**: Check character limit (280 chars)
3. **Post Tweet**: Use Twitter MCP to post
4. **Log Action**: Record posting to Logs/
5. **Move to Done**: Move approval file to Done/

## Instructions for Claude

When this skill is invoked with an approved tweet file:

### Step 1: Read Approved Tweet
```
Read file from vault/Approved/TWITTER_POST_*.md
Extract: text, reply_to_id (if replying)
```

### Step 2: Validate Tweet
- Check character count ≤ 280
- Verify text is not empty
- Check for required hashtags (if specified)

### Step 3: Post via MCP
Use Twitter MCP server:
```
Tool: post_tweet
Parameters:
  - text: {tweet_text}
  - reply_to_id: {optional_reply_id}
```

### Step 4: Log Action
Write to vault/Logs/{today}.log:
```
[{timestamp}] Twitter post successful
Tweet ID: {tweet_id}
Text: {tweet_text}
URL: https://twitter.com/user/status/{tweet_id}
---
```

### Step 5: Complete
- Move approval file from Approved/ to Done/
- Update Dashboard.md: "Posted to Twitter: {tweet_preview}"

## Error Handling

- If character limit exceeded: Alert user, move to Rejected/
- If MCP server fails: Retry once, then alert user
- If authentication fails: Alert user to check credentials

## Success Criteria

- Tweet posted successfully
- Tweet ID and URL logged
- Approval file moved to Done/
- Dashboard updated

## Notes

- Always respect 280 character limit
- Log all posting attempts (success and failure)
- Never post without approval
- Include tweet URL in logs for reference
