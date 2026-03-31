---
name: update-dashboard
description: Update Dashboard.md with current system statistics, metrics, and status for Silver Tier
version: 2.0.0
---

# Update Dashboard Skill

Updates the Dashboard.md with current system statistics, metrics, and status including Silver Tier features like email processing, LinkedIn posts, and approval workflows.

## Usage

```
/update-dashboard
```

## What it does

1. Scans all vault folders (Inbox, Needs_Action, Done, Plans, Pending_Approval, Approved, Logs)
2. Counts files in each folder
3. Calculates Silver Tier metrics (emails processed, LinkedIn posts, approvals)
4. Identifies recent activity (last 24 hours)
5. Checks system health (watcher status, error rates)
6. Updates Dashboard.md with current statistics
7. Adds timestamp of last update

## Information Displayed

### Bronze Tier (Existing)
- System status
- File counts per folder
- Recent completed tasks
- Tasks requiring attention

### Silver Tier (New)
- Pending approvals count
- Recent emails processed (last 24 hours)
- LinkedIn posts this week
- Last watcher check times
- System health indicators
- Error rate and warnings

## Dashboard Structure

```markdown
# AI Employee Dashboard

*Last updated: {timestamp}*
*Tier: Silver*

---

## System Status

**Overall Health:** {🟢 Healthy | 🟡 Warning | 🔴 Critical}

### Watchers
- Gmail Watcher: {🟢 Running | 🔴 Stopped} (Last check: {time})
- Approval Watcher: {🟢 Running | 🔴 Stopped} (Last check: {time})
- Filesystem Watcher: {🟢 Running | 🔴 Stopped} (Last check: {time})

### System Metrics
- Error Rate: {percentage}% ({count} errors in last 24h)
- Uptime: {duration}
- Tasks Processed Today: {count}

---

## Pending Items

### 🔔 Requires Immediate Attention
- **Pending Approvals:** {count} items in Pending_Approval/
- **Needs Action:** {count} tasks in Needs_Action/
- **Active Plans:** {count} plans in execution

### 📋 Task Breakdown
| Folder | Count | Status |
|--------|-------|--------|
| Inbox | {count} | {status} |
| Needs_Action | {count} | {status} |
| Pending_Approval | {count} | {⚠️ if > 5} |
| Plans | {count} | {status} |

---

## Recent Activity (Last 24 Hours)

### Emails
- **Processed:** {count} emails
- **Responses Sent:** {count} emails
- **Average Response Time:** {hours}h

### LinkedIn
- **Posts Published:** {count} this week
- **Posts Pending:** {count} awaiting approval
- **Next Scheduled Post:** {date}

### Tasks Completed
{List of recent completed tasks with timestamps}
- [{time}] {task_description}
- [{time}] {task_description}
- [{time}] {task_description}

---

## This Week Summary

### Productivity Metrics
- **Total Tasks Completed:** {count}
- **Emails Processed:** {count}
- **LinkedIn Posts:** {count}
- **Plans Executed:** {count}
- **Approvals Handled:** {count}

### Performance
- **Average Task Completion Time:** {minutes} min
- **Email Response Rate:** {percentage}%
- **Approval Turnaround:** {hours}h average

---

## Alerts & Warnings

{If any issues detected:}
⚠️ **Warnings:**
- {Warning message 1}
- {Warning message 2}

{If critical issues:}
🔴 **Critical Issues:**
- {Critical issue 1}
- {Critical issue 2}

{If all good:}
✅ No alerts or warnings

---

## Quick Actions

- 📧 [Process Emails](/process-email)
- 📱 [Generate LinkedIn Content](/generate-linkedin-content)
- 📊 [Run Business Audit](/business-audit)
- 📝 [Process Tasks](/process-task)

---

*Dashboard auto-updates every hour*
*Manual update: Run `/update-dashboard`*
```

## Metrics Calculation

### Email Metrics
```
Count files in Done/ with type: email from last 24 hours
Calculate average time from received to completed
Count EMAIL_REPLY_* files in Logs/ for responses sent
```

### LinkedIn Metrics
```
Count LINKEDIN_POST_* files in Done/ from this week
Count LINKEDIN_POST_* files in Pending_Approval/
Check scheduler for next posting time
```

### System Health
```
Check watcher.log for last activity timestamps
Count errors in Logs/ from last 24 hours
Calculate error rate: (errors / total_actions) * 100
Determine overall health:
  - 🟢 Healthy: error_rate < 5%, all watchers running
  - 🟡 Warning: error_rate 5-15% OR 1 watcher down
  - 🔴 Critical: error_rate > 15% OR multiple watchers down
```

### Approval Metrics
```
Count files in Pending_Approval/
Flag if count > 5 (backlog warning)
Calculate average approval turnaround from Logs/
```

## When to use

- After processing tasks
- After moving files between folders
- On system startup
- Hourly (via scheduler)
- After significant events (email sent, post published)
- When checking system health

## Success Criteria

- Dashboard.md updated with current data
- All metrics calculated accurately
- Timestamps are current
- Health status reflects actual system state
- Recent activity shows last 24 hours
- Alerts flagged appropriately

## Notes

- Dashboard updates are logged to Logs/
- Keep recent activity to last 10 items max
- Archive old dashboard versions weekly
- Use emojis for visual clarity
- Ensure all counts are accurate
- Flag stale data (> 1 hour old) with warning
