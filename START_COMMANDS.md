# 🚀 System Start Commands

## Aapka Silver Tier AI Employee 100% Ready Hai!

### Start Karne Ke Liye 2 Terminals Chahiye

---

## Terminal 1: Orchestrator (All Watchers)

```bash
cd D:\My-Project
source venv/bin/activate
cd AI_Employee
python orchestrator.py
```

**Ye chalega:**
- Gmail Watcher - Har 2 minute mein emails check karega
- Approval Watcher - Approved actions execute karega
- Filesystem Watcher - drop/ folder monitor karega

**Ye terminal open rakhna hai - band mat karna!**

**Status Check:**
```bash
# Logs dekhne ke liye
tail -f watcher.log
```

---

## Terminal 2: Scheduler (Scheduled Tasks)

```bash
cd D:\My-Project
source venv/bin/activate
cd AI_Employee
python scheduler.py
```

**Ye schedule karega:**
- Daily briefing: 8:00 AM
- Weekly audit: Sunday 8:00 PM
- Dashboard update: Har ghante
- LinkedIn content: Mon/Wed/Fri 9:00 AM

**Ye terminal bhi open rakhna hai!**

**Status Check:**
```bash
# Scheduler logs dekhne ke liye
tail -f scheduler.log
```

---

## Test Karo (Terminal 3)

### Test 1: Dashboard Update
```bash
cd D:\My-Project
source venv/bin/activate
cd AI_Employee
claude code /update-dashboard
```

### Test 2: LinkedIn Content
```bash
claude code /generate-linkedin-content
```

### Test 3: Business Audit
```bash
claude code /business-audit --daily
```

---

## System Monitor Karo

### Check Logs
```bash
# Watcher logs
tail -f watcher.log

# Scheduler logs
tail -f scheduler.log

# Today's actions
cat vault/Logs/2026-03-28.log
```

### Check Dashboard
```bash
cat vault/Dashboard.md
```

---

## Email Test

1. Apne Gmail pe test email bhejo
2. Email ko "important" mark karo (star lagao)
3. 2 minutes wait karo
4. Check karo: `vault/Needs_Action/` mein EMAIL_*.md file

---

## 🎉 Congratulations!

Aapka Silver Tier AI Employee ab fully operational hai!

**All 7 Silver Tier Requirements Met** ✅
**Ready for Hackathon Submission** 🏆

---

**Ab orchestrator aur scheduler start karo!**
