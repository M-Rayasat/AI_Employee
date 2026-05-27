# 🎯 AI Employee - Complete Usage Guide

## System Kaise Chalaye (Step-by-Step)

---

## 🚀 STEP 1: System Start Karo

### Terminal 1: Orchestrator
```bash
cd D:\My-Project
source venv/bin/activate
cd AI_Employee
python orchestrator.py
```

**Ye terminal open rakhna hai!** Ye 3 watchers chalayega:
- Gmail Watcher (har 2 minute)
- Approval Watcher (continuous)
- Filesystem Watcher (continuous)

### Terminal 2: Scheduler
```bash
cd D:\My-Project
source venv/bin/activate
cd AI_Employee
python scheduler.py
```

**Ye terminal bhi open rakhna hai!** Ye scheduled tasks chalayega:
- Daily briefing: 8:00 AM
- Weekly audit: Sunday 8:00 PM
- Dashboard update: Har ghante
- LinkedIn content: Mon/Wed/Fri 9:00 AM

---

## 📧 Email Processing (Automatic)

### Kaise Kaam Karta Hai:

1. **Email Bhejo**
   - Apne Gmail pe email bhejo
   - Email ko "important" mark karo (star lagao)

2. **System Detect Karega** (2 minutes mein)
   - Gmail watcher email detect karega
   - Task file banayega: `vault/Needs_Action/EMAIL_*.md`

3. **System Process Karega**
   - Email analyze karega
   - Draft reply banayega
   - Approval request create karega: `vault/Pending_Approval/EMAIL_REPLY_*.md`

4. **Aap Approve Karo**
   - File kholo: `vault/Pending_Approval/EMAIL_REPLY_*.md`
   - Content review karo
   - **Approve:** File ko `vault/Approved/` mein move karo
   - **Reject:** File ko `vault/Rejected/` mein move karo

5. **System Send Karega** (Automatic)
   - Approval watcher detect karega
   - Email send karega via Gmail API
   - Log entry create karega
   - File `vault/Done/` mein move karega

---

## 📱 LinkedIn Posting (Semi-Automatic)

### Kaise Kaam Karta Hai:

1. **Content Generate Hoga** (Mon/Wed/Fri 9 AM)
   - Scheduler automatically trigger karega
   - System post draft banayega
   - File create hogi: `vault/Pending_Approval/LINKEDIN_POST_*.md`

2. **Aap Review Karo**
   - File kholo aur post content padho
   - Edit kar sakte ho agar chahiye
   - **Approve:** File ko `vault/Approved/` mein move karo
   - **Reject:** File ko `vault/Rejected/` mein move karo

3. **System Post Karega** (Automatic)
   - Approval watcher detect karega
   - Browser automation se LinkedIn pe post karega
   - Log entry create karega
   - File `vault/Done/` mein move karega

### Manual Trigger (Kabhi Bhi)
```bash
# Terminal 3 mein
cd D:\My-Project
source venv/bin/activate
cd AI_Employee

# Manually content generate karne ke liye
# (File already created hai - check Pending_Approval/)
```

---

## 📊 Dashboard & Reports (Automatic)

### Dashboard Update (Har Ghante)
- Automatically update hota hai
- Check karo: `cat vault/Dashboard.md`
- Dikhata hai:
  - System status
  - Pending approvals
  - Recent activity
  - Watcher health

### Daily Briefing (8:00 AM)
- Automatically generate hoti hai
- Location: `vault/Briefings/YYYY-MM-DD_Briefing.md`
- Contains:
  - Yesterday's completed tasks
  - Pending items
  - System metrics
  - Action items

### Weekly Audit (Sunday 8:00 PM)
- Automatically generate hoti hai
- Location: `vault/Briefings/YYYY-MM-DD_Weekly_Audit.md`
- Contains:
  - Week ka summary
  - Completed projects
  - Bottlenecks
  - Recommendations

---

## 📁 Folder Structure Samajhna

```
vault/
├── Inbox/              # Yahan manually tasks rakho
├── Needs_Action/       # System ne detect kiye tasks (emails)
├── Pending_Approval/   # Approval chahiye (posts, replies)
├── Approved/           # Approved actions (auto-execute)
├── Rejected/           # Rejected actions (archive)
├── Done/               # Completed tasks (archive)
├── Plans/              # Multi-step execution plans
├── Logs/               # Daily audit logs (YYYY-MM-DD.log)
├── Briefings/          # Daily/weekly briefings
└── Dashboard.md        # Live system status
```

### Workflow:
```
Needs_Action → Pending_Approval → Approved → Done
                                ↓
                            Rejected
```

---

## 🔄 Daily Routine

### Morning (8:00 AM)
1. Daily briefing check karo: `vault/Briefings/`
2. Pending approvals review karo: `vault/Pending_Approval/`
3. Approve/reject karo

### Throughout Day
1. Important emails automatically detect honge
2. Approval requests aayenge
3. Review aur approve karte raho

### Mon/Wed/Fri (9:00 AM)
1. LinkedIn post draft ready hoga
2. Review karo
3. Approve karo
4. System automatically post karega

### Evening
1. Dashboard check karo: `vault/Dashboard.md`
2. Logs review karo: `vault/Logs/YYYY-MM-DD.log`
3. Done folder check karo

### Sunday (8:00 PM)
1. Weekly audit ready hogi
2. Week ka summary review karo
3. Next week plan karo

---

## 🛠️ Manual Operations

### Check System Status
```bash
# Dashboard dekho
cat vault/Dashboard.md

# Logs dekho
tail -f watcher.log
tail -f scheduler.log

# Today's actions
cat vault/Logs/2026-03-28.log
```

### Check Pending Work
```bash
# Pending approvals
ls vault/Pending_Approval/

# Needs action
ls vault/Needs_Action/

# Recent completions
ls -lt vault/Done/ | head -10
```

### Manual Task Add Karo
```bash
# Inbox mein file create karo
echo "Task description" > vault/Inbox/my_task.md

# System automatically process karega
```

---

## 🚨 Troubleshooting

### Agar Orchestrator Crash Ho
```bash
# Restart karo
cd D:\My-Project
source venv/bin/activate
cd AI_Employee
python orchestrator.py
```

### Agar Gmail Watcher Kaam Na Kare
```bash
# Token check karo
ls .credentials/gmail_token.json

# Re-authenticate karo
python watchers/gmail_watcher.py
```

### Agar Scheduler Miss Ho
```bash
# Restart karo
python scheduler.py

# Logs check karo
tail -f scheduler.log
```

### Agar Approval Execute Na Ho
```bash
# Approval watcher check karo
ps aux | grep approval_watcher

# Manually trigger karo
# File ko Approved/ mein move karo
# Watcher automatically detect karega
```

---

## 🛑 System Stop Karna

### Graceful Shutdown
Dono terminals mein:
```bash
Ctrl+C
```

System gracefully shutdown hoga:
- Sab watchers band honge
- Scheduler stop hoga
- Logs save honge

---

## ✅ Health Check Commands

### System Running Hai Ya Nahi
```bash
# Orchestrator
ps aux | grep orchestrator

# Watchers
ps aux | grep watcher

# Scheduler
ps aux | grep scheduler
```

### Recent Activity
```bash
# Last 20 log entries
tail -20 watcher.log

# Today's actions
cat vault/Logs/$(date +%Y-%m-%d).log

# Dashboard status
cat vault/Dashboard.md
```

---

## 🎯 Quick Reference

### Approve Kaise Kare
```bash
# File move karo
mv vault/Pending_Approval/FILE.md vault/Approved/
```

### Reject Kaise Kare
```bash
# File move karo
mv vault/Pending_Approval/FILE.md vault/Rejected/
```

### Manual Task Add Kare
```bash
# Inbox mein file banao
echo "Task details" > vault/Inbox/task_name.md
```

### Logs Check Kare
```bash
# Watcher logs
tail -f watcher.log

# Scheduler logs
tail -f scheduler.log

# Today's audit log
cat vault/Logs/$(date +%Y-%m-%d).log
```

---

## 🎉 System Features

### Automatic (No Action Needed)
- ✅ Gmail monitoring (every 2 minutes)
- ✅ Dashboard updates (hourly)
- ✅ Daily briefings (8 AM)
- ✅ Weekly audits (Sunday 8 PM)
- ✅ LinkedIn content generation (Mon/Wed/Fri 9 AM)

### Semi-Automatic (Approval Needed)
- ⚠️ Email replies
- ⚠️ LinkedIn posts
- ⚠️ External API calls

### Manual
- 📝 Task creation in Inbox/
- 👀 Approval/rejection
- 📊 Report review

---

## 📚 More Help

- **Complete docs:** `README.md`
- **Setup guide:** `SYSTEM_READY.md`
- **Gmail setup:** `GMAIL_SETUP_URDU.md`
- **Start commands:** `START_COMMANDS.md`

---

**System 100% ready hai - bas start karo aur kaam karne do!** 🚀
