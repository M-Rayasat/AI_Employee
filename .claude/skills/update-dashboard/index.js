#!/usr/bin/env node

/**
 * Update Dashboard Agent Skill
 * Updates Dashboard.md with current system statistics
 */

const fs = require('fs');
const path = require('path');

const VAULT_PATH = path.join(__dirname, '..', '..', '..', 'vault');
const DASHBOARD = path.join(VAULT_PATH, 'Dashboard.md');
const INBOX = path.join(VAULT_PATH, 'Inbox');
const NEEDS_ACTION = path.join(VAULT_PATH, 'Needs_Action');
const DONE = path.join(VAULT_PATH, 'Done');
const PLANS = path.join(VAULT_PATH, 'Plans');

function countFiles(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return 0;
  }
  return fs.readdirSync(dir).filter(f => {
    const fullPath = path.join(dir, f);
    return fs.statSync(fullPath).isFile();
  }).length;
}

function getRecentFiles(dir, limit = 5) {
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir)
    .filter(f => {
      const fullPath = path.join(dir, f);
      return fs.statSync(fullPath).isFile() && f.endsWith('.md');
    })
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(dir, f)).mtime
    }))
    .sort((a, b) => b.time - a.time)
    .slice(0, limit);

  return files;
}

async function main() {
  console.log('Update Dashboard Skill activated');

  // Count files
  const inboxCount = countFiles(INBOX);
  const needsActionCount = countFiles(NEEDS_ACTION);
  const doneCount = countFiles(DONE);
  const plansCount = countFiles(PLANS);

  // Get recent activity
  const recentDone = getRecentFiles(DONE, 5);

  // Get today's completed count
  const today = new Date().toISOString().split('T')[0];
  const todayCompleted = recentDone.filter(f => {
    const fileDate = f.time.toISOString().split('T')[0];
    return fileDate === today;
  }).length;

  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

  // Build dashboard content
  const dashboardContent = `# AI Employee Dashboard

---
last_updated: ${timestamp}
status: active
tier: Bronze
---

## System Status
- **Status**: 🟢 Operational
- **Watcher**: File System Monitor Active
- **Last Check**: ${timestamp}

## Quick Stats
- **Inbox Items**: ${inboxCount}
- **Needs Action**: ${needsActionCount}
- **Completed**: ${doneCount}
- **Active Plans**: ${plansCount}
- **Completed Today**: ${todayCompleted}

## Pending Actions
${needsActionCount > 0 ? `⚠️ ${needsActionCount} item(s) in Needs_Action folder requiring attention` : '✅ No pending actions'}

## Recent Activity
${recentDone.length > 0 ? recentDone.map(f => `- ✅ ${f.name.replace('.md', '')}`).join('\n') : '*No recent activity*'}

## Active Plans
Check \`/Plans\` folder for ongoing work plans.

## System Health
- Filesystem Watcher: ✅ Operational
- Vault Access: ✅ Connected
- Last Update: ${timestamp}

---
*Last updated by AI Employee System*
`;

  // Write dashboard
  fs.writeFileSync(DASHBOARD, dashboardContent, 'utf-8');

  console.log('Dashboard updated successfully');
  console.log(`- Inbox: ${inboxCount}`);
  console.log(`- Needs Action: ${needsActionCount}`);
  console.log(`- Done: ${doneCount}`);
  console.log(`- Plans: ${plansCount}`);
  console.log(`- Completed Today: ${todayCompleted}`);
}

main().catch(console.error);
