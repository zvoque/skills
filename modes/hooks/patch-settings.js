#!/usr/bin/env node
'use strict';

// Non-destructively registers the modes hooks in ~/.claude/settings.json.
//   - Reads existing JSON (tolerates missing/empty file)
//   - Appends our entries only if not already present (idempotent / re-runnable)
//   - Backs up the original, writes atomically (tmp + rename)
//   - Asserts pre-existing hook commands (e.g. caveman) survive unchanged
//
// Run by install.sh. Exits non-zero on real failure so install can abort.

const fs = require('fs');
const os = require('os');
const path = require('path');

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const SETTINGS = path.join(CLAUDE_DIR, 'settings.json');
const HOOKS_DIR = path.join(CLAUDE_DIR, 'hooks');

const TRACKER = path.join(HOOKS_DIR, 'modes-tracker.js');
const ACTIVATE = path.join(HOOKS_DIR, 'modes-activate.js');

const cmd = (p) => `node "${p}"`;

function loadSettings() {
  if (!fs.existsSync(SETTINGS)) return {};
  const raw = fs.readFileSync(SETTINGS, 'utf8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(`✗ ${SETTINGS} is not valid JSON — aborting (no changes made).`);
    console.error(`  ${e.message}`);
    process.exit(1);
  }
}

// Count every hook command string currently in the file, so we can prove
// nothing existing was dropped after we write.
function commandInventory(settings) {
  const counts = {};
  const hooks = settings.hooks || {};
  for (const event of Object.keys(hooks)) {
    for (const group of hooks[event] || []) {
      for (const h of (group && group.hooks) || []) {
        if (h && typeof h.command === 'string') {
          counts[h.command] = (counts[h.command] || 0) + 1;
        }
      }
    }
  }
  return counts;
}

function eventHasCommandSubstr(settings, event, substr) {
  for (const group of (settings.hooks && settings.hooks[event]) || []) {
    for (const h of (group && group.hooks) || []) {
      if (h && typeof h.command === 'string' && h.command.includes(substr)) return true;
    }
  }
  return false;
}

function ensureEvent(settings, event) {
  settings.hooks = settings.hooks || {};
  if (!Array.isArray(settings.hooks[event])) settings.hooks[event] = [];
  return settings.hooks[event];
}

function main() {
  const settings = loadSettings();
  const before = commandInventory(settings);

  let added = 0;

  if (!eventHasCommandSubstr(settings, 'UserPromptSubmit', 'modes-tracker.js')) {
    ensureEvent(settings, 'UserPromptSubmit').push({
      hooks: [{ type: 'command', command: cmd(TRACKER), timeout: 10 }],
    });
    added++;
  }

  if (!eventHasCommandSubstr(settings, 'SessionStart', 'modes-activate.js')) {
    ensureEvent(settings, 'SessionStart').push({
      hooks: [{ type: 'command', command: cmd(ACTIVATE), timeout: 10 }],
    });
    added++;
  }

  // Safety assertion: every command that existed before must still exist after,
  // at least as many times (we only ever append).
  const after = commandInventory(settings);
  for (const c of Object.keys(before)) {
    if ((after[c] || 0) < before[c]) {
      console.error(`✗ refusing to write: existing hook "${c}" would be lost.`);
      process.exit(1);
    }
  }

  if (added === 0) {
    console.log('✓ settings.json already has both modes hooks — nothing to do.');
    return;
  }

  // Backup + atomic write.
  fs.mkdirSync(CLAUDE_DIR, { recursive: true });
  if (fs.existsSync(SETTINGS)) {
    fs.copyFileSync(SETTINGS, `${SETTINGS}.bak`);
  }
  const tmp = `${SETTINGS}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(settings, null, 2) + '\n');
  fs.renameSync(tmp, SETTINGS);

  const preserved = Object.keys(before).length;
  console.log(`✓ registered ${added} modes hook(s); preserved ${preserved} existing hook command(s).`);
  if (fs.existsSync(`${SETTINGS}.bak`)) console.log(`  backup: ${SETTINGS}.bak`);
}

main();
