# DESIGN.md spec reference

Condensed from `github.com/google-labs-code/design.md` (status: **alpha**). A DESIGN.md = YAML front matter (tokens) + markdown body (rationale).

## Front matter — root keys (in this order)

```yaml
version: alpha          # optional
name: <string>          # REQUIRED
description: <string>   # optional
colors: { ... }         # color tokens
typography: { ... }     # typography tokens
rounded: { ... }        # border-radius scale
spacing: { ... }        # spacing scale
components: { ... }      # component token maps
```

## Token types

### colors
Map of name → any CSS color:
- Hex `#RGB` `#RGBA` `#RRGGBB` `#RRGGBBAA`
- Named `red`, `transparent`
- Functional `rgb()` `rgba()` `hsl()` `hsla()` `hwb()`
- Wide-gamut `oklch()` `oklab()` `lch()` `lab()`
- `color-mix(in srgb, ...)`

```yaml
colors:
  surface: "#0b1326"
  on-surface: "#dae2fd"
  primary: "#ffffff"
  on-primary: "#2f3131"
```

Use semantic role names where possible. The `on-*` convention = foreground meant to sit on the matching surface (Material-style). `*-container`, `surface-container-{low..highest}` express elevation tiers via color.

### typography
Map of name → object:

```yaml
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 84px
    fontWeight: "700"      # bare or quoted number
    lineHeight: 90px       # dimension OR unitless (1.6)
    letterSpacing: -0.04em
    fontFeature: "..."     # optional, font-feature-settings
    fontVariation: "..."   # optional, font-variation-settings
```

### rounded
Border-radius scale. Levels free-form; common: `none sm DEFAULT md lg xl full`.
```yaml
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  lg: 1rem
  full: 9999px
```

### spacing
Scale levels → dimension or unitless. Levels free-form: `xs sm md lg xl base unit gutter margin ...`.
```yaml
spacing:
  unit: 8px
  card-gap: 16px
  section-margin: 40px
```

### components
Map of component name → property map. Variants by suffix: `button-primary`, `button-primary-hover`, `button-primary-active`.

```yaml
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.xl}"
    height: 48px
    padding: 0 24px
```
Recognized properties: `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width` + custom props. Values can be literals or token refs.

## Token reference syntax
`{path.to.token}` — curly braces, dot path through the YAML tree.
- Most groups reference primitives: `{colors.primary}`, `{rounded.lg}`, `{spacing.unit}`.
- `components` may reference composite tokens: `typography: "{typography.label-md}"`.

## Dimensions
String + unit: `px`, `em`, `rem`. (lineHeight/spacing also accept unitless numbers.)

## Body sections (`##`, required order)

1. **Overview** (alias: Brand & Style) — what it is, who it's for, the feeling, the point of view.
2. **Colors** — palette strategy, roles, light/dark, contrast notes.
3. **Typography** — typeface choice + why, hierarchy, weight/legibility rules.
4. **Layout** (alias: Layout & Spacing) — grid unit, density, grouping, negative space.
5. **Elevation & Depth** — how layers separate (shadow / blur / border / color), the stack.
6. **Shapes** — radius language and what it signals.
7. **Components** — behavior of the core elements; states.
8. **Do's and Don'ts** — guardrails to keep future work on-brand.

Omit a section only if truly N/A. Prose explains *why* and *how to apply* — it does not just restate token values.

## CLI (if installed in target repo)
- `lint` — validates structure + WCAG contrast
- `diff` — token changes between versions
- `export` — Tailwind / DTCG / CSS
- `spec` — prints the format spec
Invoke via the repo's `npx design-md <cmd>` (or whatever the project wires up). Use `lint` to validate output.
