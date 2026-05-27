# Gmail API Setup Guide

This guide walks you through setting up Gmail API access for your AI Employee system.

## Prerequisites
- Google account with Gmail
- Internet connection
- 15-20 minutes

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to: https://console.cloud.google.com
2. Click "Select a project" dropdown at the top
3. Click "New Project"
4. Enter project name: **AI-Employee**
5. Click "Create"
6. Wait for project creation (30 seconds)

### 2. Enable Gmail API

1. In the project dashboard, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on "Gmail API" in results
4. Click "Enable" button
5. Wait for API to be enabled

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Click "Create"
4. Fill in required fields:
   - App name: **AI Employee**
   - User support email: your email address
   - Developer contact email: your email address
5. Click "Save and Continue"
6. On Scopes page, click "Add or Remove Scopes"
7. Search and add these scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.modify`
8. Click "Update" then "Save and Continue"
9. On Test users page, click "Add Users"
10. Add your Gmail address
11. Click "Save and Continue"

### 4. Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: Select "Desktop app"
4. Name: **AI Employee Desktop**
5. Click "Create"
6. A dialog appears with your credentials - click "Download JSON"
7. Save the downloaded file as:
   ```
   D:\My-Project\AI_Employee\.credentials\gmail_credentials.json
   ```

### 5. First Run Authentication

When you first run the Gmail watcher:

1. The script will open your default browser
2. You'll see "Google hasn't verified this app" warning
3. Click "Advanced" → "Go to AI Employee (unsafe)"
4. Sign in with your Google account
5. Click "Allow" to grant permissions
6. Browser will show "The authentication flow has completed"
7. Close the browser tab
8. A token file will be saved at: `.credentials/gmail_token.json`

### 6. Verify Setup

Run this test command:
```bash
python watchers/gmail_watcher.py --test
```

You should see: "✓ Gmail API connection successful"

## Important Notes

- **Keep credentials secret**: Never commit `.credentials/` folder to git
- **Token expiration**: In "Testing" mode, tokens expire after 7 days. You'll need to re-authenticate.
- **Production mode**: For long-term use, submit your app for Google verification (not required for hackathon)
- **Rate limits**: Gmail API has quotas. The watcher checks every 2 minutes to stay within limits.

## Troubleshooting

### Error: "Access blocked: This app's request is invalid"
- Make sure you added your email as a test user in OAuth consent screen

### Error: "invalid_grant"
- Delete `.credentials/gmail_token.json` and re-authenticate

### Error: "403 Forbidden"
- Verify Gmail API is enabled in Google Cloud Console
- Check that scopes are correctly configured

### Browser doesn't open during authentication
- Copy the URL from terminal and paste in browser manually

## Security Best Practices

1. Never share your `gmail_credentials.json` file
2. Rotate credentials monthly
3. Review OAuth consent screen periodically
4. Monitor API usage in Google Cloud Console
5. Revoke access if credentials are compromised: https://myaccount.google.com/permissions

## Next Steps

Once Gmail API is set up:
1. Install dependencies: `pip install -r requirements.txt`
2. Test the Gmail watcher: `python watchers/gmail_watcher.py`
3. Configure the orchestrator to run watchers automatically

---
*Last updated: 2026-03-28*
