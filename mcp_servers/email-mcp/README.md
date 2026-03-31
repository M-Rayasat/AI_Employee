# Email MCP Server

MCP server for sending and managing emails via Gmail API.

## Features

- Send emails via Gmail
- Create draft emails
- Search emails with Gmail query syntax
- Thread support for replies

## Setup

### 1. Install Dependencies

```bash
cd mcp_servers/email-mcp
npm install
```

### 2. Configure Gmail API

Follow the instructions in `GMAIL_SETUP.md` to:
- Create Google Cloud project
- Enable Gmail API
- Download credentials
- Authenticate

### 3. Configure Environment Variables

Ensure `.env` file in project root contains:

```
GMAIL_CREDENTIALS_PATH=.credentials/gmail_credentials.json
GMAIL_TOKEN_PATH=.credentials/gmail_token.json
```

### 4. Test the Server

```bash
npm start
```

## Usage with Claude Code

Add to `.claude/mcp_config.json`:

```json
{
  "mcpServers": {
    "email": {
      "command": "node",
      "args": ["mcp_servers/email-mcp/index.js"],
      "env": {
        "GMAIL_CREDENTIALS_PATH": ".credentials/gmail_credentials.json",
        "GMAIL_TOKEN_PATH": ".credentials/gmail_token.json"
      }
    }
  }
}
```

## Available Tools

### send_email

Send an email via Gmail.

**Parameters:**
- `to` (string, required): Recipient email address
- `subject` (string, required): Email subject
- `body` (string, required): Email body content
- `reply_to_id` (string, optional): Gmail message ID to reply to

**Example:**
```javascript
{
  "to": "recipient@example.com",
  "subject": "Hello from AI Employee",
  "body": "This is an automated email sent via MCP server."
}
```

### draft_email

Create a draft email in Gmail.

**Parameters:**
- `to` (string, required): Recipient email address
- `subject` (string, required): Email subject
- `body` (string, required): Email body content

### search_emails

Search emails using Gmail query syntax.

**Parameters:**
- `query` (string, required): Gmail search query
- `maxResults` (number, optional): Maximum results (default: 10)

**Example queries:**
- `"is:unread is:important"`
- `"from:client@example.com"`
- `"subject:invoice after:2026/03/01"`

## Troubleshooting

### Authentication Errors

If you see authentication errors:
1. Delete `.credentials/gmail_token.json`
2. Run the Gmail watcher to re-authenticate
3. Restart the MCP server

### Permission Errors

Ensure Gmail API scopes include:
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.modify`

### Rate Limits

Gmail API has quotas:
- 250 quota units per user per second
- Sending emails: 100 per day (for new accounts)

## Security

- Never commit credentials or tokens
- Keep `.credentials/` folder in `.gitignore`
- Rotate credentials monthly
- Monitor API usage in Google Cloud Console

---
*Last updated: 2026-03-28*
