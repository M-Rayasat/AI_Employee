# Twitter & WhatsApp Setup Guide

**Date:** 2026-03-30
**Purpose:** Complete setup for Twitter and WhatsApp integration

---

## 🐦 Twitter/X API Setup

### Step 1: Create Twitter Developer Account

1. **Go to:** https://developer.twitter.com/en/portal/dashboard
2. **Sign in** with your Twitter account
3. **Apply for Developer Access:**
   - Click "Sign up for Free Account"
   - Fill in the application form
   - Purpose: "Building an AI automation tool"
   - Wait for approval (usually instant for basic access)

### Step 2: Create a Twitter App

1. **Go to:** https://developer.twitter.com/en/portal/projects-and-apps
2. **Click:** "Create App" or "Create Project"
3. **Fill in details:**
   - App name: "AI Employee Bot" (or any name)
   - Description: "Automated business assistant"
   - Website: Your website or GitHub repo
4. **Click:** "Create"

### Step 3: Get API Keys

After creating the app, you'll see:

1. **API Key** (also called Consumer Key)
2. **API Secret Key** (also called Consumer Secret)
3. **Save these immediately!** (You won't see them again)

### Step 4: Generate Access Token

1. **In your app settings**, go to "Keys and tokens"
2. **Click:** "Generate" under "Access Token and Secret"
3. **You'll get:**
   - Access Token
   - Access Token Secret
4. **Save these too!**

### Step 5: Get Bearer Token

1. **In the same "Keys and tokens" page**
2. **Look for:** "Bearer Token"
3. **Click:** "Generate" if not already generated
4. **Copy and save it**

### Step 6: Set Permissions

1. **Go to:** App Settings → User authentication settings
2. **Set permissions to:** "Read and Write"
3. **Save changes**

### Step 7: Add to .env File

Open `d:/My-Project/AI_Employee/.env` and add:

```bash
# Twitter/X API
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
TWITTER_BEARER_TOKEN=your_bearer_token_here
```

**Example:**
```bash
TWITTER_API_KEY=AbCdEfGhIjKlMnOpQrStUvWxYz
TWITTER_API_SECRET=1234567890abcdefghijklmnopqrstuvwxyz
TWITTER_ACCESS_TOKEN=1234567890-AbCdEfGhIjKlMnOpQrStUvWxYz
TWITTER_ACCESS_TOKEN_SECRET=abcdefghijklmnopqrstuvwxyz1234567890
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAA...very_long_token
```

### Step 8: Test Twitter Integration

```bash
cd d:/My-Project
source venv/bin/activate
cd AI_Employee
python watchers/twitter_watcher.py
```

**Expected output:**
- "Starting Twitter Watcher..."
- "Twitter API authenticated successfully"
- "Monitoring Twitter every 300 seconds"

**If you see errors:**
- Check API keys are correct
- Check permissions are "Read and Write"
- Check app is not suspended

---

## 💬 WhatsApp Setup

### Step 1: Verify Playwright Installation

```bash
playwright --version
```

**Should show:** Version 1.40.0 or higher

**If not installed:**
```bash
npm install -g playwright
playwright install chromium
```

### Step 2: Verify WhatsApp MCP Server

```bash
cd d:/My-Project/AI_Employee/mcp_servers/whatsapp-mcp
ls -la
```

**Should see:**
- index.js
- package.json
- node_modules/

### Step 3: Check .env Configuration

Open `.env` file and verify:

```bash
# WhatsApp
WHATSAPP_SESSION_PATH=.credentials/whatsapp_session
```

**This is already set!** No changes needed.

### Step 4: Create Session Directory

```bash
cd d:/My-Project/AI_Employee
mkdir -p .credentials/whatsapp_session
```

### Step 5: First Run - QR Code Authentication

**Important:** WhatsApp Web requires QR code scan on first run.

```bash
cd d:/My-Project
source venv/bin/activate
cd AI_Employee
python watchers/whatsapp_watcher.py
```

**What will happen:**
1. Browser window will open (Chromium)
2. WhatsApp Web will load
3. **QR code will appear**
4. **Scan the QR code** with your phone:
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices
   - Tap "Link a Device"
   - Scan the QR code on screen

5. **After scanning:**
   - WhatsApp Web will load your chats
   - Session will be saved in `.credentials/whatsapp_session/`
   - Watcher will start monitoring

6. **Keep the browser window open** (it can be minimized)

### Step 6: Verify WhatsApp is Working

**After QR scan, you should see:**
```
Starting WhatsApp Watcher...
Session path: .credentials/whatsapp_session
Monitoring keywords: urgent, asap, invoice, payment, help, important
Check interval: 30 seconds
Waiting for WhatsApp Web to load...
WhatsApp Web loaded successfully
```

### Step 7: Test WhatsApp Detection

**Send yourself a test message:**
1. From another phone or WhatsApp Web
2. Send a message with keyword: "urgent test"
3. Watcher should detect it
4. Task file will be created in `vault/Needs_Action/`

**Check logs:**
```bash
tail -f watcher.log
```

**Should see:**
```
Keyword found in message from [Contact Name]
Created task file: WHATSAPP_[Contact]_[timestamp].md
```

---

## 🔧 Troubleshooting

### Twitter Issues

**Error: "401 Unauthorized"**
- API keys are wrong
- Check you copied them correctly
- Regenerate keys if needed

**Error: "403 Forbidden"**
- App permissions are wrong
- Set to "Read and Write"
- Wait a few minutes after changing

**Error: "429 Too Many Requests"**
- Rate limit exceeded
- Wait 15 minutes
- Reduce check frequency

### WhatsApp Issues

**Error: "playwright: command not found"**
```bash
npm install -g playwright
playwright install chromium
```

**Error: "Browser not found"**
```bash
playwright install chromium
```

**QR Code doesn't appear:**
- Check internet connection
- Try closing and reopening
- Clear browser cache

**Session expires:**
- Scan QR code again
- Session saved in `.credentials/whatsapp_session/`
- Should persist across restarts

**Watcher crashes:**
- Check logs: `tail -f watcher.log`
- Verify Playwright is installed
- Check browser is not closed manually

---

## ✅ Verification Checklist

### Twitter Setup Complete When:
- [ ] Developer account created
- [ ] App created
- [ ] API keys obtained (5 keys total)
- [ ] Keys added to .env file
- [ ] Permissions set to "Read and Write"
- [ ] Test run successful: `python watchers/twitter_watcher.py`
- [ ] No authentication errors

### WhatsApp Setup Complete When:
- [ ] Playwright installed globally
- [ ] Chromium browser installed
- [ ] Session directory created
- [ ] QR code scanned successfully
- [ ] WhatsApp Web loaded
- [ ] Test message detected
- [ ] Task file created in vault/Needs_Action/

---

## 🚀 Running Both Together

### Start Orchestrator with Both

```bash
cd d:/My-Project
source venv/bin/activate
cd AI_Employee
python orchestrator.py
```

**This will start:**
- ✅ Gmail watcher (already working)
- ✅ Twitter watcher (if API keys added)
- ✅ WhatsApp watcher (if Playwright installed)
- ✅ Facebook watcher (if API keys added)
- ✅ Filesystem watcher
- ✅ Approval watcher

**Check logs:**
```bash
tail -f watcher.log
```

---

## 📝 Quick Reference

### Twitter API Keys Location:
https://developer.twitter.com/en/portal/projects-and-apps

### WhatsApp Session Location:
`.credentials/whatsapp_session/`

### Test Commands:

**Twitter:**
```bash
python watchers/twitter_watcher.py
```

**WhatsApp:**
```bash
python watchers/whatsapp_watcher.py
```

**Both (via Orchestrator):**
```bash
python orchestrator.py
```

---

## 🎯 Next Steps

1. **Get Twitter API keys** (15-30 minutes)
2. **Add keys to .env**
3. **Test Twitter watcher**
4. **Run WhatsApp watcher** (scan QR code)
5. **Test WhatsApp detection**
6. **Start orchestrator** (run both together)
7. **Ready for demo!** 🎉

---

## 💡 Pro Tips

### Twitter:
- Use a test account first
- Don't exceed rate limits (15 requests per 15 min)
- Monitor mentions every 5 minutes (default)
- Save API keys securely

### WhatsApp:
- Keep browser window open (can minimize)
- Session persists across restarts
- Scan QR code only once
- Use keywords to filter messages
- Default keywords: urgent, asap, invoice, payment, help, important

### Both:
- Run orchestrator to manage both
- Check logs regularly
- Test with real messages
- Monitor vault/Needs_Action/ for tasks

---

**Setup Time:**
- Twitter: 15-30 minutes (waiting for approval)
- WhatsApp: 5 minutes (QR scan)
- Total: ~30-40 minutes

**After setup, both will run 24/7 with orchestrator!** 🚀
