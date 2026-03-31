---
name: linkedin-post
description: Post approved content to LinkedIn using browser automation
version: 1.0.0
---

# LinkedIn Post Skill

This skill posts approved LinkedIn content using browser automation (Playwright). It reads approved posts from the Approved/ folder and publishes them to LinkedIn.

## Trigger

This skill is triggered when:
- Approved LinkedIn post files appear in vault/Approved/
- Approval watcher detects LINKEDIN_POST_*.md files

## Prerequisites

- Playwright installed: `pip install playwright && playwright install chromium`
- LinkedIn account credentials
- browser-use skill available (for automation)

## Workflow

1. **Read Approved Post**: Read post content from Approved/
2. **Launch Browser**: Open LinkedIn using Playwright
3. **Navigate to Post**: Click "Start a post" button
4. **Paste Content**: Insert approved post content
5. **Publish**: Click "Post" button
6. **Verify**: Confirm post was published
7. **Log Action**: Record posting to Logs/
8. **Move to Done**: Move approval file to Done/

## Instructions for Claude

When this skill is invoked with an approved post file:

### Step 1: Read Approved Post
```
Read vault/Approved/LINKEDIN_POST_{timestamp}.md
Extract:
- Post content
- Hashtags
- Scheduled time (if any)
```

### Step 2: Use Browser Automation

Use the existing browser-use skill to automate LinkedIn posting:

```python
from playwright.sync_api import sync_playwright
import time

def post_to_linkedin(content: str, linkedin_email: str, linkedin_password: str):
    with sync_playwright() as p:
        # Launch browser (non-headless for first run to handle 2FA)
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        # Navigate to LinkedIn
        page.goto('https://www.linkedin.com/login')

        # Login (if not already logged in)
        if page.is_visible('input[name="session_key"]'):
            page.fill('input[name="session_key"]', linkedin_email)
            page.fill('input[name="session_password"]', linkedin_password)
            page.click('button[type="submit"]')
            time.sleep(3)

        # Navigate to home/feed
        page.goto('https://www.linkedin.com/feed/')
        time.sleep(2)

        # Click "Start a post" button
        page.click('button[aria-label*="Start a post"]')
        time.sleep(1)

        # Fill in post content
        editor = page.locator('div[role="textbox"][contenteditable="true"]')
        editor.fill(content)
        time.sleep(1)

        # Click Post button
        page.click('button[aria-label*="Post"]')
        time.sleep(3)

        # Verify post was published
        success = page.is_visible('text=Post successful')

        browser.close()
        return success
```

### Step 3: Execute Posting

```
1. Extract LinkedIn credentials from environment variables
2. Call post_to_linkedin() function
3. Wait for confirmation
4. Handle any errors (2FA, rate limits, etc.)
```

### Step 4: Log Action

Write to vault/Logs/{today}.log:

```
[{timestamp}]
Action: LinkedIn Post Published
File: LINKEDIN_POST_{timestamp}.md
Status: Success/Failed
Post Preview: {first_50_chars}
URL: {linkedin_post_url_if_available}
---
```

### Step 5: Move to Done

```
Move vault/Approved/LINKEDIN_POST_{timestamp}.md to vault/Done/
Update Dashboard.md: "LinkedIn post published: {topic}"
```

## Alternative: Manual Posting Instructions

If browser automation fails, create manual posting instructions:

Write to vault/Needs_Action/MANUAL_LINKEDIN_POST_{timestamp}.md:

```markdown
---
type: manual_action
action: linkedin_post
status: pending
---

## LinkedIn Post - Manual Posting Required

Browser automation failed. Please post manually:

### Content to Post:

{post_content}

### Steps:
1. Go to https://www.linkedin.com
2. Click "Start a post"
3. Copy and paste the content above
4. Click "Post"
5. Move this file to Done/ when complete

### Hashtags:
{hashtags}
```

## Error Handling

### Login Issues
- If 2FA required: Pause and create manual posting instructions
- If credentials invalid: Log error and alert user
- If session expired: Re-authenticate

### Rate Limiting
- If LinkedIn blocks posting: Wait 1 hour and retry
- Log rate limit error
- Create manual posting instructions as fallback

### Network Issues
- Retry up to 3 times with exponential backoff
- If all retries fail: Create manual posting instructions

## Security Considerations

- Never log LinkedIn credentials
- Use environment variables for sensitive data
- Consider using persistent browser context to avoid repeated logins
- Respect LinkedIn's terms of service and rate limits

## Success Criteria

- Post successfully published to LinkedIn
- Action logged to Logs/
- Approval file moved to Done/
- Dashboard updated
- No errors or exceptions

## Notes

- First run may require manual 2FA verification
- Save browser session to avoid repeated logins
- Post during business hours for better engagement
- Monitor LinkedIn for any posting restrictions
- Keep browser automation updated with LinkedIn UI changes

## Example Usage

```bash
# Triggered by approval watcher
claude code /linkedin-post vault/Approved/LINKEDIN_POST_20260328.md
```

## Monitoring

After posting, optionally track:
- Post URL
- Initial engagement (first hour views/likes)
- Comments requiring response
- Connection requests from post viewers
