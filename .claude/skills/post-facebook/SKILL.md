---
name: post-facebook
description: Post approved content to Facebook page using MCP server
version: 1.0.0
---

# Post Facebook Skill

This skill posts approved Facebook content via the Facebook MCP server.

## Trigger

This skill is triggered when:
- Approved Facebook post files appear in vault/Approved/
- Approval watcher detects FACEBOOK_POST_*.md files

## Workflow

1. **Read Approval**: Read approved post from Approved/
2. **Validate**: Check post content is not empty
3. **Post to Facebook**: Use Facebook MCP to post
4. **Log Action**: Record posting to Logs/
5. **Move to Done**: Move approval file to Done/

## Instructions for Claude

When this skill is invoked with an approved Facebook post file:

### Step 1: Read Approved Post
```
Read file from vault/Approved/FACEBOOK_POST_*.md
Extract: post content, optional link, optional image_url
```

### Step 2: Validate Post
- Check post content is not empty
- Verify post length is reasonable (not too short or too long)
- Check for any placeholder text that wasn't replaced

### Step 3: Post via MCP
Use Facebook MCP server:
```
Tool: post_to_page
Parameters:
  - message: {post_content}
  - link: {optional_link}
  - image_url: {optional_image_url}
```

### Step 4: Log Action
Write to vault/Logs/{today}.log:
```
[{timestamp}] Facebook post published
Post ID: {post_id}
Content Preview: {first_100_chars}
Status: Success
---
```

### Step 5: Complete
- Move approval file from Approved/ to Done/
- Update Dashboard.md: "Posted to Facebook: {content_preview}"
- Save post details to vault/Social_Media/Facebook/{date}_post.md for records

## Post Record Format

Save to vault/Social_Media/Facebook/{date}_post.md:
```markdown
---
post_id: {facebook_post_id}
posted_at: {timestamp}
status: published
---

## Post Content

{full_post_content}

## Performance Tracking

Check insights after 24 hours:
- Reach: TBD
- Engagement: TBD
- Clicks: TBD

## Post URL

https://facebook.com/{post_id}
```

## Error Handling

- If MCP server fails: Retry once, then alert user
- If access token expired: Alert user to refresh token
- If post violates Facebook policies: Alert user with error details
- If network error: Retry with exponential backoff (3 attempts)

## Success Criteria

- Post published successfully
- Post ID received from Facebook
- Action logged
- Approval file moved to Done/
- Dashboard updated
- Post record saved

## Notes

- Always log all posting attempts (success and failure)
- Never post without approval
- Facebook access token must be valid
- Page must have proper permissions
- Save post ID for future reference (insights, editing, deleting)
- Monitor post performance after 24 hours
