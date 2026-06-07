#!/usr/bin/env node
'use strict';

// SessionStart hook.
// Belt-and-suspenders: when a session starts/resumes/clears/compacts with a
// mode already active, inject the persona once up front so it's in context
// before the first prompt (the tracker then re-asserts it each turn).
//
// Never blocks session start.

const m = require('./modes-lib');

function drainStdin() {
  // SessionStart provides a JSON payload on stdin; we don't need its fields,
  // but we drain it so the process doesn't hang waiting on the pipe.
  return new Promise((resolve) => {
    process.stdin.on('data', () => {});
    process.stdin.on('end', resolve);
    process.stdin.on('error', resolve);
    // If nothing is piped, resolve on next tick.
    setImmediate(resolve);
  });
}

async function main() {
  await drainStdin();
  const active = m.getActiveMode();
  if (!active) return;
  const persona = m.readPersona(active);
  if (persona) m.emitContext('SessionStart', persona);
}

main()
  .catch((e) => m.debug(`activate fatal: ${e && e.message}`))
  .finally(() => process.exit(0));
