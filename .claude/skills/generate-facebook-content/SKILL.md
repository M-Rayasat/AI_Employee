---
name: generate-facebook-content
description: Generate engaging Facebook posts from business updates and news
version: 1.0.0
---

# Generate Facebook Content Skill

This skill creates engaging Facebook posts from business updates, achievements, or news.

## Trigger

This skill is triggered when:
- Scheduled by scheduler.py (Mon/Wed/Fri at 11 AM)
- Manually invoked for specific business updates
- Requested via task file in Needs_Action/

## Workflow

1. **Check Recent Activity**: Review recent business events from logs and vault
2. **Select Content Type**: Choose appropriate post format
3. **Generate Post**: Create engaging Facebook post
4. **Create Approval**: Write approval request to Pending_Approval/
5. **Log Action**: Record generation to Logs/

## Instructions for Claude

When this skill is invoked:

### Step 1: Gather Context
```
Read recent files from:
- vault/Logs/{recent_dates}.log - Recent business activities
- vault/Done/ - Completed tasks (last 7 days)
- vault/Company_Handbook.md - Brand voice and guidelines
```

### Step 2: Select Content Type
Choose from:
- **Achievement Post**: Celebrate milestones, completed projects
- **Insight Post**: Share industry knowledge or tips
- **Update Post**: Announce new services, features, or news
- **Engagement Post**: Ask questions, polls, or community interaction
- **Behind-the-Scenes**: Show work process or team culture

### Step 3: Generate Post Content
Create Facebook post following these guidelines:
- **Length**: 100-300 words (Facebook allows longer posts)
- **Tone**: Professional yet friendly and conversational
- **Structure**:
  - Hook (first line grabs attention)
  - Main content (value or story)
  - Call-to-action (optional)
- **Formatting**: Use line breaks for readability
- **Emojis**: 1-3 relevant emojis (not excessive)
- **Hashtags**: 2-5 relevant hashtags at the end
- **Links**: Include if relevant (website, blog, etc.)

### Step 4: Create Approval Request
Write to vault/Pending_Approval/FACEBOOK_POST_{timestamp}.md:

```markdown
---
type: approval_request
action: post_to_facebook
created: {current_timestamp}
expires: {timestamp_24h_from_now}
status: pending
priority: medium
---

## Proposed Facebook Post

{generated_post_content}

## Post Details
- **Type:** {content_type}
- **Estimated Reach:** {estimate based on page size}
- **Best Time to Post:** {suggest optimal time}

## Reasoning

{brief_explanation_of_content_choice}

## To Approve
Move this file to vault/Approved/ folder.

## To Reject
Move this file to vault/Rejected/ folder with reason.

## To Modify
Edit the "Proposed Facebook Post" section above, then move to Approved/.
```

### Step 5: Log and Complete
- Log action to vault/Logs/{today}.log
- Update Dashboard.md with "Facebook post generated"

## Content Guidelines

**DO:**
- Be authentic and genuine
- Provide value (educate, inspire, or entertain)
- Use storytelling when appropriate
- Include clear call-to-action
- Match brand voice from Company_Handbook.md
- Use proper grammar and spelling

**DON'T:**
- Be overly promotional or salesy
- Use clickbait or misleading content
- Post controversial or divisive content
- Overuse hashtags or emojis
- Copy competitors' content

## Example Posts

### Achievement Post
```
🎉 Milestone Alert!

We're thrilled to share that we've successfully completed our 50th project this year! From web development to mobile apps, each project has been a unique journey with amazing clients.

Thank you to everyone who trusted us with their vision. Here's to the next 50! 🚀

#WebDevelopment #MilestoneMoment #BusinessGrowth #TechSuccess
```

### Insight Post
```
💡 Quick Tip for Business Owners:

Did you know that 75% of users judge a company's credibility based on their website design?

Your website is often the first impression potential customers have of your business. Investing in professional web design isn't just about aesthetics—it's about building trust and credibility.

What's one thing you look for when visiting a business website? Let us know in the comments! 👇

#WebDesign #BusinessTips #DigitalMarketing #WebDevelopment
```

### Update Post
```
📢 Exciting News!

We're expanding our services to include mobile app development! 📱

After months of preparation and team training, we're ready to help businesses bring their app ideas to life. Whether it's iOS, Android, or cross-platform, we've got you covered.

Interested in building an app? Drop us a message or visit our website to learn more!

#MobileAppDevelopment #NewServices #TechInnovation #AppDevelopment
```

## Error Handling

- If no recent activity found: Generate general industry insight post
- If Company_Handbook.md missing: Use default professional tone
- If unable to generate content: Create alert for manual content creation

## Success Criteria

- Approval request created in Pending_Approval/
- Post content is engaging and on-brand
- Action logged
- Dashboard updated

## Notes

- Facebook posts can be longer than Twitter (no 280 char limit)
- Visual content (images/videos) increases engagement significantly
- Best posting times: Mon-Fri 1-4 PM, Wed at 3 PM is optimal
- Avoid posting on weekends unless specifically relevant
- Monitor comments after posting for engagement opportunities
