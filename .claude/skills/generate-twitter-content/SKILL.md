---
name: generate-twitter-content
description: Generate engaging tweets based on business updates and goals
version: 1.0.0
---

# Generate Twitter Content Skill

This skill analyzes recent business activities and creates engaging tweets to share updates and drive engagement.

## Trigger

This skill is triggered:
- By scheduler (daily at 10 AM, 3 PM)
- Manually when user wants to create a tweet
- After completing significant projects

## Workflow

1. **Read Business Strategy**: Review vault/Business_Goals.md for Twitter strategy
2. **Analyze Recent Work**: Check vault/Done/ for completed tasks and achievements
3. **Generate Tweet**: Create engaging tweet (max 280 chars)
4. **Create Approval**: Write tweet to Pending_Approval/ for review

## Instructions for Claude

When this skill is invoked:

### Step 1: Read Business Goals
```
Read vault/Business_Goals.md
Extract:
- Twitter content guidelines
- Target topics
- Tone and style
- Hashtags to use
- Posting frequency
```

### Step 2: Analyze Recent Achievements
```
Read vault/Done/ folder (last 24 hours)
Identify:
- Completed projects
- Client wins
- Technical achievements
- Business milestones
- Interesting insights
```

### Step 3: Generate Tweet
Create engaging tweet following these guidelines:
- **Length**: Max 280 characters
- **Tone**: Professional but conversational
- **Structure**: Hook → Value → Call-to-action (optional)
- **Hashtags**: 2-3 relevant hashtags
- **Engagement**: Ask questions or share insights

**Tweet Types (Rotate):**
- Achievement announcements
- Industry insights
- Quick tips
- Behind-the-scenes
- Questions to audience
- Milestone celebrations

### Step 4: Create Approval Request
Write to vault/Pending_Approval/TWITTER_POST_{timestamp}.md:

```markdown
---
type: approval_request
action: post_tweet
created: {current_timestamp}
expires: {timestamp_24h_from_now}
status: pending
priority: normal
---

## Proposed Tweet

{drafted_tweet}

**Character count:** {char_count}/280

## Context

**Based on:** {source_of_content}
**Topic:** {tweet_topic}
**Goal:** {engagement_goal}

## Reasoning

{brief_explanation_of_why_this_tweet}

**Category:** {tweet_type}
**Expected engagement:** {engagement_prediction}

## To Approve
Move this file to vault/Approved/ folder.

## To Reject
Move this file to vault/Rejected/ folder with reason.

## To Modify
Edit the "Proposed Tweet" section above, then move to Approved/.
```

### Step 5: Log and Complete
- Log action to vault/Logs/{today}.log
- Update Dashboard.md with "Twitter content generated"

## Tweet Guidelines

### Good Tweet Examples:
```
Just automated our email workflow with AI - now processing 50+ emails/day with 95% accuracy. The future of business automation is here! 🚀 #AIAutomation #BusinessEfficiency
```

```
Lesson learned: Human-in-the-loop isn't a bottleneck, it's a safety net. Our AI drafts, we approve, everyone wins. What's your approach to AI automation? 🤔 #AI #Automation
```

### Avoid:
- Overly promotional content
- Controversial topics
- Negative sentiment
- Excessive hashtags (>3)
- All caps or excessive emojis

## Success Criteria

- Tweet generated within 280 characters
- Approval request created
- Action logged
- Dashboard updated

## Notes

- Generate tweets that provide value to audience
- Align with business goals and brand voice
- Rotate between different tweet types
- Include relevant hashtags for discoverability
- Keep tone authentic and engaging
