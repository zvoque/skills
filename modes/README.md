# modes

A small [Claude Code](https://docs.claude.com/en/docs/claude-code) plugin for **persistent persona modes** — personas that stay active on *every* turn until you switch them off.

A normal skill only applies to the turn it's invoked on; the next message, Claude is back to default. `modes` fixes that with two hooks that re-assert the active persona on every prompt, so a mode like `contrarian` keeps challenging you for the whole conversation until you say `stop contrarian`.

Ships one mode today:

- **`contrarian`** — a sharp, skeptical advisor that pressure-tests every decision, plan, or claim instead of validating it. Names the load-bearing assumption, fires three concrete counterarguments, proposes a superior alternative, surfaces the blind-spot risk, and ends with a verdict: **Proceed / Reconsider / Stop**. (It steps aside for genuinely destructive or clarifying requests.)

## Requirements

- Claude Code
- Node ≥ 18 (the hooks are Node scripts)

## Install

From this directory:

```bash
./install.sh      # copies the hooks + mode skill into ~/.claude, registers the hooks in settings.json
./test.sh         # optional: full self-test in a throwaway sandbox HOME (touches nothing real)
./uninstall.sh    # clean removal
```

`install.sh` is **idempotent and non-destructive** — safe to re-run. It:

- copies `hooks/*.js` → `~/.claude/hooks/`
- copies each `skills/<mode>/` → `~/.claude/skills/<mode>/` (so `/<mode>` also shows up in the slash menu)
- appends two entries to `~/.claude/settings.json` (a `UserPromptSubmit` hook and a `SessionStart` hook), backing the file up to `settings.json.bak` first and aborting if any existing hook would be lost

Start a new session, or just send your next prompt — the `UserPromptSubmit` hook is live immediately.

## Usage

| Type this | Effect |
|---|---|
| `/contrarian` or `contrarian mode` | activate — persona applies from this turn on |
| `/contrarian off` or `stop contrarian` | deactivate contrarian |
| `normal mode` | deactivate whatever mode is active |

Triggers are case-insensitive. Deactivation is checked before activation, so `stop contrarian` never reads as "start". Natural-language triggers (`contrarian mode`, `stop contrarian`) only fire for a mode that actually exists, so ordinary phrases like "in CSS, normal mode means…" won't trip it — except `normal mode`, which is treated as a global off when it's the whole message.

## How it works

- **`hooks/modes-tracker.js`** — a `UserPromptSubmit` hook that runs on every prompt. It detects on/off triggers, manages the active-mode flag at `~/.claude/.modes-active`, and while a mode is active re-injects the persona each turn via the hook's `hookSpecificOutput.additionalContext` output. Re-injecting every turn is what makes the persona persist; on "off" it stops re-asserting and injects a one-time override telling Claude to drop the persona.
- **`hooks/modes-activate.js`** — a `SessionStart` hook that injects the persona up front on session start / resume / clear / compact when a mode is already active, so it's in context before your first prompt.
- **`hooks/modes-lib.js`** — shared core: flag I/O, mode-name validation (path-traversal guard), persona reading (YAML frontmatter stripped before injection).
- **`hooks/patch-settings.js`** — the idempotent, atomic settings.json patcher run by `install.sh`.
- **`skills/<mode>/SKILL.md`** — the single source of truth for each persona. Because it's a real skill, `/<mode>` also works as a one-shot native invocation; the hooks read the same file for persistence.

Every hook swallows all errors and exits 0 — it can never block a prompt or a session start. Set `MODES_DEBUG=1` in your environment to log hook decisions to `~/.claude/.modes-debug.log`.

## Adding your own mode

1. Create `skills/<name>/SKILL.md`. The frontmatter **must** include `mode: true` — that marker is what tells the hooks this skill is a persistent mode (without it, the skill still works as a one-shot, but won't persist):

   ```markdown
   ---
   name: <name>
   description: <when Claude should offer this skill>
   mode: true
   ---

   <persona instructions — written as if addressed to Claude>
   ```

2. Re-run `./install.sh`. No hook changes needed — the tracker dispatches any mode name dynamically.
3. Activate with `/<name>` or `<name> mode`; turn off with `stop <name>`.

Mode names must be lowercase, start with a letter or digit, and use only `a–z`, `0–9`, and `-`.

## Coexistence with the caveman plugin

If you also run the caveman plugin (the persona-mode plugin this one is modeled on), the two are independent and additive: `modes` uses the flag `~/.claude/.modes-active`, caveman uses `~/.claude/.caveman-active`, and neither touches the other. Both emit `SessionStart` context, so both rulesets stack when both are on. The settings patch only ever *appends* hook entries (and aborts rather than overwrite an existing one), so installing `modes` won't disturb caveman or any other hook you've registered. caveman is not required.

## Caveat

Whether an unregistered slash command's raw text reaches the `UserPromptSubmit` hook is undocumented in Claude Code. It doesn't matter here: `/contrarian` is a real skill (so it loads natively even if the hook never sees the text), and the natural-language triggers always pass through. If you add a mode whose name collides with a built-in slash command, prefer the natural-language trigger (`<name> mode`).
