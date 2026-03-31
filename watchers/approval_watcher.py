"""
Approval Watcher - Monitors Approved/ folder for approved actions
Triggers Claude skill to execute approved actions via MCP
"""

import time
import logging
from pathlib import Path
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import subprocess
import shutil

class ApprovalHandler(FileSystemEventHandler):
    def __init__(self, vault_path: str):
        self.vault_path = Path(vault_path)
        self.approved_folder = self.vault_path / 'Approved'
        self.done_folder = self.vault_path / 'Done'
        self.logs_folder = self.vault_path / 'Logs'

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger('ApprovalWatcher')

        # Ensure folders exist
        self.approved_folder.mkdir(parents=True, exist_ok=True)
        self.done_folder.mkdir(parents=True, exist_ok=True)
        self.logs_folder.mkdir(parents=True, exist_ok=True)

    def on_created(self, event):
        """Handle new files in Approved folder"""
        if event.is_directory:
            return

        filepath = Path(event.src_path)

        # Only process .md files
        if filepath.suffix != '.md':
            return

        self.logger.info(f'New approval detected: {filepath.name}')

        # Wait a moment to ensure file is fully written
        time.sleep(1)

        # Trigger Claude skill to handle approval
        self.trigger_approval_handler(filepath)

    def trigger_approval_handler(self, filepath: Path):
        """Trigger Claude Code to execute the approved action"""
        try:
            self.logger.info(f'Triggering handle-approval skill for: {filepath.name}')

            # Call Claude Code with handle-approval skill
            # Note: This assumes Claude Code is configured and accessible
            result = subprocess.run(
                ['claude', 'code', '/handle-approval', str(filepath)],
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )

            if result.returncode == 0:
                self.logger.info(f'Successfully processed: {filepath.name}')
                self.log_action(filepath, 'success', result.stdout)
            else:
                self.logger.error(f'Failed to process: {filepath.name}')
                self.log_action(filepath, 'failed', result.stderr)

        except subprocess.TimeoutExpired:
            self.logger.error(f'Timeout processing: {filepath.name}')
            self.log_action(filepath, 'timeout', 'Process exceeded 5 minute timeout')
        except Exception as e:
            self.logger.error(f'Error triggering handler: {e}')
            self.log_action(filepath, 'error', str(e))

    def log_action(self, filepath: Path, status: str, details: str):
        """Log the approval action to daily log file"""
        try:
            today = datetime.now().strftime('%Y-%m-%d')
            log_file = self.logs_folder / f'{today}.log'

            log_entry = f"""
[{datetime.now().isoformat()}]
File: {filepath.name}
Status: {status}
Details: {details}
---
"""

            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(log_entry)

        except Exception as e:
            self.logger.error(f'Error writing log: {e}')

class ApprovalWatcher:
    def __init__(self, vault_path: str):
        self.vault_path = Path(vault_path)
        self.approved_folder = self.vault_path / 'Approved'
        self.observer = None

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger('ApprovalWatcher')

        # Ensure approved folder exists
        self.approved_folder.mkdir(parents=True, exist_ok=True)

    def run(self):
        """Start watching the Approved folder"""
        self.logger.info('Starting Approval Watcher...')
        self.logger.info(f'Monitoring: {self.approved_folder}')

        # Create event handler
        event_handler = ApprovalHandler(self.vault_path)

        # Create observer
        self.observer = Observer()
        self.observer.schedule(event_handler, str(self.approved_folder), recursive=False)
        self.observer.start()

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.logger.info('Approval Watcher stopped by user')
            self.observer.stop()

        self.observer.join()

if __name__ == '__main__':
    # Configuration
    VAULT_PATH = 'vault'

    # Create and run watcher
    watcher = ApprovalWatcher(vault_path=VAULT_PATH)
    watcher.run()
