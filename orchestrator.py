"""
Orchestrator - Master coordinator for AI Employee system
Manages all watchers, scheduling, and system health monitoring
"""

import time
import logging
import threading
import signal
import sys
from pathlib import Path
from datetime import datetime
import subprocess
import os

class Orchestrator:
    def __init__(self, vault_path: str = 'vault', ralph_mode: bool = False):
        self.vault_path = Path(vault_path)
        self.watchers = {}
        self.running = False
        self.ralph_mode = ralph_mode
        # Use absolute path to virtual environment Python
        base_dir = Path(__file__).parent.parent
        self.venv_python = str(base_dir / 'venv' / 'bin' / 'python')

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('watcher.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('Orchestrator')

        # Register signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self.shutdown)
        signal.signal(signal.SIGTERM, self.shutdown)

    def start_watcher(self, name: str, script_path: str):
        """Start a watcher script as a subprocess"""
        try:
            self.logger.info(f'Starting {name}...')

            process = subprocess.Popen(
                [self.venv_python, script_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            self.watchers[name] = {
                'process': process,
                'script': script_path,
                'started': datetime.now(),
                'restarts': 0
            }

            self.logger.info(f'{name} started with PID {process.pid}')
            return True

        except Exception as e:
            self.logger.error(f'Failed to start {name}: {e}')
            return False

    def monitor_watchers(self):
        """Monitor watcher health and restart if crashed"""
        while self.running:
            for name, watcher in list(self.watchers.items()):
                process = watcher['process']

                # Check if process is still running
                if process.poll() is not None:
                    self.logger.warning(f'{name} has stopped (exit code: {process.returncode})')

                    # Restart the watcher
                    if watcher['restarts'] < 5:  # Max 5 restarts
                        self.logger.info(f'Restarting {name}...')
                        watcher['restarts'] += 1
                        self.start_watcher(name, watcher['script'])
                    else:
                        self.logger.error(f'{name} has crashed too many times, not restarting')
                        del self.watchers[name]

            time.sleep(30)  # Check every 30 seconds

    def shutdown(self, signum=None, frame=None):
        """Graceful shutdown of all watchers"""
        self.logger.info('Shutting down orchestrator...')
        self.running = False

        for name, watcher in self.watchers.items():
            self.logger.info(f'Stopping {name}...')
            process = watcher['process']

            try:
                process.terminate()
                process.wait(timeout=10)
                self.logger.info(f'{name} stopped')
            except subprocess.TimeoutExpired:
                self.logger.warning(f'{name} did not stop gracefully, killing...')
                process.kill()

        self.logger.info('Orchestrator shutdown complete')
        sys.exit(0)

    def run(self):
        """Main orchestrator loop"""
        self.logger.info('=' * 60)
        tier = 'Gold Tier' if self.ralph_mode else 'Silver Tier'
        self.logger.info(f'AI Employee Orchestrator - {tier}')
        self.logger.info('=' * 60)
        self.logger.info(f'Vault path: {self.vault_path.absolute()}')
        self.logger.info(f'Ralph Wiggum Mode: {self.ralph_mode}')
        self.logger.info(f'Started at: {datetime.now().isoformat()}')

        self.running = True

        # Get base directory (where orchestrator.py is located)
        base_dir = Path(__file__).parent

        # Start all watchers
        watchers_to_start = [
            ('FilesystemWatcher', 'watchers/filesystem_watcher.py'),
            ('GmailWatcher', 'watchers/gmail_watcher.py'),
            ('ApprovalWatcher', 'watchers/approval_watcher.py'),
            ('TwitterWatcher', 'watchers/twitter_watcher.py'),
            ('WhatsAppWatcher', 'watchers/whatsapp_watcher.py'),
            ('FacebookWatcher', 'watchers/facebook_watcher.py'),
        ]

        for name, script in watchers_to_start:
            script_path = base_dir / script
            if script_path.exists():
                self.start_watcher(name, str(script_path))
            else:
                self.logger.warning(f'Watcher script not found: {script_path}')

        # Start health monitoring in separate thread
        monitor_thread = threading.Thread(target=self.monitor_watchers, daemon=True)
        monitor_thread.start()

        self.logger.info('All watchers started. Orchestrator running...')
        self.logger.info('Press Ctrl+C to stop')

        # Keep main thread alive
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.shutdown()

    def status(self):
        """Print status of all watchers"""
        self.logger.info('=' * 60)
        self.logger.info('Watcher Status')
        self.logger.info('=' * 60)

        for name, watcher in self.watchers.items():
            process = watcher['process']
            status = 'Running' if process.poll() is None else 'Stopped'
            uptime = datetime.now() - watcher['started']

            self.logger.info(f'{name}:')
            self.logger.info(f'  Status: {status}')
            self.logger.info(f'  PID: {process.pid}')
            self.logger.info(f'  Uptime: {uptime}')
            self.logger.info(f'  Restarts: {watcher["restarts"]}')
            self.logger.info('')

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='AI Employee Orchestrator')
    parser.add_argument('--vault', default='vault', help='Path to Obsidian vault')
    parser.add_argument('--status', action='store_true', help='Show watcher status')
    parser.add_argument('--ralph-mode', action='store_true', help='Enable Ralph Wiggum autonomous execution mode')

    args = parser.parse_args()

    orchestrator = Orchestrator(vault_path=args.vault, ralph_mode=args.ralph_mode)

    if args.status:
        orchestrator.status()
    else:
        orchestrator.run()
