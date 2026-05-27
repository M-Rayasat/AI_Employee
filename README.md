# 🤖 AI Employee — Autonomous Business Automation System

<div align="center">

![AI Employee](assets/1775197147232.jfif)

![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Claude AI](https://img.shields.io/badge/Powered%20by-Claude%20AI-D4A27F?style=for-the-badge&logo=anthropic&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

An intelligent AI-powered employee that autonomously handles business operations including email management, WhatsApp communication, social media, and accounting - all with human-in-the-loop approval workflows.

---

## 🎯 Key Features

### ✅ Email Automation (Gmail)
- **Automatic Email Detection**: Monitors Gmail inbox for important unread emails
- **AI-Powered Reply Drafting**: Generates contextual, professional email responses
- **Approval Workflow**: Creates approval requests for human review before sending
- **Smart Categorization**: Identifies urgent emails and prioritizes them

### ✅ WhatsApp Automation
- **Bidirectional Message Detection**: Monitors both incoming and outgoing messages
- **Intelligent AI Replies**: Context-aware responses based on message content
- **Automatic Reply Sending**: Sends AI-generated replies to incoming messages
- **Multi-language Support**: Handles English and Urdu keywords
- **Conversation Tracking**: Maintains message history and prevents duplicate processing

### ✅ Social Media Integration
- **Twitter/X**: Post scheduling and mention monitoring
- **Facebook**: Page management and content posting
- **Instagram**: Image posting and engagement tracking
- **WhatsApp**: Real-time messaging and automation

### ✅ Accounting Integration (Odoo)
- **Invoice Management**: Create and track customer invoices
- **Payment Recording**: Log payments and update financial records
- **Expense Tracking**: Record business expenses automatically
- **Financial Reports**: Generate balance sheets and P&L statements

### ✅ Human-in-the-Loop Approval System
- **Pending Approval Queue**: All AI-generated actions require human approval
- **Easy Review Process**: Simple file-based approval workflow
- **Edit Before Approval**: Modify AI suggestions before execution
- **Audit Trail**: Complete logging of all actions and approvals

---

## 📁 Folder Structure

```
AI_Employee/
├── .claude/                      # Claude Code configuration
│   ├── skills/                   # Agent skills (22+ skills)
│   │   ├── draft-email/          # Email drafting skill
│   │   ├── whatsapp-reply/       # WhatsApp reply skill
│   │   ├── business-audit/       # Weekly business audit
│   │   └── ...                   # Other skills
│   └── CLAUDE.md                 # Project instructions for Claude
│
├── .credentials/                 # Authentication credentials (gitignored)
│   ├── gmail_credentials.json    # Gmail API credentials
│   ├── gmail_token.json          # Gmail OAuth token
│   └── whatsapp_session/         # WhatsApp Web session data
│
├── mcp_servers/                  # Model Context Protocol servers
│   ├── email-mcp/                # Gmail MCP server
│   ├── whatsapp-mcp/             # WhatsApp MCP server
│   ├── twitter-mcp/              # Twitter API integration
│   ├── facebook-mcp/             # Facebook Graph API
│   ├── instagram-mcp/            # Instagram Business API
│   └── odoo-mcp/                 # Odoo accounting integration
│
├── watchers/                     # Background monitoring services
│   ├── gmail_watcher.py          # Monitors Gmail inbox
│   ├── whatsapp_watcher.js       # Monitors WhatsApp messages
│   ├── twitter_watcher.py        # Monitors Twitter mentions
│   ├── facebook_watcher.py       # Monitors Facebook page
│   └── approval_watcher.py       # Monitors approval queue
│
├── vault/                        # Task and data storage
│   ├── Needs_Action/             # New tasks requiring processing
│   ├── Pending_Approval/         # Tasks awaiting human approval
│   ├── Approved/                 # Approved tasks ready for execution
│   ├── Done/                     # Completed tasks (archive)
│   ├── Rejected/                 # Rejected tasks
│   ├── Logs/                     # System logs
│   ├── Company_Handbook.md       # Business rules and guidelines
│   └── Dashboard.md              # System status dashboard
│
├── docs/                         # Documentation
│   ├── GMAIL_SETUP.md
│   ├── GMAIL_SETUP_URDU.md
│   ├── ODOO_SETUP.md
│   ├── TWITTER_WHATSAPP_SETUP.md
│   ├── HOW_TO_USE.md
│   ├── QUICK_START.md
│   ├── QUICK_REFERENCE.md
│   ├── HACKATHON_DEMO_GUIDE.md
│   ├── ACCESS_BLOCKED_FIX.md
│   ├── ERROR_RECOVERY.md
│   └── GOLD_TIER_ARCHITECTURE.md
│
├── assets/                       # Images and media
│   └── 1775197147232.jfif
│
├── whatsapp_watcher.js           # Main WhatsApp automation script
├── whatsapp_ai_reply.js          # AI reply generator for WhatsApp
├── orchestrator.py               # Main orchestrator (manages all watchers)
├── scheduler.py                  # Task scheduler for recurring jobs
├── requirements.txt              # Python dependencies
├── package.json                  # Node.js dependencies
├── .env                          # Environment variables (gitignored)
└── README.md                     # This file
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **Gmail Account** with API access
- **WhatsApp Account** for WhatsApp Web
- **Git** (for version control)

### 1. Clone Repository

```bash
git clone https://github.com/M-Rayasat/AI_Employee
cd AI_Employee
```

### 2. Install Python Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Install Node.js Dependencies

```bash
npm install
```

### 4. Install Playwright (for WhatsApp)

```bash
playwright install chromium
```

### 5. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Gmail API
GMAIL_CREDENTIALS_PATH=.credentials/gmail_credentials.json
GMAIL_TOKEN_PATH=.credentials/gmail_token.json

# WhatsApp
WHATSAPP_SESSION_PATH=.credentials/whatsapp_session

# Twitter/X API (optional)
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=
TWITTER_BEARER_TOKEN=

# Facebook/Instagram API (optional)
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_PAGE_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=
INSTAGRAM_BUSINESS_ACCOUNT_ID=

# Odoo Accounting (optional)
ODOO_URL=http://localhost:8069
ODOO_DB=ai_employee_accounting
ODOO_USERNAME=admin
ODOO_PASSWORD=

# System
DRY_RUN=false
LOG_LEVEL=INFO
```

### 6. Setup Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Download credentials and save as `.credentials/gmail_credentials.json`
6. Run Gmail watcher once to authenticate:

```bash
python watchers/gmail_watcher.py
```

### 7. Setup WhatsApp

First-time setup requires QR code scanning:

```bash
node whatsapp_setup.js
```

Scan the QR code with your WhatsApp mobile app. Session will be saved for future use.

---

## 🎮 Usage

### Start All Watchers (Orchestrator)

```bash
python orchestrator.py
```

This starts all watchers in the background:
- Gmail Watcher (monitors inbox every 2 minutes)
- WhatsApp Watcher (real-time message monitoring)
- Approval Watcher (processes approved tasks)
- Twitter Watcher (optional)
- Facebook Watcher (optional)

### Start Individual Watchers

**Gmail Watcher:**
```bash
python watchers/gmail_watcher.py
```

**WhatsApp Watcher:**
```bash
node whatsapp_watcher.js
```

**Approval Watcher:**
```bash
python watchers/approval_watcher.py
```

### Manual Task Processing

```bash
claude code "Process tasks in vault/Needs_Action/"
```

---

## 🔄 Workflow

### Email Workflow

1. **Detection**: Gmail watcher detects new unread email
2. **Task Creation**: Creates task file in `vault/Needs_Action/`
3. **AI Processing**: Claude analyzes email and drafts reply
4. **Approval Request**: Creates approval file in `vault/Pending_Approval/`
5. **Human Review**: User reviews and approves/edits/rejects
6. **Execution**: Approved reply is sent via Gmail
7. **Archive**: Task moved to `vault/Done/`

### WhatsApp Workflow

1. **Detection**: WhatsApp watcher detects incoming message
2. **AI Reply Generation**: Intelligent reply generated based on context
3. **Automatic Sending**: Reply sent immediately (no approval needed)
4. **Task Logging**: Message logged in `vault/Needs_Action/`
5. **Archive**: Task moved to `vault/Done/`

### Approval Workflow

To approve a task:
1. Open file in `vault/Pending_Approval/`
2. Review the AI-generated content
3. Edit if needed
4. Move file to `vault/Approved/`

To reject a task:
1. Move file to `vault/Rejected/`
2. Optionally add rejection reason

---

## 🤖 AI Reply Intelligence

### WhatsApp AI Features

- **Context-Aware Responses**: Understands message intent and generates appropriate replies
- **Multi-language Support**: Handles English and Urdu keywords
- **Question Detection**: Identifies questions and provides helpful answers
- **Urgency Recognition**: Prioritizes urgent requests
- **Professional Tone**: Maintains business-appropriate communication
- **Smart Patterns**: Recognizes common patterns (greetings, thanks, confirmations)

### Example Responses

| Input | AI Reply |
|---|---|
| "Invoice kab milega?" | "I'll check your invoice details and send them to you right away. Please give me a moment." |
| "Urgent - need help with project" | "I understand this is urgent. I'm prioritizing this and will respond as quickly as possible." |
| "Thank you for your help" | "You're very welcome! Feel free to reach out if you need anything else." |

---

## 📊 Monitoring & Logs

### Dashboard

```bash
cat vault/Dashboard.md
```

### Logs

```bash
# Today's logs
cat vault/Logs/$(date +%Y-%m-%d).log

# All logs
ls -la vault/Logs/
```

### Task Status

```bash
ls vault/Needs_Action/       # Pending tasks
ls vault/Pending_Approval/   # Awaiting approval
ls vault/Done/               # Completed tasks
```

---

## 🔧 Configuration

### Company Handbook

Edit `vault/Company_Handbook.md` to customize:
- Business rules and policies
- Email response templates
- WhatsApp reply guidelines
- Approval requirements
- Working hours

### Watcher Settings

Edit watcher files to adjust:
- Check intervals
- Keywords to monitor
- Priority rules
- Notification settings

---

## 📈 Performance

| Component | Metric |
|---|---|
| Email detection time | ~2 minutes |
| WhatsApp response time | < 1 second |
| AI reply generation | < 500ms |
| RAM usage per watcher | < 200MB |

---

## 🛡️ Security

- **Credentials**: All credentials stored in `.credentials/` (gitignored)
- **Environment Variables**: Sensitive data in `.env` (gitignored)
- **Session Management**: WhatsApp session encrypted and stored locally
- **Approval Required**: Human approval for critical actions
- **Audit Trail**: Complete logging of all activities

---

## 🐛 Troubleshooting

### Gmail Authentication Issues

```bash
rm .credentials/gmail_token.json
python watchers/gmail_watcher.py
```

### WhatsApp Session Expired

```bash
node whatsapp_setup.js
```

### Watcher Not Running

```bash
# Check if process is running
ps aux | grep watcher

# Restart orchestrator
python orchestrator.py
```

### Browser Already Running Error

```bash
taskkill /F /IM chrome.exe  # Windows
pkill chrome                # Linux/Mac
```

---

## 🎯 Roadmap

- [ ] Claude API integration for better AI responses
- [ ] Voice message support for WhatsApp
- [ ] Multi-account support
- [ ] Advanced analytics dashboard
- [ ] Mobile app for approvals
- [ ] Slack integration
- [ ] Calendar integration
- [ ] CRM integration

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

---

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.ai/code)
- Powered by [Anthropic Claude](https://anthropic.com)
- WhatsApp automation via [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- Email integration via [Google Gmail API](https://developers.google.com/gmail/api)

---

<div align="center">

**Created by [Muhammad Rayasat](https://pk.linkedin.com/in/m-rayasat)**

[![GitHub](https://img.shields.io/badge/GitHub-M--Rayasat-181717?style=flat-square&logo=github)](https://github.com/M-Rayasat)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Muhammad%20Rayasat-0A66C2?style=flat-square&logo=linkedin)](https://pk.linkedin.com/in/m-rayasat)

</div>
