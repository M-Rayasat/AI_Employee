# 🚀 Quick Start Guide - Silver Tier AI Employee

**Last Updated:** 2026-03-28

---

## ⚡ Fast Track Setup (30 minutes)

### Step 1: Install Dependencies (10 min)

```bash
# Navigate to project
cd D:\My-Project

# Activate virtual environment
source venv/bin/activate  # Windows: venv\Scripts\activate

# Navigate to AI_Employee
cd AI_Employee

# Install Python dependencies
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib apscheduler requests python-dotenv

# Install Node.js dependencies for Email MCP
cd mcp_servers/email-mcp
npm install
cd ../..
```

### Step 2: Setup Gmail API (15 min)

Follow the detailed guide in `GMAIL_SETUP.md`:

1. Go to https://console.cloud.google.com
2. Create project "AI-Employee"
3. Enable Gmail API
4. Create OAuth credentials (Desktop app)
5. Download credentials → save as `.credentials/gmail_credentials.json`
6. Run first authentication:
   ```bash
   python watchers/gmail_watcher.py
   ```
7. Browser opens → Sign in → Allow permissions
8. Token saved to `.credentials/gmail_token.json`

### Step 3: Configure Business Goals (5 min)

Edit `vault/Business_Goals.md`:
- Set your revenue targets
- Define LinkedIn posting strategy
- List active projects

### Step 4: Start the System

**Terminal 1 - Orchestrator:**
```bash
cd D:\My-Project\AI_Employee
python orchestrator.py
```

**Terminal 2 - Scheduler:**
```bash
cd D:\My-Project\AI_Employee
python scheduler.py
```

---

## 🧪 Quick Tests

### Test 1: Email Detection
1. Send test email to your Gmail
2. Wait 2 minutes (watcher checks every 2 min)
3. Check `vault/Needs_Action/` for EMAIL_*.md file
4. Success! ✅

### Test 2: LinkedIn Content Generation
```bash
claude code /generate-linkedin-content
```
Check `vault/Pending_Approval/` for post draft.

### Test 3: Dashboard Update
```bash
claude code /update-dashboard
```
Open `vault/Dashboard.md` to see metrics.

### Test 4: Business Audit
```bash
claude code /business-audit --daily
```
Check `vault/Briefings/` for generated briefing.

---

## 📋 Available Commands

### Skills (use with `claude code /skill-name`)
- `/process-task` - Process tasks from Needs_Action
- `/update-dashboard` - Update dashboard metrics
- `/process-email` - Process incoming emails
- `/generate-linkedin-content` - Generate LinkedIn posts
- `/linkedin-post` - Post to LinkedIn (requires approval)
- `/handle-approval` - Execute approved actions
- `/execute-plan` - Execute multi-step plans
- `/business-audit` - Generate business briefings

### Orchestrator Commands
```bash
python orchestrator.py          # Start all watchers
python orchestrator.py --status # Check watcher status
```

### Scheduler Commands
```bash
python scheduler.py  # Start scheduled tasks
```

---

## 🔍 Monitoring

### Check Logs
```bash
# Watcher logs
tail -f watcher.log

# Scheduler logs
tail -f scheduler.log

# Today's action log
cat vault/Logs/$(date +%Y-%m-%d).log
```

### Check Dashboard
Open `vault/Dashboard.md` in any text editor or Obsidian.

### Check System Health
```bash
python orchestrator.py --status
```

---

## 🎯 Typical Workflows

### Email Response Workflow
1. Gmail watcher detects email → Creates task in Needs_Action/
2. Run `/process-email` → Analyzes and drafts response
3. Approval request created in Pending_Approval/
4. Review draft → Move to Approved/
5. Approval watcher executes → Email sent
6. Logged and moved to Done/

### LinkedIn Posting Workflow
1. Run `/generate-linkedin-content` (or scheduled Mon/Wed/Fri 9am)
2. Post draft created in Pending_Approval/
3. Review post → Move to Approved/
4. Approval watcher executes → Post published
5. Logged and moved to Done/

### Complex Task Workflow
1. Task arrives in Needs_Action/
2. Run `/process-task` → Creates Plan.md
3. Run `/execute-plan` → Executes steps sequentially
4. Approvals created for sensitive steps
5. Plan completed → Moved to Done/

---

## ⚠️ Troubleshooting

### Gmail Authentication Failed
```bash
# Delete token and re-authenticate
rm .credentials/gmail_token.json
python watchers/gmail_watcher.py
```

### Watchers Not Running
```bash
# Check if processes are running
ps aux | grep watcher

# Restart orchestrator
python orchestrator.py
```

### Dependencies Missing
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### MCP Server Not Working
```bash
# Test MCP server
cd mcp_servers/email-mcp
npm start
```

---

## 📚 Documentation

- `README.md` - Complete Silver tier documentation
- `GMAIL_SETUP.md` - Gmail API setup guide
- `IMPLEMENTATION_COMPLETE.md` - Implementation summary
- `TEST_RESULTS.md` - Testing results
- `vault/Company_Handbook.md` - System rules and guidelines
- `vault/Business_Goals.md` - Business strategy

---

## 🎉 You're Ready!

Your Silver Tier AI Employee is now operational. The system will:
- ✅ Monitor Gmail 24/7
- ✅ Process emails with approval workflow
- ✅ Generate LinkedIn content 3x/week
- ✅ Create execution plans for complex tasks
- ✅ Generate weekly business briefings
- ✅ Update dashboard hourly
- ✅ Log all actions for audit

**Happy automating!** 🚀

---

*For issues or questions, check the documentation or logs.*
