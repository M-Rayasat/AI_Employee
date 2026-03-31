"""
Gmail Watcher - Monitors Gmail for important unread emails
Creates task files in vault/Needs_Action/ for Claude to process
"""

import time
import logging
from pathlib import Path
from datetime import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import os
import pickle

# Gmail API scopes
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
]

class GmailWatcher:
    def __init__(self, vault_path: str, credentials_path: str, token_path: str, check_interval: int = 120):
        self.vault_path = Path(vault_path)
        self.needs_action = self.vault_path / 'Needs_Action'
        self.credentials_path = credentials_path
        self.token_path = token_path
        self.check_interval = check_interval
        self.processed_ids = set()
        self.service = None

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger('GmailWatcher')

        # Ensure Needs_Action folder exists
        self.needs_action.mkdir(parents=True, exist_ok=True)

    def authenticate(self):
        """Authenticate with Gmail API using OAuth2"""
        creds = None

        # Load existing token
        if os.path.exists(self.token_path):
            with open(self.token_path, 'rb') as token:
                creds = pickle.load(token)

        # If no valid credentials, authenticate
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                self.logger.info('Refreshing expired token...')
                creds.refresh(Request())
            else:
                self.logger.info('Starting OAuth flow...')
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, SCOPES
                )
                creds = flow.run_local_server(port=0)

            # Save token for future use
            with open(self.token_path, 'wb') as token:
                pickle.dump(creds, token)
            self.logger.info('Token saved successfully')

        self.service = build('gmail', 'v1', credentials=creds)
        self.logger.info('Gmail API authenticated successfully')

    def check_for_updates(self):
        """Check for new important unread emails"""
        try:
            results = self.service.users().messages().list(
                userId='me',
                q='is:unread is:important',
                maxResults=10
            ).execute()

            messages = results.get('messages', [])
            new_messages = [m for m in messages if m['id'] not in self.processed_ids]

            self.logger.info(f'Found {len(new_messages)} new important emails')
            return new_messages

        except Exception as e:
            self.logger.error(f'Error checking for emails: {e}')
            return []

    def create_action_file(self, message):
        """Create task file in Needs_Action folder"""
        try:
            # Get full message details
            msg = self.service.users().messages().get(
                userId='me',
                id=message['id'],
                format='full'
            ).execute()

            # Extract headers
            headers = {h['name']: h['value'] for h in msg['payload']['headers']}
            from_email = headers.get('From', 'Unknown')
            subject = headers.get('Subject', 'No Subject')
            date = headers.get('Date', datetime.now().isoformat())

            # Get email snippet
            snippet = msg.get('snippet', '')

            # Create markdown content
            content = f"""---
type: email
from: {from_email}
subject: {subject}
received: {datetime.now().isoformat()}
gmail_id: {message['id']}
priority: high
status: pending
---

## Email Details

**From:** {from_email}
**Subject:** {subject}
**Date:** {date}

## Email Preview
{snippet}

## Suggested Actions
- [ ] Read full email content
- [ ] Draft appropriate response
- [ ] Create approval request if reply needed
- [ ] Archive after processing

## Instructions for Claude
1. Analyze this email and determine appropriate response
2. Check Company_Handbook.md for email handling rules
3. If response needed, create approval request in Pending_Approval/
4. Move this file to Done/ when processed
"""

            # Save to file
            filepath = self.needs_action / f'EMAIL_{message["id"]}.md'
            filepath.write_text(content, encoding='utf-8')

            # Mark as processed
            self.processed_ids.add(message['id'])

            self.logger.info(f'Created task file: {filepath.name}')
            return filepath

        except Exception as e:
            self.logger.error(f'Error creating action file: {e}')
            return None

    def run(self):
        """Main watcher loop"""
        self.logger.info('Starting Gmail Watcher...')

        # Authenticate first
        self.authenticate()

        self.logger.info(f'Monitoring Gmail every {self.check_interval} seconds')
        self.logger.info(f'Writing tasks to: {self.needs_action}')

        while True:
            try:
                messages = self.check_for_updates()

                for message in messages:
                    self.create_action_file(message)

                time.sleep(self.check_interval)

            except KeyboardInterrupt:
                self.logger.info('Gmail Watcher stopped by user')
                break
            except Exception as e:
                self.logger.error(f'Error in main loop: {e}')
                time.sleep(self.check_interval)

if __name__ == '__main__':
    from dotenv import load_dotenv

    # Load environment variables
    load_dotenv()

    # Configuration
    VAULT_PATH = 'vault'
    CREDENTIALS_PATH = os.getenv('GMAIL_CREDENTIALS_PATH', '.credentials/gmail_credentials.json')
    TOKEN_PATH = os.getenv('GMAIL_TOKEN_PATH', '.credentials/gmail_token.json')

    # Create and run watcher
    watcher = GmailWatcher(
        vault_path=VAULT_PATH,
        credentials_path=CREDENTIALS_PATH,
        token_path=TOKEN_PATH,
        check_interval=120  # Check every 2 minutes
    )

    watcher.run()
