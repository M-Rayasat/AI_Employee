# AI Employee - Error Recovery & Monitoring

This document describes the error handling, recovery strategies, and monitoring systems for the Gold Tier AI Employee.

---

## Error Categories

### 1. Transient Errors
**Description:** Temporary failures that resolve themselves or can be retried.

**Examples:**
- Network timeouts
- API rate limits
- Temporary service unavailability
- Connection drops

**Recovery Strategy:**
- Exponential backoff retry (3 attempts)
- Base delay: 1 second
- Max delay: 60 seconds
- Log each retry attempt

**Implementation:**
```python
import time
from functools import wraps

def with_retry(max_attempts=3, base_delay=1, max_delay=60):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except (ConnectionError, TimeoutError) as e:
                    if attempt == max_attempts - 1:
                        raise
                    delay = min(base_delay * (2 ** attempt), max_delay)
                    logger.warning(f'Attempt {attempt+1} failed: {e}, retrying in {delay}s')
                    time.sleep(delay)
        return wrapper
    return decorator
```

---

### 2. Authentication Errors
**Description:** Expired tokens, revoked access, invalid credentials.

**Examples:**
- OAuth token expired
- API key revoked
- Session timeout
- Invalid credentials

**Recovery Strategy:**
- Alert human immediately
- Pause operations for that service
- Create alert file in vault/Alerts/
- Do NOT retry automatically

**Implementation:**
```python
def handle_auth_error(service_name, error):
    logger.error(f'Authentication failed for {service_name}: {error}')

    # Create alert file
    alert_file = vault_path / 'Alerts' / f'AUTH_ERROR_{service_name}_{timestamp}.md'
    alert_file.write_text(f'''---
type: authentication_error
service: {service_name}
severity: critical
created: {datetime.now().isoformat()}
---

## Authentication Error

**Service:** {service_name}
**Error:** {error}

## Action Required

1. Check credentials in .env file
2. Refresh OAuth tokens if applicable
3. Verify API access is not revoked
4. Restart service after fixing

## Impact

{service_name} operations are paused until resolved.
''')

    # Pause service
    pause_service(service_name)
```

---

### 3. Logic Errors
**Description:** AI misinterprets data or makes incorrect decisions.

**Examples:**
- Wrong email recipient
- Incorrect invoice amount
- Misclassified message intent
- Wrong social media account

**Recovery Strategy:**
- Human review queue
- Never auto-approve after logic error
- Flag for manual review
- Learn from corrections

**Implementation:**
```python
def handle_logic_error(task, error_description):
    logger.warning(f'Logic error in task {task.id}: {error_description}')

    # Move to review queue
    review_file = vault_path / 'Pending_Approval' / f'REVIEW_{task.id}.md'
    review_file.write_text(f'''---
type: logic_error_review
task_id: {task.id}
error: {error_description}
requires_human_review: true
---

## Logic Error Detected

**Task:** {task.name}
**Error:** {error_description}

## AI's Proposed Action

{task.proposed_action}

## Please Review

- [ ] Approve (move to Approved/)
- [ ] Reject (move to Rejected/)
- [ ] Modify and approve

## Notes

Add any corrections or feedback here.
''')
```

---

### 4. Data Errors
**Description:** Corrupted files, missing fields, invalid formats.

**Examples:**
- Corrupted task file
- Missing required field
- Invalid date format
- Malformed JSON

**Recovery Strategy:**
- Quarantine corrupted file
- Alert human
- Skip processing
- Log error details

**Implementation:**
```python
def handle_data_error(file_path, error):
    logger.error(f'Data error in {file_path}: {error}')

    # Quarantine file
    quarantine_dir = vault_path / 'Quarantine'
    quarantine_dir.mkdir(exist_ok=True)

    quarantine_file = quarantine_dir / f'{file_path.stem}_CORRUPTED_{timestamp}.md'
    shutil.move(file_path, quarantine_file)

    # Create alert
    alert_file = vault_path / 'Alerts' / f'DATA_ERROR_{timestamp}.md'
    alert_file.write_text(f'''---
type: data_error
file: {file_path.name}
severity: medium
---

## Data Error

**File:** {file_path.name}
**Error:** {error}
**Quarantined to:** {quarantine_file}

## Action Required

1. Review quarantined file
2. Fix data format
3. Move back to Needs_Action/ if recoverable
4. Delete if unrecoverable
''')
```

---

### 5. System Errors
**Description:** Infrastructure failures, disk full, process crashes.

**Examples:**
- Orchestrator crash
- Disk space full
- Out of memory
- Process killed

**Recovery Strategy:**
- Watchdog auto-restart
- Alert human if repeated failures
- Log crash details
- Graceful degradation

**Implementation:**
```python
# watchdog.py
import subprocess
import time
import logging

class Watchdog:
    def __init__(self):
        self.processes = {}
        self.max_restarts = 5
        self.restart_window = 300  # 5 minutes

    def monitor(self, name, command):
        restarts = []

        while True:
            try:
                process = subprocess.Popen(command)
                self.processes[name] = process

                # Wait for process to exit
                process.wait()

                # Check restart frequency
                now = time.time()
                restarts = [t for t in restarts if now - t < self.restart_window]
                restarts.append(now)

                if len(restarts) >= self.max_restarts:
                    logger.error(f'{name} crashed {self.max_restarts} times in {self.restart_window}s, giving up')
                    self.alert_human(name, 'Too many crashes')
                    break

                logger.warning(f'{name} crashed, restarting...')
                time.sleep(5)

            except Exception as e:
                logger.error(f'Watchdog error for {name}: {e}')
                time.sleep(60)
```

---

## Graceful Degradation

When components fail, the system degrades gracefully rather than stopping completely.

### Gmail API Down
**Behavior:**
- Queue outgoing emails locally
- Continue monitoring other services
- Process queued emails when restored

**Implementation:**
```python
def send_email_with_fallback(to, subject, body):
    try:
        gmail_mcp.send_email(to, subject, body)
    except GmailAPIError:
        # Queue locally
        queue_file = vault_path / 'Queue' / f'EMAIL_{timestamp}.md'
        queue_file.write_text(f'''---
to: {to}
subject: {subject}
queued: {datetime.now().isoformat()}
---

{body}
''')
        logger.warning('Gmail API down, email queued for later')
```

### Odoo Unavailable
**Behavior:**
- Continue other operations
- Queue accounting actions
- Alert user about accounting delay

### WhatsApp Session Expired
**Behavior:**
- Alert user to re-authenticate
- Continue other operations
- Queue WhatsApp messages

### Claude Code Unavailable
**Behavior:**
- Watchers continue collecting tasks
- Queue grows for later processing
- Alert user if queue exceeds threshold

---

## Health Monitoring

### System Health Checks

**Monitored Metrics:**
- Watcher process status (running/stopped)
- MCP server responsiveness
- Disk space usage
- Memory usage
- API rate limits
- Error rate
- Queue sizes

**Check Frequency:** Every 60 seconds

**Implementation:**
```python
class HealthMonitor:
    def __init__(self):
        self.thresholds = {
            'disk_space': 90,  # percent
            'memory': 85,      # percent
            'error_rate': 5,   # percent
            'queue_size': 100  # items
        }

    def check_health(self):
        issues = []

        # Check disk space
        disk_usage = psutil.disk_usage('/').percent
        if disk_usage > self.thresholds['disk_space']:
            issues.append(f'Disk space critical: {disk_usage}%')

        # Check memory
        memory_usage = psutil.virtual_memory().percent
        if memory_usage > self.thresholds['memory']:
            issues.append(f'Memory usage high: {memory_usage}%')

        # Check error rate
        error_rate = self.calculate_error_rate()
        if error_rate > self.thresholds['error_rate']:
            issues.append(f'Error rate high: {error_rate}%')

        # Check queue sizes
        queue_size = len(list((vault_path / 'Needs_Action').glob('*.md')))
        if queue_size > self.thresholds['queue_size']:
            issues.append(f'Queue backlog: {queue_size} items')

        if issues:
            self.create_health_alert(issues)

        return len(issues) == 0
```

### Watcher Health

**Checks:**
- Process is running
- Last activity timestamp
- Error count
- Restart count

**Auto-restart:** If watcher crashes, orchestrator restarts it automatically (max 5 times).

### MCP Server Health

**Checks:**
- Server process running
- Response time < 5 seconds
- No authentication errors
- API rate limits not exceeded

**Ping Test:**
```python
async def ping_mcp_server(server_name):
    try:
        start = time.time()
        response = await mcp_client.ping(server_name)
        latency = time.time() - start

        if latency > 5:
            logger.warning(f'{server_name} slow response: {latency}s')

        return True
    except Exception as e:
        logger.error(f'{server_name} health check failed: {e}')
        return False
```

---

## Alert System

### Alert Types

**Critical (Immediate Action Required):**
- Authentication failures
- Payment errors
- System crashes (>3 in 5 minutes)
- Disk space critical (>95%)

**Warning (Review Soon):**
- High error rate (>5%)
- Queue backlog (>100 items)
- Slow response times
- Memory usage high (>85%)

**Info (Informational):**
- Service temporarily unavailable
- Retry successful after failure
- Configuration changes

### Alert Delivery

**Methods:**
1. Alert file in vault/Alerts/
2. Dashboard.md update (red flag)
3. Log entry with ERROR level
4. (Future) Email/SMS notification

**Alert File Format:**
```markdown
---
type: {critical|warning|info}
category: {auth|system|data|logic}
service: {service_name}
created: {timestamp}
resolved: {timestamp|null}
---

## Alert: {Title}

**Severity:** {Critical|Warning|Info}
**Service:** {service_name}
**Time:** {timestamp}

## Description

{What happened}

## Impact

{What is affected}

## Action Required

{What to do}

## Resolution

{How it was resolved - filled when resolved}
```

---

## Logging

### Log Levels

- **DEBUG:** Detailed diagnostic information
- **INFO:** General informational messages
- **WARNING:** Warning messages (non-critical issues)
- **ERROR:** Error messages (failures)
- **CRITICAL:** Critical errors (system failures)

### Log Format

```
{timestamp} - {component} - {level} - {message}
```

**Example:**
```
2026-03-30 10:30:45,123 - GmailWatcher - INFO - Found 3 new emails
2026-03-30 10:30:46,456 - GmailWatcher - ERROR - Failed to fetch email: Connection timeout
2026-03-30 10:30:51,789 - GmailWatcher - INFO - Retry successful
```

### Log Files

- `watcher.log` - All watcher activity
- `orchestrator.log` - Orchestrator activity
- `mcp_servers.log` - MCP server activity
- `errors.log` - All errors (ERROR and CRITICAL only)

### Log Rotation

- Daily rotation
- Keep last 30 days
- Compress old logs
- Max size: 100MB per file

---

## Recovery Procedures

### Watcher Crash Recovery

1. Orchestrator detects crash
2. Check restart count
3. If < 5 restarts: Auto-restart
4. If >= 5 restarts: Alert human, stop auto-restart
5. Log crash details

### MCP Server Failure Recovery

1. Detect failure via health check
2. Attempt restart
3. If restart fails: Alert human
4. Queue actions for that service
5. Continue other operations

### Database Corruption Recovery

1. Detect corruption
2. Stop all writes
3. Restore from last backup
4. Replay queued actions
5. Resume operations

### Full System Recovery

1. Stop all processes
2. Check system resources
3. Clear temporary files
4. Restart orchestrator
5. Verify all services
6. Resume operations

---

## Monitoring Dashboard

### Real-Time Metrics (Dashboard.md)

```markdown
## System Health

🟢 All Systems Operational

**Watchers:** 6/6 running
**MCP Servers:** 6/6 responsive
**Error Rate:** 0.5% (last hour)
**Queue Size:** 3 items

**Last Updated:** 2026-03-30 10:30:00

---

## Recent Alerts

⚠️ [10:15] WhatsApp session expired - Re-authentication required
✅ [10:20] WhatsApp session restored

---

## Performance

- **Avg Response Time:** 2.3 seconds
- **Tasks Processed Today:** 47
- **Success Rate:** 99.5%
```

---

## Best Practices

### Error Handling
1. Always log errors with context
2. Never silently fail
3. Provide actionable error messages
4. Include recovery suggestions

### Monitoring
1. Check health every 60 seconds
2. Alert on trends, not single events
3. Keep alert fatigue low
4. Prioritize critical alerts

### Recovery
1. Auto-recover when safe
2. Alert human for critical issues
3. Never retry payments automatically
4. Log all recovery attempts

### Testing
1. Test error scenarios regularly
2. Simulate failures
3. Verify alerts work
4. Practice recovery procedures

---

## Conclusion

Robust error recovery and monitoring are essential for autonomous operation. This system provides multiple layers of protection:

1. **Prevention:** Validation and safety checks
2. **Detection:** Health monitoring and alerts
3. **Recovery:** Auto-restart and graceful degradation
4. **Learning:** Logging and analysis

**Result:** 99%+ uptime with minimal human intervention.
