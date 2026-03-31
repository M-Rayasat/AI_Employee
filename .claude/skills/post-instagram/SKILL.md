---
name: post-instagram
description: Post approved content to Instagram using MCP server
version: 1.0.0
---

# Post Instagram Skill

This skill posts approved Instagram content via the Instagram MCP server.

## Trigger

This skill is triggered when:
- Approved Instagram post files appear in vault/Approved/
- Approval watcher detects INSTAGRAM_POST_*.md files

## Workflow

1. **Read Approval**: Read approved post from Approved/
2. **Validate**: Check image URL and caption are present
3. **Post to Instagram**: Use Instagram MCP to post
4. **Log Action**: Record posting to Logs/
5. **Move to Done**: Move approval file to Done/

## Instructions for Claude

When this skill is invoked with an approved Instagram post file:

### Step 1: Read Approved Post
```
Read file from vault/Approved/INSTAGRAM_POST_*.md
Extract: caption, hashtags, image_url
```

### Step 2: Validate Post
- Check image_url is present and valid (publicly accessible URL)
- Check caption is not empty
- Verify caption + hashtags combined length is under 2,200 characters
- Ensure image URL is in correct format (JPG or PNG)

### Step 3: Combine Caption and Hashtags
```
full_caption = caption + "\n\n" + hashtags
```

### Step 4: Post via MCP
Use Instagram MCP server:
```
Tool: post_to_instagram
Parameters:
  - image_url: {image_url}
  - caption: {full_caption}
```

**Note**: Instagram API requires 2-step process:
1. Create media container
2. Publish media container

The MCP server handles both steps automatically.

### Step 5: Log Action
Write to vault/Logs/{today}.log:
```
[{timestamp}] Instagram post published
Media ID: {media_id}
Caption Preview: {first_100_chars}
Image URL: {image_url}
Status: Success
---
```

### Step 6: Complete
- Move approval file from Approved/ to Done/
- Update Dashboard.md: "Posted to Instagram: {caption_preview}"
- Save post details to vault/Social_Media/Instagram/{date}_post.md for records

## Post Record Format

Save to vault/Social_Media/Instagram/{date}_post.md:
```markdown
---
media_id: {instagram_media_id}
posted_at: {timestamp}
status: published
---

## Caption

{full_caption_with_hashtags}

## Image

URL: {image_url}

## Performance Tracking

Check insights after 24 hours:
- Impressions: TBD
- Reach: TBD
- Engagement: TBD
- Likes: TBD
- Comments: TBD

## Post URL

https://www.instagram.com/p/{media_id}
```

## Image Requirements

**Format:**
- JPG or PNG only
- Aspect ratio: 1:1 (square) or 4:5 (portrait) recommended
- Minimum resolution: 1080x1080px
- Maximum file size: 8MB

**URL Requirements:**
- Must be publicly accessible (no authentication required)
- Must be direct image URL (not a webpage)
- HTTPS preferred
- Must remain accessible during posting process

## Error Handling

- If MCP server fails: Retry once, then alert user
- If image URL not accessible: Alert user to check URL
- If access token expired: Alert user to refresh token
- If image format invalid: Alert user with format requirements
- If caption too long: Alert user to shorten (max 2,200 chars)
- If network error: Retry with exponential backoff (3 attempts)

## Common Errors

**"Image URL not accessible":**
- Image URL must be publicly accessible
- Check if URL requires authentication
- Verify URL is direct image link

**"Invalid media type":**
- Only JPG and PNG supported
- Check image format

**"Caption too long":**
- Maximum 2,200 characters including hashtags
- Reduce caption or hashtag count

**"Access token expired":**
- Refresh Facebook Page Access Token
- Update .env file

## Success Criteria

- Post published successfully
- Media ID received from Instagram
- Action logged
- Approval file moved to Done/
- Dashboard updated
- Post record saved

## Notes

- Always log all posting attempts (success and failure)
- Never post without approval
- Instagram Business account required
- Facebook Page must be connected to Instagram Business account
- Access token must have instagram_basic and instagram_content_publish permissions
- Save media ID for future reference (insights, comments)
- Monitor post performance after 24 hours
- Image URL must remain accessible during posting (usually takes 5-10 seconds)

## Instagram API Limitations

- Cannot post Stories via API (only feed posts)
- Cannot post Reels via API
- Cannot post carousels (multiple images) via basic API
- Video posts require different endpoint (not implemented yet)
- Cannot schedule posts (posts immediately)
- Rate limits apply (25 posts per day per account)
