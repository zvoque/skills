# skills

[![CommitCrimes](https://commitcrimes.dev/badge/zvoque.svg)](https://commitcrimes.dev/u/zvoque)

> A growing collection of [Claude Code](https://docs.claude.com/en/docs/claude-code) skills, plus a small plugin for persistent persona modes.

## Contents

| Name | Type | What it does |
| --- | --- | --- |
| [`debate-team`](#debate-team) | Skill | Spin up distinct AI personas to debate a topic, then synthesize a verdict. |
| [`design-md`](#design-md) | Skill | Build a `DESIGN.md` design-token spec from a brief or an existing codebase. |
| [`modes/`](#modes--persistent-persona-plugin) | Plugin | Hook-driven persistent personas (ships `contrarian`). |

- [Standalone skills](#standalone-skills)
- [`modes/` — persistent persona plugin](#modes--persistent-persona-plugin)
- [Adding your own](#adding-your-own)
- [Attribution](#attribution)

## Standalone skills

Each is a directory with a `SKILL.md` (YAML frontmatter + instructions) and optional `references/`. Claude loads one on demand when its description matches the task. Self-contained — no hooks or scripts.

### `debate-team`

Spins up a roster of distinct AI personas that argue a topic via inter-agent messaging, then delivers a moderated synthesis. Auto-casts the panel from the topic — customers debating a product, engineers debating a stack, stakeholders arguing strategy, multi-angle devil's advocate.

- **Use for:** debate, stress-test, pressure-test, red-team, or roundtable on a decision, plan, or product.
- **Ships with:** `references/casting-library.md` — persona archetypes the roster is cast from.
- **Requires:** a Claude environment with multi-agent support (`TeamCreate` / `SendMessage`).

### `design-md`

Builds a `DESIGN.md` file — the [design.md spec](https://github.com/google-labs-code/design.md): YAML design tokens plus human-readable rationale that gives agents a persistent, structured understanding of a design system.

- **Brainstorm** — walk a greenfield project through brand / color / type / layout choices to full coverage.
- **Consolidate** — extract real tokens from an existing codebase's CSS / Tailwind / theme files.
- **Ships with:** `references/spec.md` (token schema + section rules) and `references/example.md` (worked reference).

### Install

```bash
# user-level (available in all projects)
cp -R debate-team ~/.claude/skills/

# or project-level
cp -R debate-team /path/to/project/.claude/skills/
```

Then invoke with `/<skill-name>`, or let Claude trigger it automatically from the skill's description.

## `modes/` — persistent persona plugin

A small, hook-driven plugin for personas that stay active on **every turn until you switch them off** — something a plain skill can't do, since a skill only applies to the turn it's invoked on.

Ships one mode today:

- **`contrarian`** — a sharp, skeptical advisor that pressure-tests every decision, plan, or claim instead of validating it. Names the load-bearing assumption, fires three concrete counterarguments, proposes a superior alternative, surfaces the blind-spot risk, and ends with a verdict: **Proceed / Reconsider / Stop**.

### Why it needs hooks (not just a skill)

`/contrarian` works as a one-shot skill on its own, but the **persistence** — re-asserting the persona on every prompt and honoring `stop contrarian` immediately — is driven by two hooks:

- `hooks/modes-tracker.js` (`UserPromptSubmit`) — detects on/off triggers, manages the `~/.claude/.modes-active` flag, and re-injects the persona each turn.
- `hooks/modes-activate.js` (`SessionStart`) — injects the persona up front on session start / resume / clear / compact when a mode is already active.

Hooks swallow all errors and exit 0 — they can never block a prompt or a session start.

### Install

```bash
cd modes
./install.sh      # copies hooks + skill to ~/.claude, registers the hooks in settings.json (idempotent, backed up)
./test.sh         # optional self-test in a sandbox HOME
./uninstall.sh    # clean removal
```

**Requires Node ≥ 18.** Then:

| Type this | Effect |
| --- | --- |
| `/contrarian` or `contrarian mode` | activate |
| `/contrarian off` or `stop contrarian` | deactivate contrarian |
| `normal mode` | deactivate whatever mode is active |

See [`modes/README.md`](modes/README.md) for the full mechanism and how to author new modes.

## Adding your own

- **A standalone skill:** create `<name>/SKILL.md` with `name` + `description` frontmatter, then `cp -R` it into a skills directory.
- **A persistent mode:** create `modes/skills/<name>/SKILL.md` with `mode: true` in its frontmatter and re-run `modes/install.sh`. Details in [`modes/README.md`](modes/README.md).

## Attribution

`design-md` implements the open [`google-labs-code/design.md`](https://github.com/google-labs-code/design.md) spec (alpha).
