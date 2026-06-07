# skills

A small collection of [Claude Code](https://docs.claude.com/en/docs/claude-code) skills.

Each skill is a directory with a `SKILL.md` (YAML frontmatter + instructions) and optional `references/`. Claude loads a skill on demand when its description matches the task.

## Skills

### `contrarian`
A sharp, skeptical advisor that challenges every decision you put in front of it — assumptions, trade-offs, blind spots. Persists across the conversation until disabled.

- Trigger: `/contrarian` or "contrarian mode"
- Stop: `/contrarian off`, "stop contrarian", or "normal mode"

### `debate-team`
Spins up a roster of distinct AI personas that argue a topic via inter-agent messaging, then delivers a moderated synthesis. Auto-casts the panel from the topic — customers debating a product, engineers debating a stack, stakeholders arguing strategy, multi-angle devil's advocate.

- Use for: debate, stress-test, pressure-test, red-team, or roundtable on a decision, plan, or product
- `references/casting-library.md` — persona archetypes the roster is cast from

### `design-md`
Builds a `DESIGN.md` file — the [design.md spec](https://github.com/google-labs-code/design.md): YAML design tokens plus human-readable rationale that gives agents a persistent, structured understanding of a design system. Two modes:

- **Brainstorm** — walk a greenfield project through brand/color/type/layout choices to full coverage
- **Consolidate** — extract real tokens from an existing codebase's CSS/Tailwind/theme files

`references/spec.md` (token schema + section rules) and `references/example.md` (worked reference) ship alongside.

## Install

Drop a skill directory into your Claude Code skills folder:

```bash
# user-level (all projects)
cp -R contrarian ~/.claude/skills/

# or project-level
cp -R contrarian /path/to/project/.claude/skills/
```

Then invoke with `/<skill-name>` or let Claude trigger it from the skill's description.

All three skills are self-contained — just `SKILL.md` and optional `references/`. No hooks, scripts, or `settings.json` changes to wire up.

## Notes

- **contrarian** persists across turns via its `mode: true` frontmatter flag and prompt instructions — no hook required. Disable it with `/contrarian off`.
- **debate-team** uses inter-agent messaging (`TeamCreate` / `SendMessage`), so it needs a Claude environment that supports spawning and coordinating multiple agents.

## Attribution

`design-md` implements the open [`google-labs-code/design.md`](https://github.com/google-labs-code/design.md) spec (alpha).
