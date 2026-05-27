# ⚡ Quick Start - AI Employee

## 🚀 Start System (2 Terminals)

### Terminal 1: Orchestrator
```bash
cd D:\My-Project && source venv/bin/activate && cd AI_Employee && python orchestrator.py
```

### Terminal 2: Scheduler
```bash
cd D:\My-Project && source venv/bin/activate && cd AI_Employee && python scheduler.py
```

---

## 📋 Daily Workflow

1. **Morning:** Check `vault/Briefings/` for daily briefing
2. **Throughout Day:** Review `vault/Pending_Approval/` and approve/reject
3. **Evening:** Check `vault/Dashboard.md` for status

---

## ✅ Approve Actions

```bash
mv vault/Pending_Approval/FILE.md vault/Approved/
```

## ❌ Reject Actions

```bash
mv vault/Pending_Approval/FILE.md vault/Rejected/
```

---

## 📊 Check Status

```bash
# Dashboard
cat vault/Dashboard.md

# Logs
tail -f watcher.log

# Today's actions
cat vault/Logs/$(date +%Y-%m-%d).log
```

---

## 🛑 Stop System

Both terminals: `Ctrl+C`

---

## 📁 Key Folders

- `Needs_Action/` - Tasks detected by system
- `Pending_Approval/` - Awaiting your approval
- `Approved/` - Will auto-execute
- `Done/` - Completed tasks

---

**Full Guide:** `HOW_TO_USE.md`
