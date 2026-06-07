# Worked example — a complete DESIGN.md

From the design.md repo (`examples/atmospheric-glass`). Study the *shape*: dense semantic token table, then prose that explains the reasoning and gives application rules. Don't copy this aesthetic — copy this level of specificity and opinion.

```markdown
---
name: Atmospheric Glass
colors:
  surface: "#0b1326"
  surface-container-low: "#131b2e"
  surface-container: "#171f33"
  surface-container-high: "#222a3d"
  on-surface: "#dae2fd"
  on-surface-variant: "#c4c7c8"
  outline: "#8e9192"
  primary: "#ffffff"
  on-primary: "#2f3131"
  primary-container: "#e2e2e2"
  primary-fixed-dim: "#c6c6c7"
  secondary: "#adc9eb"
  on-secondary: "#14324e"
  error: "#ffb4ab"
  on-error: "#690005"
  background: "#0b1326"
  on-background: "#dae2fd"
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 84px
    fontWeight: "700"
    lineHeight: 90px
    letterSpacing: -0.04em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "500"
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  card-gap: 16px
  section-margin: 40px
  glass-padding: 20px
components:
  glass-card-standard:
    backgroundColor: rgba(255, 255, 255, 0.1)
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.glass-padding}"
  glass-card-elevated:
    backgroundColor: rgba(255, 255, 255, 0.2)
    textColor: "{colors.primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.glass-padding}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.xl}"
    height: 48px
    padding: 0 24px
  button-primary-hover:
    backgroundColor: "{colors.primary-fixed-dim}"
  input-field:
    backgroundColor: rgba(255, 255, 255, 0.1)
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 20px
    height: 48px
  list-item-interactive:
    backgroundColor: transparent
    rounded: "{rounded.md}"
    padding: 12px
  list-item-interactive-hover:
    backgroundColor: rgba(255, 255, 255, 0.1)
---

## Brand & Style

This design system centers on a high-fidelity Glassmorphism aesthetic designed to
evoke clarity, depth, and modern sophistication. The brand personality is ethereal
yet functional. The UI relies on a "vibrant-minimalist" approach: the background
provides the energy through multi-colored abstract gradients, while interface elements
act as frosted crystalline lenses that focus attention.

## Colors

The color strategy prioritizes luminosity and contrast. Because the background is a
vibrant composition, the UI components use a monochromatic white palette with varying
alpha channels to maintain legibility.

- **Surface Alpha:** Component backgrounds are never solid — `rgba(255,255,255,0.1)`
  for secondary depth, `0.2` for primary interaction.
- **Text:** Strictly white (#FFFFFF) or high-tint silver to ensure WCAG compliance.

## Typography

**Inter** for its neutral, geometric clarity. Large display sizes anchor temperature
readings. On frosted glass, weight is bumped one tier to counteract background blur.

## Layout & Spacing

8px base grid. Related metrics housed in grids with 16px gaps. Generous 24px+ outer
margins keep the vibrant background visible, reinforcing the "floating" interface.

## Elevation & Depth

Depth comes from light and refraction, not darkness.
- **Level 2 (Standard Card):** `backdrop-filter: blur(20px)`, `rgba(255,255,255,0.1)`.
- **Level 3 (Elevated):** `blur(40px)`, `rgba(255,255,255,0.2)`.
- Every glass surface gets a 1px `rgba(255,255,255,0.2)` border to simulate refraction.
- Soft, spread shadows (`0 8px 32px rgba(0,0,0,0.1)`) separate layers without weight.

## Shapes

Organic and approachable. `1rem` for standard cards; `rounded-xl` for buttons and
search bars. Icons are line-based with rounded caps to match border weights.

## Components

Standard cards use 20px blur; elevated cards use 40px blur + higher opacity. Buttons
use `rounded-xl`; primary is solid white for contrast, ghost buttons use backdrop
filters. Inputs and list items use subtle hover blurs, never solid color changes.

## Do's and Don'ts

- **Do** keep every glass surface translucent with a 1px light-refraction border.
- **Do** bump font weight one tier on glass for legibility.
- **Don't** use solid component fills — it breaks the crystalline metaphor.
- **Don't** use heavy/dark shadows — depth comes from blur and light, not darkness.
```

Notice: the prose never just lists the hex codes — it explains *the rule* (alpha never solid, weight bumped one tier, depth via light not darkness). That's what makes the file useful to a future agent.
