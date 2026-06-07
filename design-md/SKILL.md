---
name: design-md
description: >-
  Build a DESIGN.md file — the design.md spec (github.com/google-labs-code/design.md):
  YAML design tokens + human-readable rationale that gives agents a persistent, structured
  understanding of a design system. Use this whenever the user wants to create, scaffold,
  generate, write, or consolidate a DESIGN.md / design system doc / design token file /
  brand spec / style guide for a repo — in TWO modes: (A) BRAINSTORM from a blank or
  greenfield project, walking the user through brand/color/type/layout choices until full
  brand coverage; or (B) CONSOLIDATE an existing codebase, extracting real style tokens from
  CSS/Tailwind/theme files into the spec. Trigger even if the user just says "make a
  design.md", "document our design system", "extract our design tokens", "I want a brand
  spec for this repo", or "set up DESIGN.md".
---

# Build a DESIGN.md

DESIGN.md is a portable design-system format (spec: `github.com/google-labs-code/design.md`).
One file, two layers:

1. **YAML front matter** — machine-readable tokens (colors, typography, spacing, rounded, components). Exact values an agent can apply directly.
2. **Markdown body** — human-readable rationale. The *why* behind the tokens and how to apply them.

The point is durability: any agent (or person) opening the repo later gets a precise, opinionated picture of the visual system instead of guessing from scattered CSS. Tokens give the numbers; prose gives the judgment.

Read `references/spec.md` for the exact token schema and section rules **before writing the file** — the front matter has to validate and the eight sections have a required order. Keep `references/example.md` open as a worked reference.

## Step 0 — Pick the mode

Two ways in. Detect which from context; if genuinely unclear, ask one short question.

- **Mode A — Brainstorm (blank / greenfield).** Repo has no real styling yet, or the user wants to *invent* a brand from scratch. You're eliciting design intent, not reading it off the code.
- **Mode B — Consolidate (existing repo).** Repo already has CSS, Tailwind config, theme files, component styles. You're *extracting* what's already there into the spec, then filling the gaps.

A repo can be mixed — some tokens exist, brand story doesn't. Start in B to harvest what's real, then switch to A's questioning for whatever's missing. Don't invent a color that contradicts the code, and don't leave a section empty because the code was silent — ask.

---

## Mode A — Brainstorm from blank

The danger here is generic, default-y output: a blue primary, Inter, 8px grid, three rounded levels — the exact "AI design" the user is trying to escape. Avoid it by making the user *choose*, and by pushing for a real point of view.

**Use the `superpowers:brainstorming` skill to run the questioning.** That skill is built for exactly this — one question at a time, building on answers, surfacing intent the user hasn't articulated. Invoke it and drive the conversation through full brand coverage. Don't dump a 20-question form; go a few at a time and react to what they say.

Cover every section the spec defines — the file is incomplete if any of these is hand-waved:

- **Brand & personality** — What is this product, who's it for, what should it *feel* like in three adjectives? What existing products/sites does the user admire or want to avoid? This anchors everything else.
- **Color** — Mood and palette. Light/dark/both. A real accent, not a safe one. Push for semantic roles (surface, on-surface, primary, container tiers) not just "blue and gray." Verify text/background pairs will pass WCAG AA.
- **Typography** — Typeface(s) and *why*. Display vs body strategy, weight rules, the type scale. One opinionated choice beats two safe ones.
- **Layout & spacing** — Base grid unit, density (airy vs compact), how things group.
- **Elevation & depth** — How layers separate: shadow, blur, borders, color. This is where a system gets a signature — interrogate it.
- **Shapes** — Radius language. Sharp, soft, mixed. What it signals.
- **Components** — The handful of elements that define the look (buttons, cards, inputs, whatever's core). Capture their token values.
- **Do's and Don'ts** — The guardrails that keep future work on-brand. Pull these straight from the choices made above.

As answers land, translate them into tokens. When coverage is full, write the file.

> Per the user's standing preference, steer away from default "AI" design — no reflexive three-column hero, no generic SaaS gradient — unless the user explicitly wants it. Brainstorm toward a distinct point of view.

---

## Mode B — Consolidate from existing repo

Goal: ground the spec in what the code *actually does*, then narrate it.

### 1. Harvest tokens from the source

Search the repo for where style lives. Common sources, in rough priority:

- **CSS custom properties** — `grep -rn "\-\-[a-z].*:" --include=*.css` for `:root` / theme blocks. These are usually the real token table.
- **Tailwind config** — `tailwind.config.{js,ts}` → `theme` / `theme.extend` (colors, fontFamily, fontSize, borderRadius, spacing).
- **Theme / token files** — `theme.ts`, `tokens.json`, `design-tokens.*`, styled-components/emotion themes, Chakra/MUI theme objects, `*.css` design files.
- **Component styles** — recurring values in component CSS/JSX (button bg, card radius, input height) → these become the `components:` map.
- **Fonts** — `@font-face`, `next/font`, font imports, `font-family` declarations.

Collect raw values; note where each came from. Prefer the canonical source when values disagree, and flag the conflict to the user rather than silently picking one.

### 2. Normalize into the schema

Map harvested values onto the spec's token groups (`colors`, `typography`, `rounded`, `spacing`, `components`). Use semantic names where the source implies roles; use `{path.to.token}` references inside `components` so the file stays DRY. Convert units consistently. See `references/spec.md`.

### 3. Fill the gaps with questioning

Code carries values, not rationale. It rarely tells you *why* the accent is that orange or what "elevated" means. For every empty or thin section — especially **Brand & Style**, **Elevation**, **Do's and Don'ts** — switch to Mode A's questioning (the `superpowers:brainstorming` skill) and ask. A consolidated file with empty prose sections has failed at its main job: explaining the system.

### 4. Write the file

---

## Writing the file

Output path: `DESIGN.md` at repo root unless the user says otherwise.

1. **Front matter first.** Valid YAML between `---` fences. `name` required. Order groups: `version` (optional, `alpha`), `name`, `description`, `colors`, `typography`, `rounded`, `spacing`, `components`. Use `{path.to.token}` refs in `components`.
2. **Then the body.** The eight `##` sections, in this exact order, omitting only ones truly N/A:
   1. Overview (a.k.a. Brand & Style)
   2. Colors
   3. Typography
   4. Layout (a.k.a. Layout & Spacing)
   5. Elevation & Depth
   6. Shapes
   7. Components
   8. Do's and Don'ts
3. **Prose earns its place.** Each section explains the *why* and gives application guidance — not a restatement of the token values. Write like the example in `references/example.md`: specific, opinionated, usable by a future agent.

## Validate before declaring done

- YAML parses; required `name` present; token references resolve to real paths.
- Sections present and in spec order.
- Color pairs meant for text/background meet WCAG AA contrast.
- Body matches the tokens — no prose describing a blue primary while the token says orange.

If the repo has the design.md CLI available (`npx design-md lint` or similar), run it and fix what it flags. Don't claim the file is valid without checking.
