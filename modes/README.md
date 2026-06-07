# modes

A mode-switching plugin for Claude Code. Type `/contrarian` to flip Claude into
a persistent persona; type `stop contrarian` to flip it back. Modeled on the
caveman plugin architecture and designed to coexist with it.

## Install

```bash
./install.sh      # copies files to ~/.claude, patches settings.json
./test.sh         # optional: runs the full self-test in a sandbox HOME
./uninstall.sh    # clean removal, leaves caveman untouched
```

Requires Node ≥ 18. Safe to re-run.

## Usage

| Do this | Effect |
|---|---|
| `/contrarian` or `contrarian mode` | activate; persona loads immediately |
| `/contrarian off` / `stop contrarian` | deactivate this mode |
| `normal mode` | deactivate all modes |

## How it works

- **`hooks/modes-tracker.js`** (`UserPromptSubmit`, runs every prompt) detects
  on/off triggers, manages the `~/.claude/.modes-active` flag, and — while a
  mode is active — re-injects the persona **every turn** via the documented
  `hookSpecificOutput.additionalContext` JSON envelope. Per-turn injection is
  what makes the mode persist and what makes "off" take effect immediately.
- **`hooks/modes-activate.js`** (`SessionStart`) injects the persona up front on
  startup/resume/clear/compact when a mode is already active.
- **`hooks/modes-lib.js`** is the shared core: flag I/O, mode-name validation
  (path-traversal guard), persona reading (frontmatter stripped), debug log.
- **`skills/modes/<mode>/SKILL.md`** is the single source of truth for a
  persona. Because it's a real skill, `/<mode>` also works as a native skill
  invocation; the hooks read the same file for persistence.

Every hook swallows all errors and exits 0 — it can never block a prompt or a
session start. Set `MODES_DEBUG=1` to log decisions to `~/.claude/.modes-debug.log`.

## Adding a mode

Drop a new `skills/modes/<name>/SKILL.md` and re-run `./install.sh`. No hook
changes — the tracker dispatches any mode name dynamically. Invoke with
`/<name>`, turn off with `stop <name>`.

## Coexistence with caveman

Independent and additive. Modes uses `~/.claude/.modes-active`; caveman uses
`~/.claude/.caveman-active` — neither touches the other. Both emit SessionStart
context, so both rulesets stack when both are on. The settings patch only ever
*appends* hook entries and aborts if any existing entry would be lost.

## Known caveat — verify locally

Whether an unregistered slash command's text reaches `UserPromptSubmit` is
undocumented. It doesn't matter here: `/contrarian` is a real skill (so it loads
natively even if the hook never sees the text), and natural-language triggers
("contrarian mode", "stop contrarian") always pass through. If you add a mode
whose name collides with a built-in command, prefer the natural-language trigger.
