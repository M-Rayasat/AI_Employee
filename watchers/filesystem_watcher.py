"""
Filesystem Watcher for AI Employee - Bronze Tier (Autonomous)
Monitors the drop/ folder using watchdog and moves files to Needs_Action/ with metadata
Automatically triggers Claude Code to process tasks
Based on the Personal AI Employee Hackathon architecture (lines 293-322)
"""

import time
import logging
import subprocess
from pathlib import Path
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import shutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('watcher.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('FilesystemWatcher')

# Configuration
VAULT_PATH = Path(r"D:\My-Project\AI_Employee\vault")
DROP_FOLDER = Path(r"D:\My-Project\AI_Employee\drop")


class DropFolderHandler(FileSystemEventHandler):
    """Handles file creation events in the drop folder"""

    def __init__(self, vault_path: Path, drop_path: Path):
        self.vault_path = vault_path
        self.drop_path = drop_path
        self.needs_action = self.vault_path / 'Needs_Action'

        # Ensure directories exist
        self.needs_action.mkdir(parents=True, exist_ok=True)
        logger.info(f'Initialized watcher for {self.drop_path}')

    def on_created(self, event):
        """Called when a file is created in the drop folder"""
        if event.is_directory:
            return

        source = Path(event.src_path)

        # Ignore temporary files and hidden files
        if source.name.startswith('.') or source.name.startswith('~'):
            return

        # Wait a moment to ensure file is fully written
        time.sleep(1)

        try:
            # Copy file to Needs_Action
            dest = self.needs_action / source.name

            # If file already exists, add timestamp
            if dest.exists():
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                dest = self.needs_action / f"{source.stem}_{timestamp}{source.suffix}"

            shutil.copy2(source, dest)
            logger.info(f'Copied {source.name} to Needs_Action')

            # Create metadata file
            self.create_metadata(source, dest)

            # Remove original from drop folder
            source.unlink()
            logger.info(f'Removed {source.name} from drop folder')

            # Trigger Claude Code to process the task
            self.trigger_claude_processing()

        except Exception as e:
            logger.error(f'Error processing {source.name}: {e}')

    def create_metadata(self, source: Path, dest: Path):
        """Create a metadata markdown file for the dropped file"""
        timestamp = datetime.now().isoformat()
        file_size = source.stat().st_size

        # Determine file type
        file_ext = source.suffix.lower()
        file_type = self.get_file_type(file_ext)

        meta_content = f"""---
type: file_drop
original_name: {source.name}
file_type: {file_type}
size_bytes: {file_size}
received: {timestamp}
status: pending
priority: medium
---

# New File: {source.name}

## File Information
- **Type**: {file_type}
- **Size**: {self.format_size(file_size)}
- **Received**: {timestamp}

## Suggested Actions
- [ ] Review file contents
- [ ] Determine appropriate action
- [ ] Process according to Company Handbook rules
- [ ] Move to /Done when complete

## Notes
Add processing notes here.
"""

        meta_path = self.needs_action / f"{dest.stem}_metadata.md"
        meta_path.write_text(meta_content, encoding='utf-8')
        logger.info(f'Created metadata file: {meta_path.name}')

    def get_file_type(self, ext: str) -> str:
        """Determine file type from extension"""
        type_map = {
            '.txt': 'text',
            '.md': 'markdown',
            '.pdf': 'document',
            '.doc': 'document',
            '.docx': 'document',
            '.xls': 'spreadsheet',
            '.xlsx': 'spreadsheet',
            '.csv': 'data',
            '.json': 'data',
            '.jpg': 'image',
            '.jpeg': 'image',
            '.png': 'image',
            '.gif': 'image',
            '.zip': 'archive',
            '.rar': 'archive',
        }
        return type_map.get(ext, 'unknown')

    def format_size(self, size_bytes: int) -> str:
        """Format file size in human-readable format"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} TB"

    def trigger_claude_processing(self):
        """Trigger Claude Code to process tasks automatically"""
        try:
            logger.info('Triggering Claude Code to process task...')

            # Run claude /process-task command using cmd
            result = subprocess.run(
                'claude /process-task',
                cwd=str(self.vault_path.parent),
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
                shell=True
            )

            logger.info(f'Claude exit code: {result.returncode}')
            if result.stdout:
                logger.info(f'Claude stdout: {result.stdout[:200]}')
            if result.stderr:
                logger.error(f'Claude stderr: {result.stderr[:200]}')

            if result.returncode == 0:
                logger.info('Claude processing completed successfully')

                # Update dashboard after processing
                logger.info('Updating dashboard...')
                dashboard_result = subprocess.run(
                    'claude /update-dashboard',
                    cwd=str(self.vault_path.parent),
                    capture_output=True,
                    text=True,
                    timeout=60,
                    shell=True
                )

                if dashboard_result.returncode == 0:
                    logger.info('Dashboard updated successfully')
                else:
                    logger.warning(f'Dashboard update failed: {dashboard_result.stderr[:200]}')
            else:
                logger.error(f'Claude processing failed with code {result.returncode}')

        except subprocess.TimeoutExpired:
            logger.error('Claude command timed out')
        except FileNotFoundError:
            logger.error('Claude command not found. Make sure Claude Code is installed and in PATH')
        except Exception as e:
            logger.error(f'Error triggering Claude: {e}')


def main():
    """Main watcher loop"""
    # Ensure drop folder exists
    DROP_FOLDER.mkdir(parents=True, exist_ok=True)

    logger.info('Starting Filesystem Watcher...')
    logger.info(f'Monitoring: {DROP_FOLDER}')
    logger.info(f'Vault: {VAULT_PATH}')

    # Create event handler and observer
    event_handler = DropFolderHandler(VAULT_PATH, DROP_FOLDER)
    observer = Observer()
    observer.schedule(event_handler, str(DROP_FOLDER), recursive=False)

    # Start watching
    observer.start()
    logger.info('Watcher is running. Press Ctrl+C to stop.')

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info('Stopping watcher...')
        observer.stop()

    observer.join()
    logger.info('Watcher stopped.')


if __name__ == '__main__':
    main()
