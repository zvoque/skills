#!/usr/bin/env bash
# Installer for the "modes" Claude Code plugin.
# Safe to re-run. Non-destructive to existing ~/.claude/settings.json hooks
# (including caveman's). Copies files, then patches settings.json via Node.

set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${HOME}/.claude"
HOOKS_DIR="${CLAUDE_DIR}/hooks"
SKILLS_DIR="${CLAUDE_DIR}/skills"

# --- Requirements ---------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "✗ node not found. Node >= 18 is required." >&2
  exit 1
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "${NODE_MAJOR}" -lt 18 ]; then
  echo "✗ Node >= 18 required (found $(node -v))." >&2
  exit 1
fi

# --- Copy hook scripts ----------------------------------------------------
mkdir -p "${HOOKS_DIR}"
cp "${SRC}/hooks/modes-lib.js"      "${HOOKS_DIR}/modes-lib.js"
cp "${SRC}/hooks/modes-tracker.js"  "${HOOKS_DIR}/modes-tracker.js"
cp "${SRC}/hooks/modes-activate.js" "${HOOKS_DIR}/modes-activate.js"
chmod +x "${HOOKS_DIR}/modes-tracker.js" "${HOOKS_DIR}/modes-activate.js"
echo "✓ installed hooks -> ${HOOKS_DIR}"

# --- Copy mode skills flat (discoverable in the / menu; add modes by
#     dropping new skills/<name>/ dirs marked `mode: true`) ----------------
mkdir -p "${SKILLS_DIR}"
for d in "${SRC}"/skills/*/; do
  name="$(basename "${d}")"
  mkdir -p "${SKILLS_DIR}/${name}"
  cp -R "${d}." "${SKILLS_DIR}/${name}/"
  echo "✓ installed mode -> ${SKILLS_DIR}/${name}"
done

# --- Patch settings.json (idempotent, atomic, preserves existing hooks) ---
node "${SRC}/hooks/patch-settings.js"

echo
echo "Done. Start a new Claude Code session (or it works on next prompt)."
echo "Try:  /contrarian    then later:  stop contrarian"
echo "Debug: set MODES_DEBUG=1 to log to ${CLAUDE_DIR}/.modes-debug.log"
