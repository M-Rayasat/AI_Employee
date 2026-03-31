"""
Scheduler - Handles scheduled tasks for AI Employee system
Uses APScheduler for daily briefings and periodic tasks
"""

import logging
from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
import subprocess
import sys

class AIEmployeeScheduler:
    def __init__(self):
        self.scheduler = BlockingScheduler()

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('scheduler.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('Scheduler')

    def trigger_skill(self, skill_name: str, args: str = ''):
        """Trigger a Claude Code skill"""
        try:
            self.logger.info(f'Triggering skill: {skill_name} {args}')

            cmd = ['claude', 'code', f'/{skill_name}']
            if args:
                cmd.append(args)

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=600  # 10 minute timeout
            )

            if result.returncode == 0:
                self.logger.info(f'Skill {skill_name} completed successfully')
            else:
                self.logger.error(f'Skill {skill_name} failed: {result.stderr}')

        except subprocess.TimeoutExpired:
            self.logger.error(f'Skill {skill_name} timed out')
        except Exception as e:
            self.logger.error(f'Error triggering skill {skill_name}: {e}')

    def daily_briefing(self):
        """Generate daily business briefing"""
        self.logger.info('Starting daily briefing generation...')
        self.trigger_skill('business-audit', '--daily')

    def weekly_audit(self):
        """Generate weekly business audit"""
        self.logger.info('Starting weekly business audit...')
        self.trigger_skill('business-audit')

    def hourly_dashboard_update(self):
        """Update dashboard every hour"""
        self.logger.info('Updating dashboard...')
        self.trigger_skill('update-dashboard')

    def generate_linkedin_content(self):
        """Generate LinkedIn content for scheduled posting"""
        self.logger.info('Generating LinkedIn content...')
        self.trigger_skill('generate-linkedin-content')

    def setup_jobs(self):
        """Setup all scheduled jobs"""

        # Daily briefing at 8:00 AM
        self.scheduler.add_job(
            self.daily_briefing,
            CronTrigger(hour=8, minute=0),
            id='daily_briefing',
            name='Daily Business Briefing',
            replace_existing=True
        )
        self.logger.info('Scheduled: Daily briefing at 8:00 AM')

        # Weekly audit on Sunday at 8:00 PM
        self.scheduler.add_job(
            self.weekly_audit,
            CronTrigger(day_of_week='sun', hour=20, minute=0),
            id='weekly_audit',
            name='Weekly Business Audit',
            replace_existing=True
        )
        self.logger.info('Scheduled: Weekly audit on Sunday at 8:00 PM')

        # Hourly dashboard update
        self.scheduler.add_job(
            self.hourly_dashboard_update,
            CronTrigger(minute=0),
            id='hourly_dashboard',
            name='Hourly Dashboard Update',
            replace_existing=True
        )
        self.logger.info('Scheduled: Dashboard update every hour')

        # LinkedIn content generation - Monday, Wednesday, Friday at 9:00 AM
        self.scheduler.add_job(
            self.generate_linkedin_content,
            CronTrigger(day_of_week='mon,wed,fri', hour=9, minute=0),
            id='linkedin_content',
            name='LinkedIn Content Generation',
            replace_existing=True
        )
        self.logger.info('Scheduled: LinkedIn content on Mon/Wed/Fri at 9:00 AM')

    def run(self):
        """Start the scheduler"""
        self.logger.info('=' * 60)
        self.logger.info('AI Employee Scheduler - Silver Tier')
        self.logger.info('=' * 60)
        self.logger.info(f'Started at: {datetime.now().isoformat()}')

        self.setup_jobs()

        self.logger.info('Scheduler running. Press Ctrl+C to stop.')
        self.logger.info('=' * 60)

        # Print scheduled jobs
        self.logger.info('Scheduled Jobs:')
        for job in self.scheduler.get_jobs():
            self.logger.info(f'  - {job.name}: {job.trigger}')

        try:
            self.scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            self.logger.info('Scheduler stopped')

if __name__ == '__main__':
    scheduler = AIEmployeeScheduler()
    scheduler.run()
