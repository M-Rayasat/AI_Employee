"""
WhatsApp Watcher - Monitors WhatsApp messages via WhatsApp Web
"""

import time
import logging
from pathlib import Path
from datetime import datetime
from playwright.sync_api import sync_playwright
import json

class WhatsAppWatcher:
    def __init__(self, vault_path: str = 'vault', session_path: str = '.credentials/whatsapp_session'):
        self.vault_path = Path(vault_path)
        self.needs_action = self.vault_path / 'Needs_Action'
        self.session_path = Path(session_path)
        self.check_interval = 30  # 30 seconds

        # Keywords to monitor
        self.keywords = ['urgent', 'asap', 'invoice', 'payment', 'help', 'important']

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('watcher.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('WhatsAppWatcher')

        # Ensure folders exist
        self.needs_action.mkdir(parents=True, exist_ok=True)
        self.session_path.mkdir(parents=True, exist_ok=True)

        # Track processed messages
        self.processed_messages = set()
        self.processed_file = Path('.credentials/whatsapp_processed.json')
        self.load_processed_messages()

    def load_processed_messages(self):
        """Load previously processed message IDs"""
        if self.processed_file.exists():
            try:
                with open(self.processed_file, 'r') as f:
                    data = json.load(f)
                    self.processed_messages = set(data.get('messages', []))
                    self.logger.info(f'Loaded {len(self.processed_messages)} processed messages')
            except Exception as e:
                self.logger.error(f'Error loading processed messages: {e}')

    def save_processed_messages(self):
        """Save processed message IDs"""
        try:
            self.processed_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.processed_file, 'w') as f:
                json.dump({'messages': list(self.processed_messages)}, f)
        except Exception as e:
            self.logger.error(f'Error saving processed messages: {e}')

    def check_messages(self, page):
        """Check for new messages with keywords"""
        try:
            # Get unread chats
            unread_chats = page.query_selector_all('[aria-label*="unread"]')

            if not unread_chats:
                self.logger.info('No unread messages')
                return

            self.logger.info(f'Found {len(unread_chats)} unread chats')

            for chat in unread_chats[:10]:  # Process max 10 unread chats
                try:
                    # Get chat name
                    name_element = chat.query_selector('[data-testid="cell-frame-title"]')
                    contact_name = name_element.text_content() if name_element else 'Unknown'

                    # Get last message
                    msg_element = chat.query_selector('[data-testid="last-msg"]')
                    message_text = msg_element.text_content() if msg_element else ''

                    # Check if message contains keywords
                    message_lower = message_text.lower()
                    has_keyword = any(kw in message_lower for kw in self.keywords)

                    if has_keyword:
                        message_id = f'{contact_name}_{message_text[:20]}'

                        if message_id not in self.processed_messages:
                            self.logger.info(f'Keyword found in message from {contact_name}')
                            self.create_task_file(contact_name, message_text)
                            self.processed_messages.add(message_id)

                except Exception as e:
                    self.logger.error(f'Error processing chat: {e}')

            self.save_processed_messages()

        except Exception as e:
            self.logger.error(f'Error checking messages: {e}')

    def create_task_file(self, contact_name, message_text):
        """Create task file for a WhatsApp message"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

            content = f'''---
type: whatsapp_message
from: {contact_name}
received: {datetime.now().isoformat()}
priority: high
status: pending
---

## Message Details

**From:** {contact_name}
**Received:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Message Content

{message_text}

## Suggested Actions
- [ ] Analyze message intent
- [ ] Draft appropriate response
- [ ] Create approval request if reply needed
- [ ] Archive after processing

## Instructions for Claude
1. Analyze this WhatsApp message and determine appropriate response
2. Check Company_Handbook.md for WhatsApp handling rules
3. If response needed, create approval request in Pending_Approval/
4. Move this file to Done/ when processed
'''

            filepath = self.needs_action / f'WHATSAPP_{contact_name}_{timestamp}.md'
            filepath.write_text(content, encoding='utf-8')

            self.logger.info(f'Created task file: WHATSAPP_{contact_name}_{timestamp}.md')

        except Exception as e:
            self.logger.error(f'Error creating task file: {e}')

    def run(self):
        """Main watcher loop"""
        self.logger.info('Starting WhatsApp Watcher...')
        self.logger.info(f'Session path: {self.session_path}')
        self.logger.info(f'Monitoring keywords: {", ".join(self.keywords)}')
        self.logger.info(f'Check interval: {self.check_interval} seconds')

        with sync_playwright() as p:
            # Launch browser with persistent context (saves session)
            browser = p.chromium.launch_persistent_context(
                str(self.session_path),
                headless=False,  # Must be visible for QR code scan
                args=['--no-sandbox']
            )

            page = browser.pages[0] if browser.pages else browser.new_page()
            page.goto('https://web.whatsapp.com')

            self.logger.info('Waiting for WhatsApp Web to load...')

            try:
                # Wait for chat list (means logged in)
                page.wait_for_selector('[data-testid="chat-list"]', timeout=120000)
                self.logger.info('WhatsApp Web loaded successfully')
            except Exception as e:
                self.logger.error('Please scan QR code to authenticate')
                page.wait_for_selector('[data-testid="chat-list"]', timeout=300000)
                self.logger.info('Authentication successful')

            # Main monitoring loop
            while True:
                try:
                    self.check_messages(page)
                    time.sleep(self.check_interval)
                except KeyboardInterrupt:
                    self.logger.info('WhatsApp Watcher stopped by user')
                    break
                except Exception as e:
                    self.logger.error(f'Error in main loop: {e}')
                    time.sleep(60)

            browser.close()

if __name__ == '__main__':
    watcher = WhatsAppWatcher()
    watcher.run()
