#!/usr/bin/env node
'use strict';

// UserPromptSubmit hook.
// Runs on EVERY prompt. Responsibilities:
//   1. Detect activation triggers   -> set the flag
//   2. Detect deactivation triggers -> clear the flag + inject an OFF override
//   3. While a mode is active        -> re-inject the persona every turn
//
// Re-injecting each turn is what makes the mode actually persist (and what
// makes deactivation take effect immediately — we simply stop re-asserting).
//
// Never blocks the prompt: all errors are swallowed and we exit 0.

const m = require('./modes-lib');

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(''));
  });
}

// Returns { action: 'off', mode } | { action: 'on', mode } | null
function parseIntent(prompt) {
  const text = String(prompt || '');
  const norm = text.trim().toLowerCase();
  if (!norm) return null;

  // --- Deactivation (checked first so "stop X" never reads as activation) ---

  // "normal mode" — global off. Require it to be the whole prompt (or nearly)
  // so we don't fire on "in CSS, normal mode means..." style questions.
  if (norm === 'normal mode' || norm === '/normal' || norm === 'normal') {
    return { action: 'off', mode: null };
  }

  // "/contrarian off"
  let mt = norm.match(/^\/([a-z0-9][a-z0-9-]*)\s+off\b/);
  if (mt) return { action: 'off', mode: mt[1] };

  // "stop contrarian" / "stop contrarian mode"
  mt = norm.match(/\bstop\s+([a-z0-9][a-z0-9-]*)(?:\s+mode)?\b/);
  if (mt) return { action: 'off', mode: mt[1] };

  // --- Activation ---

  // "/contrarian" at the start of the message.
  mt = norm.match(/^\/([a-z0-9][a-z0-9-]*)\b/);
  if (mt && m.modeExists(mt[1])) return { action: 'on', mode: mt[1] };

  // Natural language "contrarian mode" — only if that mode really exists,
  // which keeps generic "X mode" phrasing from triggering anything.
  mt = norm.match(/\b([a-z0-9][a-z0-9-]*)\s+mode\b/);
  if (mt && m.modeExists(mt[1])) return { action: 'on', mode: mt[1] };

  return null;
}

async function main() {
  let input = {};
  try {
    input = JSON.parse(await readStdin()) || {};
  } catch (_) {
    input = {};
  }

  const intent = parseIntent(input.prompt);

  if (intent && intent.action === 'off') {
    const wasActive = m.getActiveMode();
    // Global off, or off matching the active mode.
    if (!intent.mode || intent.mode === wasActive) {
      m.clearActiveMode();
      if (wasActive) {
        m.emitContext(
          'UserPromptSubmit',
          `${wasActive} mode is now OFF. Disregard the ${wasActive} persona for ` +
            `the rest of this conversation and resume your normal behavior.`
        );
      }
      return;
    }
    // "stop foo" while "bar" is active — ignore, leave bar running.
  }

  if (intent && intent.action === 'on') {
    m.setActiveMode(intent.mode);
  }

  const active = m.getActiveMode();
  if (active) {
    const persona = m.readPersona(active);
    if (persona) m.emitContext('UserPromptSubmit', persona);
  }
}

main()
  .catch((e) => m.debug(`tracker fatal: ${e && e.message}`))
  .finally(() => process.exit(0));
