"""
Facebook Watcher - Monitors Facebook page notifications and comments
"""

import time
import logging
from pathlib import Path
from datetime import datetime
import json
import requests
import os
from dotenv import load_dotenv

load_dotenv()

class FacebookWatcher:
    def __init__(self, vault_path: str = 'vault'):
        self.vault_path = Path(vault_path)
        self.needs_action = self.vault_path / 'Needs_Action'
        self.check_interval = 300  # 5 minutes

        # Facebook credentials
        self.page_access_token = os.getenv('FACEBOOK_PAGE_ACCESS_TOKEN')
        self.page_id = os.getenv('FACEBOOK_PAGE_ID')

        if not self.page_access_token or not self.page_id:
            raise ValueError('FACEBOOK_PAGE_ACCESS_TOKEN and FACEBOOK_PAGE_ID must be set in .env')

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('watcher.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('FacebookWatcher')

        # Ensure folders exist
        self.needs_action.mkdir(parents=True, exist_ok=True)

        # Track processed items
        self.processed_items = set()
        self.processed_file = Path('.credentials/facebook_processed.json')
        self.load_processed_items()

    def load_processed_items(self):
        """Load previously processed item IDs"""
        if self.processed_file.exists():
            try:
                with open(self.processed_file, 'r') as f:
                    data = json.load(f)
                    self.processed_items = set(data.get('items', []))
                    self.logger.info(f'Loaded {len(self.processed_items)} processed items')
            except Exception as e:
                self.logger.error(f'Error loading processed items: {e}')

    def save_processed_items(self):
        """Save processed item IDs"""
        try:
            self.processed_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.processed_file, 'w') as f:
                json.dump({'items': list(self.processed_items)}, f)
        except Exception as e:
            self.logger.error(f'Error saving processed items: {e}')

    def check_comments(self):
        """Check for new comments on recent posts"""
        try:
            # Get recent posts
            url = f'https://graph.facebook.com/v18.0/{self.page_id}/posts'
            params = {
                'access_token': self.page_access_token,
                'fields': 'id,message,created_time,comments{id,from,message,created_time}',
                'limit': 5
            }

            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            if 'data' not in data:
                self.logger.info('No posts found')
                return

            for post in data['data']:
                if 'comments' in post and 'data' in post['comments']:
                    for comment in post['comments']['data']:
                        comment_id = comment['id']

                        if comment_id not in self.processed_items:
                            self.logger.info(f'New comment from {comment["from"]["name"]}')
                            self.create_comment_task(post, comment)
                            self.processed_items.add(comment_id)

            self.save_processed_items()

        except Exception as e:
            self.logger.error(f'Error checking comments: {e}')

    def check_messages(self):
        """Check for new page messages"""
        try:
            url = f'https://graph.facebook.com/v18.0/{self.page_id}/conversations'
            params = {
                'access_token': self.page_access_token,
                'fields': 'id,updated_time,messages{id,from,message,created_time}',
                'limit': 10
            }

            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            if 'data' not in data:
                self.logger.info('No conversations found')
                return

            for conversation in data['data']:
                if 'messages' in conversation and 'data' in conversation['messages']:
                    for message in conversation['messages']['data']:
                        message_id = message['id']

                        # Skip messages from page itself
                        if message.get('from', {}).get('id') == self.page_id:
                            continue

                        if message_id not in self.processed_items:
                            self.logger.info(f'New message from {message.get("from", {}).get("name", "Unknown")}')
                            self.create_message_task(message)
                            self.processed_items.add(message_id)

            self.save_processed_items()

        except Exception as e:
            self.logger.error(f'Error checking messages: {e}')

    def create_comment_task(self, post, comment):
        """Create task file for a Facebook comment"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            commenter_name = comment['from']['name'].replace(' ', '_')

            post_preview = post.get('message', 'No message')[:100]

            content = f'''---
type: facebook_comment
from: {comment['from']['name']}
comment_id: {comment['id']}
post_id: {post['id']}
received: {comment['created_time']}
priority: medium
status: pending
---

## Comment Details

**From:** {comment['from']['name']}
**On Post:** {post_preview}...
**Received:** {comment['created_time']}

## Comment Content

{comment['message']}

## Suggested Actions
- [ ] Analyze comment sentiment
- [ ] Draft appropriate reply
- [ ] Create approval request if response needed
- [ ] Archive after processing

## Instructions for Claude
1. Analyze this Facebook comment and determine appropriate response
2. Check Company_Handbook.md for Facebook handling rules
3. If response needed, create approval request in Pending_Approval/
4. Move this file to Done/ when processed
'''

            filepath = self.needs_action / f'FACEBOOK_COMMENT_{commenter_name}_{timestamp}.md'
            filepath.write_text(content, encoding='utf-8')

            self.logger.info(f'Created task file: FACEBOOK_COMMENT_{commenter_name}_{timestamp}.md')

        except Exception as e:
            self.logger.error(f'Error creating comment task file: {e}')

    def create_message_task(self, message):
        """Create task file for a Facebook message"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            sender_name = message.get('from', {}).get('name', 'Unknown').replace(' ', '_')

            content = f'''---
type: facebook_message
from: {message.get('from', {}).get('name', 'Unknown')}
message_id: {message['id']}
received: {message['created_time']}
priority: high
status: pending
---

## Message Details

**From:** {message.get('from', {}).get('name', 'Unknown')}
**Received:** {message['created_time']}

## Message Content

{message.get('message', 'No message content')}

## Suggested Actions
- [ ] Analyze message intent
- [ ] Draft appropriate response
- [ ] Create approval request if reply needed
- [ ] Archive after processing

## Instructions for Claude
1. Analyze this Facebook message and determine appropriate response
2. Check Company_Handbook.md for Facebook handling rules
3. If response needed, create approval request in Pending_Approval/
4. Move this file to Done/ when processed
'''

            filepath = self.needs_action / f'FACEBOOK_MESSAGE_{sender_name}_{timestamp}.md'
            filepath.write_text(content, encoding='utf-8')

            self.logger.info(f'Created task file: FACEBOOK_MESSAGE_{sender_name}_{timestamp}.md')

        except Exception as e:
            self.logger.error(f'Error creating message task file: {e}')

    def run(self):
        """Main watcher loop"""
        self.logger.info('Starting Facebook Watcher...')
        self.logger.info(f'Page ID: {self.page_id}')
        self.logger.info(f'Check interval: {self.check_interval} seconds')

        while True:
            try:
                self.logger.info('Checking Facebook page...')
                self.check_comments()
                self.check_messages()
                time.sleep(self.check_interval)
            except KeyboardInterrupt:
                self.logger.info('Facebook Watcher stopped by user')
                break
            except Exception as e:
                self.logger.error(f'Error in main loop: {e}')
                time.sleep(60)

if __name__ == '__main__':
    watcher = FacebookWatcher()
    watcher.run()
