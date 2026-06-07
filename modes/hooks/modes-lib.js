'use strict';

// Shared helpers for the "modes" plugin hooks.
// Single source of truth for: flag file location, mode-name validation,
// persona reading (frontmatter stripped), context emission, debug logging.
//
// Everything here is defensive: any failure degrades to "do nothing" so a
// broken install can never block prompt submission or session start.

const fs = require('fs');
const os = require('os');
const path = require('path');

const HOME = os.homedir();
const CLAUDE_DIR = path.join(HOME, '.claude');
const FLAG_FILE = path.join(CLAUDE_DIR, '.modes-active');
// Modes are flat, discoverable skills: ~/.claude/skills/<mode>/SKILL.md.
// Local skill discovery does NOT recurse into subdirectories, so modes must
// live directly under skills/ to appear in the slash menu.
const MODES_SKILLS_DIR = path.join(CLAUDE_DIR, 'skills');

// Mode names must be safe directory names — guards against path traversal
// when a malformed flag value is read back and used to build a file path.
const MODE_NAME_RE = /^[a-z0-9][a-z0-9-]*$/;
// A skill counts as a mode only if its frontmatter declares `mode: true`,
// so ordinary skills can never be hijacked into persistent personas.
const MODE_MARKER_RE = /^﻿?---\r?\n[\s\S]*?\bmode:\s*true\b[\s\S]*?\r?\n---/;

function debug(msg) {
  if (process.env.MODES_DEBUG !== '1') return;
  try {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(path.join(CLAUDE_DIR, '.modes-debug.log'), line);
  } catch (_) {
    /* never throw from a debug call */
  }
}

function isValidMode(mode) {
  return typeof mode === 'string' && MODE_NAME_RE.test(mode);
}

function skillFile(mode) {
  return path.join(MODES_SKILLS_DIR, mode, 'SKILL.md');
}

// True only if skills/<mode>/SKILL.md exists AND is marked `mode: true`.
function modeExists(mode) {
  if (!isValidMode(mode)) return false;
  try {
    const raw = fs.readFileSync(skillFile(mode), 'utf8');
    return MODE_MARKER_RE.test(raw);
  } catch (_) {
    return false;
  }
}

// Returns the currently active mode name, or null. Validates the value and
// confirms a real, marked mode skill backs it.
function getActiveMode() {
  try {
    const raw = fs.readFileSync(FLAG_FILE, 'utf8').trim();
    if (!isValidMode(raw)) {
      debug(`flag value invalid: ${JSON.stringify(raw)}`);
      return null;
    }
    if (!modeExists(raw)) {
      debug(`flag set to "${raw}" but no marked mode skill`);
      return null;
    }
    return raw;
  } catch (_) {
    return null; // no flag file => no active mode
  }
}

function setActiveMode(mode) {
  if (!isValidMode(mode)) return false;
  try {
    fs.mkdirSync(CLAUDE_DIR, { recursive: true });
    fs.writeFileSync(FLAG_FILE, mode + '\n');
    debug(`activated: ${mode}`);
    return true;
  } catch (e) {
    debug(`setActiveMode failed: ${e.message}`);
    return false;
  }
}

function clearActiveMode() {
  try {
    fs.unlinkSync(FLAG_FILE);
    debug('deactivated');
  } catch (_) {
    /* already gone */
  }
}

// Reads the persona body for a mode with YAML frontmatter stripped, so the
// hook injects only the instructions — not the skill metadata.
function readPersona(mode) {
  if (!isValidMode(mode)) return null;
  try {
    let body = fs.readFileSync(skillFile(mode), 'utf8');
    // Strip a leading `---\n ... \n---` frontmatter block if present.
    body = body.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
    return body.trim();
  } catch (e) {
    debug(`readPersona(${mode}) failed: ${e.message}`);
    return null;
  }
}

// Emits the documented hook output envelope so Claude Code injects the text
// as context. Raw stdout is NOT parsed for context — this JSON shape is.
function emitContext(eventName, text) {
  if (!text) return;
  const payload = {
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext: text,
    },
  };
  process.stdout.write(JSON.stringify(payload));
}

module.exports = {
  HOME,
  CLAUDE_DIR,
  FLAG_FILE,
  MODES_SKILLS_DIR,
  debug,
  isValidMode,
  getActiveMode,
  setActiveMode,
  clearActiveMode,
  modeExists,
  readPersona,
  emitContext,
};
