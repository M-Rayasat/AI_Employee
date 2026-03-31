---
name: execute-plan
description: Execute multi-step plans from Plans/ folder with checkbox tracking
version: 1.0.0
---

# Execute Plan Skill

This skill executes multi-step plans created by the process-task skill. It reads Plan.md files, executes each unchecked step sequentially, updates checkboxes as completed, and handles failures gracefully.

## Trigger

This skill is triggered when:
- New Plan.md files appear in vault/Plans/
- Orchestrator detects pending plans
- Manually invoked for specific plan

## Workflow

1. **Read Plan**: Load plan from Plans/ folder
2. **Validate**: Ensure plan is properly formatted
3. **Execute Steps**: Process each unchecked step sequentially
4. **Update Progress**: Mark steps as completed with checkboxes
5. **Handle Failures**: Log errors and flag for human review
6. **Complete**: Move plan to Done/ when all steps complete

## Instructions for Claude

When this skill is invoked with a plan file path:

### Step 1: Read and Parse Plan

```
Read vault/Plans/PLAN_{name}_{timestamp}.md
Extract from frontmatter:
- task_id: original task reference
- status: current status
- priority: task priority
- requires_approval: approval flag

Parse steps section:
- Identify all steps (checked and unchecked)
- Extract step details, tools, expected outputs
```

### Step 2: Validate Plan

Check:
- Plan file is properly formatted
- All required fields present
- Steps are clearly defined
- Dependencies are met
- No expired approval requirements

### Step 3: Execute Unchecked Steps

For each unchecked step `- [ ]`:

```markdown
1. Read step details:
   - Action description
   - Tool/Skill to use
   - Expected output

2. Check dependencies:
   - Are previous steps completed?
   - Are required files/data available?

3. Execute the step:
   - Use specified tool or skill
   - Capture output/result
   - Handle any errors

4. Update checkbox:
   - Change `- [ ]` to `- [x]`
   - Add completion timestamp in notes
   - Save updated plan

5. Log execution:
   - Write to vault/Logs/{today}.log
   - Include step number, action, result
```

### Step 4: Handle Approval Steps

If step requires approval:

```markdown
1. Create approval request in Pending_Approval/
2. Mark step as "waiting for approval"
3. Pause plan execution
4. Log approval request created
5. Wait for approval watcher to process
6. Resume when approval file moves to Approved/
```

### Step 5: Error Handling

If step execution fails:

```markdown
1. Log detailed error to vault/Logs/{today}.log
2. Update plan with error note:
   - [ ] Step X: {description}
     - Status: FAILED
     - Error: {error_message}
     - Timestamp: {when_failed}

3. Create error report in vault/Needs_Action/:
   ---
   type: plan_execution_error
   plan_file: {plan_filename}
   failed_step: {step_number}
   ---

   ## Plan Execution Failed

   **Plan:** {plan_filename}
   **Failed Step:** Step {number} - {description}
   **Error:** {error_message}

   ## What Happened
   {detailed_explanation}

   ## Next Steps
   - [ ] Review error details
   - [ ] Fix underlying issue
   - [ ] Resume plan execution

   ## Technical Details
   {debug_info}

4. Update plan status to "failed"
5. Do NOT move to Done/
6. Alert via Dashboard update
```

### Step 6: Complete Plan

When all steps are checked:

```markdown
1. Update plan frontmatter:
   status: completed
   completed_at: {timestamp}

2. Move plan from Plans/ to Done/

3. Move original task file to Done/ (if not already)

4. Log completion to vault/Logs/{today}.log

5. Update Dashboard.md:
   - Remove from active tasks
   - Add to completed tasks
   - Update metrics

6. Create completion summary in plan:
   ## Completion Summary
   - Started: {start_time}
   - Completed: {end_time}
   - Duration: {time_taken}
   - Steps executed: {count}
   - Approvals required: {count}
   - Status: Success
```

## Example Execution Flow

### Initial Plan State

```markdown
---
task_id: EMAIL_abc123.md
status: pending
---

## Steps

- [ ] Step 1: Identify client details
- [ ] Step 2: Calculate invoice amount
- [ ] Step 3: Generate invoice PDF
- [ ] Step 4: Draft email response
- [ ] Step 5: Send email (REQUIRES APPROVAL)
```

### After Executing Steps 1-2

```markdown
---
task_id: EMAIL_abc123.md
status: in_progress
---

## Steps

- [x] Step 1: Identify client details
  - Completed: 2026-03-28T10:35:00Z
  - Result: Client A details retrieved

- [x] Step 2: Calculate invoice amount
  - Completed: 2026-03-28T10:36:00Z
  - Result: $1,500 confirmed

- [ ] Step 3: Generate invoice PDF
- [ ] Step 4: Draft email response
- [ ] Step 5: Send email (REQUIRES APPROVAL)
```

### After All Steps Complete

```markdown
---
task_id: EMAIL_abc123.md
status: completed
completed_at: 2026-03-28T10:45:00Z
---

## Steps

- [x] Step 1: Identify client details
  - Completed: 2026-03-28T10:35:00Z

- [x] Step 2: Calculate invoice amount
  - Completed: 2026-03-28T10:36:00Z

- [x] Step 3: Generate invoice PDF
  - Completed: 2026-03-28T10:38:00Z

- [x] Step 4: Draft email response
  - Completed: 2026-03-28T10:40:00Z

- [x] Step 5: Send email (REQUIRES APPROVAL)
  - Completed: 2026-03-28T10:45:00Z
  - Approved by: human

## Completion Summary
- Started: 2026-03-28T10:35:00Z
- Completed: 2026-03-28T10:45:00Z
- Duration: 10 minutes
- Steps executed: 5
- Approvals required: 1
- Status: Success
```

## Retry Logic

For transient failures:

```python
max_retries = 3
retry_delays = [5, 15, 30]  # seconds

for attempt in range(max_retries):
    try:
        execute_step()
        break
    except TransientError:
        if attempt < max_retries - 1:
            wait(retry_delays[attempt])
            log(f"Retry {attempt + 1}/{max_retries}")
        else:
            mark_as_failed()
```

## Success Criteria

- All plan steps executed successfully
- Checkboxes updated in real-time
- Plan moved to Done/
- Original task moved to Done/
- Dashboard updated
- All actions logged

## Example Usage

```bash
# Execute specific plan
claude code /execute-plan vault/Plans/PLAN_invoice_client_a.md

# Execute all pending plans
claude code /execute-plan
```

## Notes

- Execute steps sequentially, not in parallel
- Always update checkboxes after each step
- Save plan file after each step completion
- Never skip approval steps
- Provide detailed error messages for debugging
- Keep execution logs for audit trail
- Handle long-running steps with progress updates
