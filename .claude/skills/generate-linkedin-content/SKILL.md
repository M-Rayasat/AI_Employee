---
name: generate-linkedin-content
description: Generate engaging LinkedIn posts based on business goals and completed projects to drive sales
version: 1.0.0
---

# Generate LinkedIn Content Skill

This skill analyzes your business goals and recent achievements to create engaging LinkedIn posts that showcase your expertise and generate sales leads.

## Trigger

This skill is triggered:
- Manually when you want to create a LinkedIn post
- By scheduler (3x per week: Monday, Wednesday, Friday)
- After completing significant projects

## Workflow

1. **Read Business Strategy**: Review vault/Business_Goals.md for content guidelines
2. **Analyze Recent Work**: Check vault/Done/ for completed projects and achievements
3. **Generate Post**: Create engaging LinkedIn content (150-300 words)
4. **Create Approval**: Write post to Pending_Approval/ for review
5. **Log Action**: Record content generation

## Instructions for Claude

When this skill is invoked:

### Step 1: Read Business Goals
```
Read vault/Business_Goals.md
Extract:
- LinkedIn content guidelines
- Target topics
- Tone and style
- Hashtags to use
- Posting frequency
```

### Step 2: Analyze Recent Achievements
```
Read vault/Done/ folder (last 7 days)
Identify:
- Completed projects
- Solved problems
- Client wins
- Technical achievements
- Lessons learned
```

### Step 3: Generate Post Content

Create a LinkedIn post following these guidelines:

**Structure:**
- Hook (first line that grabs attention)
- Context/Story (what happened, why it matters)
- Value/Insight (what others can learn)
- Call-to-action (engage, comment, connect)

**Tone:**
- Professional but conversational
- Authentic and value-driven
- Showcase expertise without bragging
- Focus on helping others

**Length:**
- 150-300 words
- Use line breaks for readability
- 3-5 relevant hashtags at the end

**Topics to Cover:**
- AI automation success stories
- Business efficiency tips
- Project case studies
- Industry insights
- Productivity hacks
- Digital transformation lessons

### Step 4: Create Approval Request

Write to vault/Pending_Approval/LINKEDIN_POST_{timestamp}.md:

```markdown
---
type: approval_request
action: linkedin_post
created: {current_timestamp}
scheduled_for: {next_posting_day}
status: pending
priority: normal
---

## LinkedIn Post Content

{generated_post_content}

---

**Hashtags:** #AIAutomation #BusinessEfficiency #DigitalTransformation #ProductivityHacks {additional_relevant_hashtags}

## Post Strategy

**Goal:** {primary_goal: e.g., showcase expertise, generate leads, build authority}
**Target Audience:** {who this post is for}
**Expected Engagement:** {estimated views/likes based on past performance}

## Reasoning

{brief_explanation_of_why_this_content_and_timing}

## To Approve
Move this file to vault/Approved/ folder.

## To Reject
Move this file to vault/Rejected/ folder with reason.

## To Modify
Edit the "LinkedIn Post Content" section above, then move to Approved/.
```

### Step 5: Log and Complete
- Log action to vault/Logs/{today}.log
- Update Dashboard.md with "LinkedIn post drafted: {topic}"

## Content Ideas Generator

If no recent achievements to showcase, generate posts on:

1. **Industry Insights**: Share observations about AI/automation trends
2. **How-To Tips**: Quick productivity or automation tips
3. **Lessons Learned**: Share a mistake and what you learned
4. **Tool Reviews**: Discuss useful tools for business automation
5. **Ask Questions**: Engage audience with thought-provoking questions

## Example Post Templates

### Template 1: Project Success Story
```
Just completed an AI automation project that saved [X hours/week].

Here's what we built:
[Brief description]

The result?
✓ [Benefit 1]
✓ [Benefit 2]
✓ [Benefit 3]

Key lesson: [One actionable insight]

What's your biggest automation win? Drop it in the comments 👇

#AIAutomation #BusinessEfficiency #ProductivityHacks
```

### Template 2: Insight/Tip
```
Most businesses waste [X hours] on [manual task].

Here's a simple automation that fixes it:

[Step-by-step solution]

The best part? It takes [Y minutes] to set up.

Try it and let me know how much time you save.

#DigitalTransformation #Automation #BusinessTips
```

### Template 3: Lesson Learned
```
I made a costly mistake in [project/area].

The problem: [What went wrong]

The fix: [What I learned]

Now I always [new approach].

Have you faced something similar? Share your experience below.

#LessonsLearned #BusinessGrowth #Entrepreneurship
```

## Quality Checklist

Before creating approval request, ensure:
- [ ] Post is 150-300 words
- [ ] First line is attention-grabbing
- [ ] Provides clear value to readers
- [ ] Includes call-to-action
- [ ] Uses 3-5 relevant hashtags
- [ ] Tone matches Business_Goals.md guidelines
- [ ] No typos or grammatical errors
- [ ] Authentic and not overly promotional

## Success Criteria

- Approval request created in Pending_Approval/
- Post content is engaging and valuable
- Aligns with business goals
- Action logged
- Dashboard updated

## Notes

- Post 3x per week (Monday, Wednesday, Friday) for consistency
- Vary content types (stories, tips, insights, questions)
- Monitor engagement and adjust strategy
- Never post directly - always create approval requests
- Keep content authentic and value-driven
