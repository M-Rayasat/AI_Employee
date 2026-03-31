---
name: business-audit
description: Weekly business audit with CEO briefing generation analyzing tasks, goals, and bottlenecks
version: 1.0.0
---

# Business Audit Skill

This skill performs weekly business audits by analyzing completed tasks, business goals, and system performance. It generates a comprehensive "Monday Morning CEO Briefing" with insights, metrics, and proactive suggestions.

## Trigger

This skill is triggered:
- Automatically every Sunday at 8:00 PM (via scheduler)
- Manually when requested
- With `--daily` flag for daily briefings

## Workflow

1. **Read Business Goals**: Load objectives and metrics from Business_Goals.md
2. **Analyze Completed Work**: Review Done/ folder for the audit period
3. **Calculate Metrics**: Compute task completion, response times, bottlenecks
4. **Identify Issues**: Find inefficiencies, delays, unused subscriptions
5. **Generate Briefing**: Create comprehensive CEO briefing in Briefings/
6. **Update Dashboard**: Summarize key findings

## Instructions for Claude

When this skill is invoked:

### Step 1: Determine Audit Period

```
Default: Last 7 days (weekly audit)
With --daily flag: Last 24 hours
With --monthly flag: Last 30 days

Calculate:
- start_date: {period_start}
- end_date: {current_date}
```

### Step 2: Read Business Goals

```
Read vault/Business_Goals.md
Extract:
- Revenue targets
- Key metrics and thresholds
- Active projects
- Subscription audit rules
- Business strategy
```

### Step 3: Analyze Completed Tasks

```
Read all files in vault/Done/ from audit period
Categorize by type:
- Emails processed
- Social media posts (Twitter, Facebook, Instagram)
- WhatsApp messages handled
- Plans completed
- Approvals executed
- Files processed

Calculate:
- Total tasks completed
- Average completion time
- Tasks by priority
- Tasks requiring approval
```

### Step 4: Identify Bottlenecks

```
Analyze task completion times:
- Tasks taking > 2x expected time
- Tasks with multiple retries
- Tasks requiring escalation
- Blocked or delayed tasks

Flag:
- Slow response times
- Repeated failures
- Resource constraints
```

### Step 5: Review Metrics Against Goals

```
Compare actual vs target:
- Revenue: actual vs monthly goal (from Odoo)
- Expenses: actual vs budget (from Odoo)
- Profit: actual vs target (from Odoo)
- Response time: actual vs < 24 hours target
- Social media engagement: actual vs targets
- Email response rate: actual vs > 80% target
- Overdue invoices: count and total amount (from Odoo)

Status for each metric:
- ✓ On track (within 10% of target)
- ⚠ Warning (10-25% off target)
- ✗ Critical (>25% off target)
```

### Step 6: Subscription Audit (Weekly Only)

```
If weekly audit:
  Read vault/Logs/ for subscription charges
  For each subscription:
    - Check last usage date
    - Compare cost vs value
    - Flag if:
      - No usage in 30+ days
      - Cost increased >20%
      - Duplicate functionality exists
```

### Step 7: Pull Financial Data from Odoo

```
Use Odoo MCP server:

Tool: get_profit_loss
Parameters:
  - start_date: {period_start}
  - end_date: {period_end}
Returns: revenue, expenses, profit

Tool: get_overdue_invoices
Returns: count, overdue_invoices list

Tool: get_balance_sheet
Returns: assets, liabilities, equity

Calculate:
- Total revenue for period
- Total expenses for period
- Net profit/loss
- Profit margin percentage
- Overdue invoice count and amount
- Cash flow status
```

### Step 8: Generate CEO Briefing

Write to vault/Briefings/{date}_Briefing.md:

```markdown
---
generated: {timestamp}
period: {start_date} to {end_date}
audit_type: {weekly|daily|monthly}
---

# {Day} Morning CEO Briefing

*Generated: {readable_date}*

## Executive Summary

{2-3 sentence overview of the period: strong/weak performance, key wins, critical issues}

## Key Metrics

### Financial Performance (from Odoo)
| Metric | Target | Actual | Status | Trend |
|--------|--------|--------|--------|-------|
| Revenue | ${monthly_goal} | ${actual_revenue} | {✓/⚠/✗} | {↑/→/↓} |
| Expenses | ${expense_budget} | ${actual_expenses} | {✓/⚠/✗} | {↑/→/↓} |
| Net Profit | ${profit_target} | ${actual_profit} | {✓/⚠/✗} | {↑/→/↓} |
| Profit Margin | {target}% | {actual}% | {✓/⚠/✗} | {↑/→/↓} |
| Overdue Invoices | 0 | {count} (${amount}) | {✓/⚠/✗} | {↑/→/↓} |

### Operational Performance
| Metric | Target | Actual | Status | Trend |
|--------|--------|--------|--------|-------|
| Tasks Completed | {expected} | {actual} | {✓/⚠/✗} | {↑/→/↓} |
| Email Response Time | < 24h | {actual_avg}h | {✓/⚠/✗} | {↑/→/↓} |
| Social Media Posts | {target} | {actual} | {✓/⚠/✗} | {↑/→/↓} |
| WhatsApp Responses | < 1h | {actual_avg}h | {✓/⚠/✗} | {↑/→/↓} |

## Completed This Period

### Tasks by Category
- **Emails Processed:** {count} ({x}% of total)
- **Social Media Posts:** {count} (Twitter: {x}, Facebook: {x}, Instagram: {x})
- **WhatsApp Messages:** {count} ({x}% of total)
- **Plans Executed:** {count} ({x}% of total)
- **Approvals Handled:** {count} ({x}% of total)
- **Invoices Created:** {count} (Total: ${amount})
- **Payments Recorded:** {count} (Total: ${amount})
- **Expenses Logged:** {count} (Total: ${amount})

### Notable Achievements
- {Achievement 1 with impact}
- {Achievement 2 with impact}
- {Achievement 3 with impact}

## Bottlenecks & Issues

{If bottlenecks found:}
| Task | Expected | Actual | Delay | Root Cause |
|------|----------|--------|-------|------------|
| {task_name} | {expected_time} | {actual_time} | +{delay} | {reason} |

{If no bottlenecks:}
✓ No significant bottlenecks detected this period.

## Proactive Suggestions

### Financial Health
{If overdue invoices found:}
- **Overdue Invoices**: {count} invoices totaling ${amount}
  - {Customer 1}: ${amount} ({days} days overdue)
  - {Customer 2}: ${amount} ({days} days overdue)
  - [ACTION] Follow up with customers? Create reminder emails?

{If profit margin low:}
- **Profit Margin Alert**: Current margin {actual}% vs target {target}%
  - [ACTION] Review pricing strategy or reduce expenses?

{If cash flow negative:}
- **Cash Flow Warning**: Negative cash flow of ${amount}
  - [ACTION] Accelerate collections or defer expenses?

### Cost Optimization
{If unused subscriptions found:}
- **{Service Name}**: No activity in {days} days. Cost: ${amount}/month.
  - [ACTION] Cancel subscription? Move to /Pending_Approval

{If no issues:}
✓ All subscriptions actively used.

### Process Improvements
{Suggestions based on patterns:}
- {Suggestion 1 with reasoning}
- {Suggestion 2 with reasoning}

### Upcoming Deadlines
{From Business_Goals.md active projects:}
- **{Project Name}**: Due {date} ({days_remaining} days)
  - Status: {on_track|at_risk|delayed}
  - Action needed: {what_to_do}

## System Health

- **Watchers Status:** {all_running|issues_detected}
- **Error Rate:** {percentage}% ({count} errors)
- **Approval Backlog:** {count} pending approvals
- **Storage Usage:** {percentage}% of available

## Recommendations

### High Priority
1. {Action item 1 with deadline}
2. {Action item 2 with deadline}

### Medium Priority
1. {Action item 1}
2. {Action item 2}

### Low Priority
1. {Action item 1}
2. {Action item 2}

---

*Next briefing: {next_briefing_date}*
*Generated by AI Employee v1.0 - Gold Tier*
*Financial data powered by Odoo Community*
```

### Step 8: Update Dashboard

```
Update vault/Dashboard.md:
- Add briefing link to Recent Activity
- Update key metrics summary
- Flag critical issues at top
- Add "Last Audit" timestamp
```

### Step 9: Log Audit

```
Write to vault/Logs/{today}.log:
[{timestamp}] BUSINESS AUDIT COMPLETED
Period: {start_date} to {end_date}
Tasks analyzed: {count}
Briefing: {briefing_filename}
Issues found: {count}
Suggestions: {count}
---
```

## Metrics Calculation Examples

### Average Email Response Time

```python
email_tasks = [task for task in done_tasks if task.type == 'email']
response_times = []

for task in email_tasks:
    received = task.metadata['received']
    completed = task.metadata['completed']
    response_time = (completed - received).total_hours()
    response_times.append(response_time)

avg_response_time = sum(response_times) / len(response_times)
```

### Task Completion Rate

```python
total_tasks = len(done_tasks)
expected_tasks = days_in_period * expected_tasks_per_day

completion_rate = (total_tasks / expected_tasks) * 100
status = '✓' if completion_rate >= 90 else '⚠' if completion_rate >= 75 else '✗'
```

### Bottleneck Detection

```python
for task in done_tasks:
    expected_time = task.metadata.get('expected_duration', 60)  # minutes
    actual_time = task.metadata['duration']

    if actual_time > expected_time * 2:
        bottlenecks.append({
            'task': task.name,
            'expected': expected_time,
            'actual': actual_time,
            'delay': actual_time - expected_time,
            'reason': analyze_delay_reason(task)
        })
```

## Success Criteria

- Briefing generated in Briefings/ folder
- All metrics calculated accurately
- Bottlenecks identified with root causes
- Proactive suggestions provided
- Dashboard updated with summary
- Audit logged

## Example Usage

```bash
# Weekly audit (default)
claude code /business-audit

# Daily briefing
claude code /business-audit --daily

# Monthly audit
claude code /business-audit --monthly
```

## Notes

- Run weekly audits on Sunday evening for Monday morning review
- Daily briefings are shorter, focus on immediate issues
- Monthly audits include deeper analysis and trends
- Always provide actionable recommendations
- Flag critical issues prominently
- Keep briefings concise but comprehensive
- Use data-driven insights, not assumptions
