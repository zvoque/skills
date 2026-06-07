# skills

A growing collection of [Claude Code](https://docs.claude.com/en/docs/claude-code) skills, plus a small plugin for persistent persona modes.

## Standalone skills

Each is a directory with a `SKILL.md` (YAML frontmatter + instructions) and optional `references/`. Claude loads one on demand when its description matches the task. Self-contained — no hooks or scripts.

### `debate-team`
Spins up a roster of distinct AI personas that argue a topic via inter-agent messaging, then delivers a moderated synthesis. Auto-casts the panel from the topic — customers debating a product, engineers debating a stack, stakeholders arguing strategy, multi-angle devil's advocate.

- Use for: debate, stress-test, pressure-test, red-team, or roundtable on a decision, plan, or product
- `references/casting-library.md` — persona archetypes the roster is cast from
- Requires a Claude environment with multi-agent support (`TeamCreate` / `SendMessage`)

### `design-md`
Builds a `DESIGN.md` file — the [design.md spec](https://github.com/google-labs-code/design.md): YAML design tokens plus human-readable rationale that gives agents a persistent, structured understanding of a design system. Two modes:

- **Brainstorm** — walk a greenfield project through brand/color/type/layout choices to full coverage
- **Consolidate** — extract real tokens from an existing codebase's CSS/Tailwind/theme files

`references/spec.md` (token schema + section rules) and `references/example.md` (worked reference) ship alongside.

### Installing a standalone skill

```bash
cp -R debate-team ~/.claude/skills/        # user-level (all projects)
cp -R debate-team /path/to/project/.claude/skills/   # or project-level
```

Then invoke with `/<skill-name>` or let Claude trigger it from the skill's description.

## `modes/` — persistent persona plugin

A small, hook-driven plugin (modeled on the caveman plugin) for personas that stay active **every turn until you switch them off** — something a plain skill can't do, because a skill only loads for the turn it's invoked.

Ships one mode today:

- **`contrarian`** — a sharp, skeptical advisor that pressure-tests every decision, plan, or claim instead of validating it. Names the load-bearing assumption, fires three concrete counterarguments, proposes a superior alternative, surfaces the blind-spot risk, and ends with a verdict: **Proceed / Reconsider / Stop**.

### Why it needs hooks (not just a skill)

`/contrarian` works as a one-shot skill on its own, but the **persistence** — re-asserting the persona on every prompt and honoring `stop contrarian` immediately — is driven by two hooks:

- `hooks/modes-tracker.js` (`UserPromptSubmit`) — detects on/off triggers, manages the `~/.claude/.modes-active` flag, and re-injects the persona each turn.
- `hooks/modes-activate.js` (`SessionStart`) — injects the persona up front on session start/resume/clear/compact when a mode is already active.

Hooks swallow all errors and exit 0 — they can never block a prompt or session start. Co-exists with the caveman plugin (separate flag files, settings patch only appends).

### Install

```bash
cd modes
./install.sh      # copies hooks + skill to ~/.claude, patches settings.json (idempotent)
./test.sh         # optional self-test in a sandbox HOME
./uninstall.sh    # clean removal
```

Requires Node ≥ 18. Then: `/contrarian` (or "contrarian mode") to activate, `stop contrarian` / `normal mode` to turn off. See [`modes/README.md`](modes/README.md) for details and how to add new modes.

## Attribution

`design-md` implements the open [`google-labs-code/design.md`](https://github.com/google-labs-code/design.md) spec (alpha).
