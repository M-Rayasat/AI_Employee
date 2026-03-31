#!/usr/bin/env node

/**
 * Process Task Agent Skill
 * Processes tasks from Needs_Action folder following Company Handbook rules
 */

const fs = require('fs');
const path = require('path');

const VAULT_PATH = path.join(__dirname, '..', '..', '..', 'vault');
const NEEDS_ACTION = path.join(VAULT_PATH, 'Needs_Action');
const DONE = path.join(VAULT_PATH, 'Done');
const PLANS = path.join(VAULT_PATH, 'Plans');
const HANDBOOK = path.join(VAULT_PATH, 'Company_Handbook.md');
const DASHBOARD = path.join(VAULT_PATH, 'Dashboard.md');

async function main() {
  console.log('Process Task Skill activated');
  console.log('Reading Company Handbook...');

  // Read handbook
  if (!fs.existsSync(HANDBOOK)) {
    console.error('Company_Handbook.md not found!');
    process.exit(1);
  }

  const handbook = fs.readFileSync(HANDBOOK, 'utf-8');
  console.log('Handbook loaded');

  // Check for tasks
  console.log('Scanning Needs_Action folder...');

  if (!fs.existsSync(NEEDS_ACTION)) {
    console.log('Needs_Action folder not found, creating...');
    fs.mkdirSync(NEEDS_ACTION, { recursive: true });
  }

  const files = fs.readdirSync(NEEDS_ACTION).filter(f => {
    const fullPath = path.join(NEEDS_ACTION, f);
    return fs.statSync(fullPath).isFile();
  });

  if (files.length === 0) {
    console.log('No tasks found in Needs_Action folder');
    return;
  }

  console.log(`Found ${files.length} file(s) to process`);

  // Output prompt for Claude Code to process
  console.log('\n--- TASK FOR CLAUDE CODE ---\n');
  console.log('Please process the following tasks according to Company Handbook rules:\n');
  console.log(`Handbook location: ${HANDBOOK}`);
  console.log(`Tasks location: ${NEEDS_ACTION}`);
  console.log(`Plans folder: ${PLANS}`);
  console.log(`Done folder: ${DONE}`);
  console.log(`Dashboard: ${DASHBOARD}\n`);
  console.log('Files to process:');
  files.forEach((f, i) => {
    console.log(`${i + 1}. ${f}`);
  });
  console.log('\nInstructions:');
  console.log('1. Read each task file and its metadata');
  console.log('2. Create execution plan in Plans/ if task is complex');
  console.log('3. Process according to Company Handbook guidelines');
  console.log('4. If human approval needed, add "## Human Approval Required" section');
  console.log('5. When complete, move task to Done/ with completion summary');
  console.log('6. Update Dashboard.md with current statistics');
}

main().catch(console.error);
