"""
Twitter Watcher - Monitors Twitter mentions and creates tasks
"""

import time
import logging
from pathlib import Path
from datetime import datetime
import os
from dotenv import load_dotenv
from tweepy import Client, StreamingClient, StreamRule
import json

load_dotenv()

class TwitterWatcher:
    def __init__(self, vault_path: str = 'vault'):
        self.vault_path = Path(vault_path)
        self.needs_action = self.vault_path / 'Needs_Action'
        self.check_interval = 300  # 5 minutes

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('watcher.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('TwitterWatcher')

        # Ensure folders exist
        self.needs_action.mkdir(parents=True, exist_ok=True)

        # Twitter API credentials
        bearer_token = os.getenv('TWITTER_BEARER_TOKEN')
        api_key = os.getenv('TWITTER_API_KEY')
        api_secret = os.getenv('TWITTER_API_SECRET')
        access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')

        if not all([bearer_token, api_key, api_secret, access_token, access_token_secret]):
            raise ValueError('Twitter API credentials not found in .env')

        # Initialize Twitter client
        self.client = Client(
            bearer_token=bearer_token,
            consumer_key=api_key,
            consumer_secret=api_secret,
            access_token=access_token,
            access_token_secret=access_token_secret
        )

        # Track processed tweet IDs
        self.processed_ids = set()
        self.processed_ids_file = Path('.credentials/twitter_processed_ids.json')
        self.load_processed_ids()

    def load_processed_ids(self):
        """Load previously processed tweet IDs"""
        if self.processed_ids_file.exists():
            try:
                with open(self.processed_ids_file, 'r') as f:
                    data = json.load(f)
                    self.processed_ids = set(data.get('ids', []))
                    self.logger.info(f'Loaded {len(self.processed_ids)} processed tweet IDs')
            except Exception as e:
                self.logger.error(f'Error loading processed IDs: {e}')

    def save_processed_ids(self):
        """Save processed tweet IDs"""
        try:
            self.processed_ids_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.processed_ids_file, 'w') as f:
                json.dump({'ids': list(self.processed_ids)}, f)
        except Exception as e:
            self.logger.error(f'Error saving processed IDs: {e}')

    def check_mentions(self):
        """Check for new mentions"""
        try:
            # Get authenticated user ID
            me = self.client.get_me()
            user_id = me.data.id

            # Get mentions
            mentions = self.client.get_users_mentions(
                id=user_id,
                max_results=10,
                tweet_fields=['created_at', 'author_id', 'conversation_id', 'text']
            )

            if not mentions.data:
                self.logger.info('No new mentions found')
                return

            new_mentions = [m for m in mentions.data if m.id not in self.processed_ids]

            if not new_mentions:
                self.logger.info('No unprocessed mentions')
                return

            self.logger.info(f'Found {len(new_mentions)} new mentions')

            for mention in new_mentions:
                self.create_task_file(mention)
                self.processed_ids.add(mention.id)

            self.save_processed_ids()

        except Exception as e:
            self.logger.error(f'Error checking mentions: {e}')

    def create_task_file(self, mention):
        """Create task file for a mention"""
        try:
            content = f'''---
type: twitter_mention
from_user_id: {mention.author_id}
tweet_id: {mention.id}
conversation_id: {mention.conversation_id}
received: {datetime.now().isoformat()}
priority: normal
status: pending
---

## Tweet Details

**Tweet ID:** {mention.id}
**Author ID:** {mention.author_id}
**Created:** {mention.created_at}
**Conversation ID:** {mention.conversation_id}

## Tweet Content

{mention.text}

## Suggested Actions
- [ ] Analyze mention intent
- [ ] Draft appropriate reply
- [ ] Create approval request if reply needed
- [ ] Archive after processing

## Instructions for Claude
1. Analyze this mention and determine appropriate response
2. Check Company_Handbook.md for Twitter handling rules
3. If response needed, create approval request in Pending_Approval/
4. Move this file to Done/ when processed
'''

            filepath = self.needs_action / f'TWITTER_{mention.id}.md'
            filepath.write_text(content, encoding='utf-8')

            self.logger.info(f'Created task file: TWITTER_{mention.id}.md')

        except Exception as e:
            self.logger.error(f'Error creating task file: {e}')

    def run(self):
        """Main watcher loop"""
        self.logger.info('Starting Twitter Watcher...')
        self.logger.info(f'Monitoring mentions every {self.check_interval} seconds')
        self.logger.info(f'Writing tasks to: {self.needs_action}')

        while True:
            try:
                self.check_mentions()
                time.sleep(self.check_interval)
            except KeyboardInterrupt:
                self.logger.info('Twitter Watcher stopped by user')
                break
            except Exception as e:
                self.logger.error(f'Error in main loop: {e}')
                time.sleep(60)  # Wait 1 minute before retrying

if __name__ == '__main__':
    watcher = TwitterWatcher()
    watcher.run()
