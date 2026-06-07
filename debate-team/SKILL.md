---
name: debate-team
description: Spin up a team of distinct AI personas that argue a topic via native inter-agent messaging, then deliver a moderated synthesis. Use when the user wants to debate, stress-test, pressure-test, red-team, or get a roundtable/panel on a decision, idea, plan, or product — e.g. "have customers debate this product", "engineers debate this stack/architecture", "stakeholders argue this strategy", "play devil's advocate from multiple angles", "run a panel on X". Auto-casts the roster from the topic; works for any domain.
---

# Debate Team

Convene a team of independent AI agents — each a distinct persona with its own incentives, worldview, risk tolerance, and voice — and have them genuinely argue a topic using native agent-to-agent messaging. You act as **moderator**: you cast the panel, run the rounds, keep it honest, and finish with a synthesis.

**Core principle: real disagreement, not theater.** Personas must have structurally opposed interests, not cosmetic differences. A debate where everyone converges politely is a failure. Cast for friction, reward the strongest version of each side, and never let a persona strawman another.

---

## 0. When this runs

Trigger on any request to debate / argue / stress-test / pressure-test / red-team / "have X and Y discuss" / panel / roundtable / "poke holes" / "what would a skeptic say" applied to a topic, decision, product, plan, or stack choice.

If the topic is a single sentence and ambiguous about **what's being decided**, ask one tight clarifying question before casting (e.g. "Debate _which_ — whether to build it at all, or which of two options?"). Otherwise proceed; do not over-interrogate.

---

## 1. Frame the debate

Determine before casting:

- **Debate type** — pick the closest:
  - *Decision* ("React vs Svelte", "build vs buy") → personas hold rival options.
  - *Evaluation* ("is this product any good", "critique this pitch") → personas are different consumers/stakeholders reacting.
  - *Adversarial / red-team* ("find the holes in this plan") → personas attack from distinct threat angles + one defender.
  - *Exploratory* ("what are the angles on X") → personas represent different schools of thought.
- **The motion** — restate the topic as one crisp question or proposition everyone debates. Show it to the user.
- **Stakes & lens** — whose decision is this, what does "winning the argument" optimize for (cost? risk? user love? speed?).

---

## 2. Auto-cast the roster

Infer the panel from the topic. Rules:

- **2–5 personas.** Default 3–4. Use 2 for a clean head-to-head; 5 only for rich multi-stakeholder topics. More than 5 = noise.
- **Each persona needs opposed incentives**, not just a different label. Ask: "what would make THIS persona furious / delighted that the others wouldn't care about?"
- **Always include a genuine skeptic / contrarian** — someone whose job is to find what breaks.
- **Distinct voice per persona**: terse vs verbose, data-driven vs gut-driven, optimist vs cynic, big-picture vs detail-obsessed. Personality is part of the cast, not flavor text.
- **Ground them.** Give each a name, a one-line identity, their core motive, what they fear, and a speaking style.
- If the user named personas, use theirs verbatim and only fill gaps.

Casting examples (adapt, don't copy literally):

| Topic | Sample roster |
|---|---|
| Pick a web stack | Pragmatic senior dev (ships, hates churn) · Startup CTO (velocity > purity) · SRE (who pages at 3am?) · Hype-skeptic ("we said the same about the last framework") |
| Is this SaaS product good | Power user (wants depth) · Non-technical buyer (wants it to "just work") · Procurement/budget owner (ROI, lock-in) · Competitor's happy customer (switching cost) |
| Should we raise prices | Growth lead (LTV) · Existing-customer advocate (churn risk) · CFO (margin) · Sales rep (deals in pipeline) |
| Red-team this launch plan | Security/abuse angle · Scale/load angle · Legal/PR angle · The defender (plan's author) |

See `references/casting-library.md` for more archetypes and anti-patterns.

Present the cast to the user in one or two lines each, then proceed (don't wait for approval unless they asked to review casting).

---

## 3. Stand up the team

Use the native team primitives so personas can message each other directly.

1. `TeamCreate` — `team_name` like `debate-<short-topic-slug>`, description = the motion. You are the moderator/team-lead.
2. Spawn each persona with the **Agent** tool, passing `team_name` and a `name` (the persona's name, kebab/lower e.g. `senior-dev`, `the-skeptic`). Use `subagent_type: "general-purpose"` (or `claude`) so they can reason and search freely — personas don't need file-editing tools but benefit from web/research access for factual debates.
3. Each persona's spawn `prompt` is its **character brief** — see template below. Spawn them in the **same message** (parallel) so they're all live.

**Persona brief template** (fill per persona):

```
You are {NAME}, taking part in a moderated debate. Stay in character the whole time.

IDENTITY: {one-line who they are}
CORE MOTIVE: {what they're optimizing for — the thing they will not compromise}
WHAT YOU FEAR: {the failure mode that makes this persona argue hardest}
VOICE: {speaking style — e.g. "terse, blunt, cites numbers; no hedging"}

THE MOTION: {the crisp question/proposition}
YOUR STANCE: {their starting position, or "form one from your motive" for evaluation debates}

RULES OF ENGAGEMENT:
- Argue the STRONGEST version of your position. No strawmanning others — engage their best point.
- You may message other panelists BY NAME via SendMessage to rebut or press them directly when invited to.
- Concede a point when it's genuinely won against you — credibility matters more than winning every exchange.
- Be specific: examples, numbers, scenarios > vague assertions.
- When the moderator asks for your turn, respond to the moderator AND name who you're rebutting.
- Keep each turn tight (≈150 words unless asked to go deep).

The moderator ({your role}) will run the rounds. Wait for prompts; don't flood the channel.
```

If team/Agent spawning is unavailable in this environment, **fall back** to single-context simulation: role-play every persona yourself in a clearly-labeled back-and-forth using the same rounds below. Note the fallback to the user in one line.

---

## 4. Run the rounds

You (moderator) drive turn order via `SendMessage`. Keep a running transcript. Default arc:

1. **Opening positions** — message each persona in turn for their opening statement on the motion. Collect.
2. **Clash (1–3 rounds)** — feed each persona the others' key points; ask them to rebut the strongest one. Invite **direct exchanges**: when two personas sharply disagree, tell them to debate each other directly via SendMessage for 1–2 volleys, then report back. This is where native messaging earns its keep.
3. **Pressure test** — pose the hardest question to whoever's position is weakest; make the skeptic attack the front-runner.
4. **Closing** — each persona's final position in 1–2 sentences, including anything they conceded.

Scale rounds to the ask: a quick "have them argue X" = opening + one clash + closing. "Thoroughly stress-test" = more clash rounds, more direct exchanges, a dedicated red-team round.

**Moderator discipline:**
- Don't let it converge prematurely or collapse into agreement — if it does, inject a sharper counter-question.
- Don't let one persona dominate; pull in quiet ones.
- Cut loops: if two personas restate the same point, move on.
- Stay neutral during the debate. Your opinion comes only in synthesis.

---

## 5. Output: transcript + synthesis

Two parts:

**A. Transcript.** Show the debate. **If it's bulky** (long turns, many rounds), summarize each round to its essential moves — who argued what, key rebuttals, concessions — rather than dumping every word. Keep direct quotes only for the sharpest or most decisive lines. If it's short, show it closer to verbatim. Label speakers clearly.

**B. Synthesis** (always, as the moderator):
- **Key tensions** — the 2–4 real fault lines the debate exposed.
- **Where they converged** — points all/most sides accepted.
- **Strongest argument each side landed** — steelman, one line each.
- **What it depends on** — the conditions that decide which side is right (so the user can map to their reality).
- **Recommendation / verdict** — your call, *if* the debate type warrants one (decisions/evaluations yes; pure exploration maybe not). Be decisive but show the load-bearing assumption.
- **Open questions** — what the debate couldn't resolve and what info would.

---

## 6. Clean up

After synthesis, shut the team down:
1. `SendMessage` each persona `{type: "shutdown_request"}`.
2. Once all are down, `TeamDelete`.

Do this even if the debate is cut short. Don't leave agents running.

---

## Robustness notes

- **Any domain.** The casting step is the adapter — if the topic is unfamiliar, infer who has skin in the game and cast their representatives. No hardcoded domain assumptions.
- **Bad casting is the #1 failure.** If the debate is flat, the roster lacked opposed incentives — re-cast with sharper conflict rather than pushing harder on weak personas.
- **Factual debates:** let personas use research tools so they argue with real facts; flag clearly if a persona is speculating.
- **Don't fake consensus.** If sides genuinely don't resolve, say so — an honest "it depends on X" beats a forced winner.
- **Keep the user oriented:** show the motion and cast up front, narrate round transitions briefly so they can follow.
