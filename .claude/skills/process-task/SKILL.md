---
name: process-task
description: Process tasks from Needs_Action folder with Plan.md generation for complex tasks
version: 2.0.0
---

# Process Task Skill

Process tasks from the Needs_Action folder according to Company Handbook rules. For complex tasks, automatically creates Plan.md files with step-by-step execution plans.

## Usage

```
/process-task [optional: specific_task_file.md]
```

## What it does

1. Reads Company_Handbook.md for rules of engagement
2. Scans Needs_Action folder for pending tasks
3. Reviews each task and its metadata
4. **NEW: Creates Plan.md in Plans/ folder for complex tasks**
5. Processes task according to handbook guidelines
6. Moves completed tasks to Done/ with summary
7. Updates Dashboard.md with current status

## Workflow

- **Intake**: Read task files from Needs_Action/
- **Analysis**: Determine task type, priority, and requirements
- **Planning**: Create Plan.md for complex/multi-step tasks
- **Execution**: Process according to handbook rules
- **Completion**: Move to Done/ with completion notes
- **Update**: Refresh Dashboard.md

## Complex Task Detection

A task is considered **complex** if it requires:
- Multiple steps (3+ actions)
- External API calls or MCP server usage
- Human approval at any stage
- Coordination between multiple systems
- File generation (invoices, reports, etc.)
- Data processing or analysis

## Plan.md Generation

When a complex task is detected, create a plan file in vault/Plans/:

### Plan File Format

```markdown
---
task_id: {original_task_filename}
created: {timestamp}
status: pending
priority: {high|normal|low}
requires_approval: {true|false}
---

## Objective
{Clear statement of what needs to be accomplished}

## Context
{Background information from the original task}

## Steps

- [ ] Step 1: {Action description}
  - Details: {What needs to happen}
  - Tool/Skill: {Which tool or skill to use}
  - Output: {Expected result}

- [ ] Step 2: {Action description}
  - Details: {What needs to happen}
  - Tool/Skill: {Which tool or skill to use}
  - Output: {Expected result}

- [ ] Step 3: {Action description}
  - Details: {What needs to happen}
  - Tool/Skill: {Which tool or skill to use}
  - Output: {Expected result}

## Dependencies
- {List any prerequisites or dependencies}

## Approval Requirements
- {List which steps require human approval}

## Success Criteria
- {How to know when task is complete}

## Notes
- {Any additional context or considerations}
```

### Example Plan for Email Invoice Request

```markdown
---
task_id: EMAIL_abc123.md
created: 2026-03-28T10:30:00Z
status: pending
priority: high
requires_approval: true
---

## Objective
Generate and send January invoice to Client A

## Context
Client A requested invoice via email. Amount: $1,500 for consulting services.

## Steps

- [x] Step 1: Identify client details
  - Details: Extract client info from Company_Handbook.md
  - Tool/Skill: Read file
  - Output: Client A email and billing details

- [x] Step 2: Calculate invoice amount
  - Details: Check rates in vault/Accounting/Rates.md
  - Tool/Skill: Read file
  - Output: $1,500 confirmed

- [ ] Step 3: Generate invoice PDF
  - Details: Create invoice document with details
  - Tool/Skill: Invoice generation script
  - Output: vault/Invoices/2026-01_Client_A.pdf

- [ ] Step 4: Draft email response
  - Details: Professional email with invoice attached
  - Tool/Skill: /process-email skill
  - Output: Approval request in Pending_Approval/

- [ ] Step 5: Send email (REQUIRES APPROVAL)
  - Details: Send via Email MCP after human approval
  - Tool/Skill: /handle-approval skill
  - Output: Email sent confirmation

- [ ] Step 6: Log transaction
  - Details: Record in accounting logs
  - Tool/Skill: Write to Logs/
  - Output: Transaction logged

## Dependencies
- Client details in Company_Handbook.md
- Rate information in Accounting/Rates.md
- Email MCP server configured

## Approval Requirements
- Step 4: Email draft requires human review
- Step 5: Email send requires human approval

## Success Criteria
- Invoice generated and saved
- Email sent to client
- Transaction logged
- Original task moved to Done/

## Notes
- Client is existing customer, standard rates apply
- Invoice due date: 30 days from send date
```

## Simple Task Processing

For simple tasks (single action, no approval needed):
- Process immediately without creating Plan.md
- Move directly to Done/ when complete
- Update Dashboard

Examples of simple tasks:
- File organization
- Dashboard updates
- Reading/summarizing documents
- Simple data lookups

## Rules

- Follow Company_Handbook.md guidelines strictly
- **Always create Plan.md for complex tasks**
- Flag items requiring human approval
- Create audit trail for all actions
- Never delete files without approval
- Escalate sensitive matters (payments, legal, PII)
- Update plan checkboxes as steps complete
- Move plan to Done/ when all steps complete

## Integration with Execute-Plan Skill

After creating a Plan.md:
1. Save plan to vault/Plans/
2. Optionally trigger /execute-plan skill to begin execution
3. Or wait for orchestrator to pick up the plan

## Success Criteria

- All tasks in Needs_Action/ processed
- Complex tasks have Plan.md files created
- Simple tasks completed and moved to Done/
- Dashboard updated with current status
- All actions logged
