---
name: generate-instagram-content
description: Generate engaging Instagram posts with captions and hashtags
version: 1.0.0
---

# Generate Instagram Content Skill

This skill creates engaging Instagram posts with captions and hashtags from business updates or creative ideas.

## Trigger

This skill is triggered when:
- Scheduled by scheduler.py (Tue/Thu/Sat at 2 PM)
- Manually invoked for specific content
- Requested via task file in Needs_Action/

## Workflow

1. **Check Recent Activity**: Review recent business events from logs and vault
2. **Select Content Type**: Choose appropriate post format
3. **Generate Caption**: Create engaging Instagram caption with hashtags
4. **Suggest Image**: Recommend image type or provide image URL
5. **Create Approval**: Write approval request to Pending_Approval/
6. **Log Action**: Record generation to Logs/

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
- **Portfolio Showcase**: Display completed work or projects
- **Behind-the-Scenes**: Show work process or team culture
- **Tip/Tutorial**: Share quick industry tips or how-tos
- **Inspiration**: Motivational or inspirational content
- **Announcement**: New services, features, or news
- **Engagement**: Questions, polls, or interactive content

### Step 3: Generate Caption
Create Instagram caption following these guidelines:
- **Length**: 125-150 characters for optimal engagement (can go up to 2,200)
- **First Line**: Hook that grabs attention (shows in feed preview)
- **Structure**:
  - Hook (first line)
  - Main content (story, value, or message)
  - Call-to-action
  - Hashtags (separate section at end)
- **Tone**: Authentic, conversational, and engaging
- **Emojis**: 2-5 relevant emojis (Instagram is visual and emoji-friendly)
- **Line Breaks**: Use for readability (Instagram supports formatting)

### Step 4: Hashtag Strategy
- **Count**: 5-10 hashtags (optimal range)
- **Mix**: Combine popular, niche, and branded hashtags
- **Relevance**: All hashtags must be relevant to content
- **Placement**: At the end of caption, separated by line breaks

**Hashtag Categories:**
- Industry-specific (e.g., #WebDevelopment, #MobileApps)
- Location-based (if relevant)
- Branded (company hashtag)
- Trending (if relevant)
- Community (e.g., #TechCommunity)

### Step 5: Image Recommendation
Suggest image type:
- **Portfolio**: Screenshot or photo of completed work
- **Quote**: Text overlay on branded background
- **Behind-the-Scenes**: Team photo or workspace
- **Infographic**: Visual data or tips
- **Product**: Service showcase or feature highlight

**Note**: Image URL must be publicly accessible for Instagram API

### Step 6: Create Approval Request
Write to vault/Pending_Approval/INSTAGRAM_POST_{timestamp}.md:

```markdown
---
type: approval_request
action: post_to_instagram
created: {current_timestamp}
expires: {timestamp_24h_from_now}
status: pending
priority: medium
---

## Proposed Instagram Post

### Caption
{generated_caption_with_emojis}

### Hashtags
{hashtag_list}

### Image Recommendation
**Type:** {image_type}
**Suggestion:** {image_description}
**Image URL:** {image_url_if_available}

## Post Details
- **Content Type:** {content_type}
- **Best Time to Post:** {suggest_optimal_time}
- **Target Audience:** {audience_description}

## Reasoning

{brief_explanation_of_content_choice}

## To Approve
1. Ensure image URL is added (if not already present)
2. Move this file to vault/Approved/ folder

## To Reject
Move this file to vault/Rejected/ folder with reason.

## To Modify
Edit the caption or hashtags above, then move to Approved/.
```

### Step 7: Log and Complete
- Log action to vault/Logs/{today}.log
- Update Dashboard.md with "Instagram post generated"

## Caption Guidelines

**DO:**
- Start with a strong hook
- Tell a story or provide value
- Use emojis naturally (not excessively)
- Include clear call-to-action
- Use line breaks for readability
- Match brand voice
- Keep first line compelling (shows in feed)

**DON'T:**
- Use all caps (except for emphasis)
- Overuse hashtags (max 10)
- Use irrelevant hashtags
- Copy competitors' content
- Be overly promotional
- Use banned or spammy hashtags

## Example Posts

### Portfolio Showcase
```
✨ From concept to reality ✨

We recently completed this stunning e-commerce website for a local boutique. Swipe to see the transformation!

The challenge? Create a seamless shopping experience that reflects their brand personality. The result? A 40% increase in online sales in just 2 months! 📈

Ready to transform your online presence? Link in bio! 👆

#WebDesign #EcommerceDevelopment #WebDevelopment #DigitalTransformation #OnlineBusiness #TechSolutions #WebsiteDesign #BusinessGrowth
```

### Behind-the-Scenes
```
☕ Monday morning vibes at the office ☕

Our team brainstorming the next big project. This is where the magic happens! 💡

What does your workspace look like? Drop a photo in the comments! 👇

#TechLife #DeveloperLife #TeamWork #OfficeVibes #TechCommunity #WebDevelopers #StartupLife
```

### Tip/Tutorial
```
💡 Quick Tip: Website Speed Matters!

Did you know? 53% of mobile users abandon sites that take longer than 3 seconds to load.

Here's how to speed up your site:
✅ Optimize images
✅ Enable caching
✅ Minimize code
✅ Use a CDN

Need help optimizing your website? DM us! 📩

#WebDevelopment #WebsiteTips #TechTips #DigitalMarketing #WebPerformance #SEO #WebDesign
```

### Announcement
```
🎉 BIG NEWS! 🎉

We're expanding our services to include mobile app development! 📱

iOS, Android, or cross-platform - we've got you covered. Your app idea deserves to come to life!

Interested? Link in bio or DM us to get started! 🚀

#MobileAppDevelopment #AppDevelopment #iOSDevelopment #AndroidDevelopment #TechNews #NewServices #AppDesign
```

## Instagram Best Practices

**Posting Times:**
- Best days: Tuesday, Wednesday, Thursday
- Best times: 11 AM - 1 PM, 7 PM - 9 PM
- Avoid: Early mornings and late nights

**Engagement:**
- Respond to comments within first hour
- Use Instagram Stories for behind-the-scenes
- Engage with followers' content
- Use location tags when relevant

**Image Requirements:**
- Format: JPG or PNG
- Aspect ratio: 1:1 (square) or 4:5 (portrait)
- Resolution: Minimum 1080x1080px
- File size: Under 8MB
- Image URL must be publicly accessible

## Error Handling

- If no recent activity found: Generate general industry tip or inspiration post
- If Company_Handbook.md missing: Use default professional yet creative tone
- If unable to generate content: Create alert for manual content creation
- If no image URL available: Request user to provide image before approval

## Success Criteria

- Approval request created in Pending_Approval/
- Caption is engaging and on-brand
- Hashtags are relevant and optimized
- Image recommendation provided
- Action logged
- Dashboard updated

## Notes

- Instagram is highly visual - image quality matters most
- First line of caption is crucial (shows in feed preview)
- Hashtags help discoverability but don't overdo it
- Instagram favors authentic, engaging content over promotional
- Stories and Reels get more reach than static posts (consider for future)
- Monitor comments and engagement after posting
- Instagram Business account required for API access
