---
name: production-canvas
description: Plan and pressure-test live game events with the Production Canvas, an integrated planning methodology covering player journey mapping, session time math, GDD gap tracking, dependency mapping, risk heatmaps, forecast vs actuals, and endowment audits. Use this skill whenever the user wants to plan a live event, game event, seasonal event, or battle pass season; asks whether players have enough time for content or can reach a gate or milestone; mentions journey maps, player archetypes, engagement curves, churn risk, design gaps, open design decisions, event dependencies, event forecasts, or what players keep after an event; or says "production canvas", "journey map", "session validator", or "endowment audit". Also use it for partial questions, like a quick session math check, even when the user does not ask for the full canvas.
---

# Production Canvas

An integrated planning instrument for live game events. Its premise: journey mapping, session time math, gap tracking, dependency mapping, risk scoring, and endowment auditing are not separate tasks. They are views of the same underlying data, and they belong in one place, computed before design lock rather than discovered after launch.

The theoretical basis is Self-Determination Theory applied through three lenses: agency, progression, and belonging. Player archetypes are vantage points from which need satisfaction becomes observable, not containers for the needs. Keep that framing when explaining results.

## Choose the delivery mode first

Two modes. Pick based on what the user needs, and confirm if ambiguous:

1. **Full canvas artifact.** The user wants the interactive tool for ongoing use: a React artifact with seven tabs (journey map, data and forecast, GDD gaps, dependency map, session validator, risk heatmap, endowment audit). Instantiate it from the bundled template. Read `references/artifact-guide.md` before touching the template; it documents the config surface and the renderer constraints that will silently break the artifact if ignored.

2. **Inline analysis.** The user has one question: does the time math work, what does each segment keep, where are the open decisions. Run just that method in conversation using `references/methods.md`. Faster, and often all that is needed. Offer the full artifact at the end if the conversation suggests ongoing use.

## Workflow

### 1. Gather the configuration

Every method runs on the same configuration. Collect what the chosen mode needs, and no more. The full schema with field-by-field guidance is in `references/config-schema.md`.

The minimum for any session math or risk work: event duration in weeks, the week themes (one line each), player archetypes with a sentence of motivation each, engagement levels, and honest per-segment weekly time budgets. For forecasting, add baseline concurrent players and session length. For the full artifact, everything in the schema.

Interview efficiently: ask for the design doc or event brief first, and extract rather than interrogate. When the user supplies no numbers, do not stall: propose defensible ranges, mark them explicitly as your assumptions, run the method, and hand the assumptions back for correction. An answer built on labeled assumptions beats a questionnaire, but an assumed number presented as the user's is a corrupted analysis. Users rarely know their time-per-stage numbers precisely; ranges are expected and the methods are built for them. Push back gently on suspiciously optimistic budgets: the reference player in the user's head is usually the most engaged person in the room, and the methods exist precisely to correct for that.

### 2. Run the methods

Read `references/methods.md` for the six methods. Summary of what each answers:

- **Journey map**: what does each player type do and feel, week by week. Generates scenario, experience, research, and opportunity layers per week, plus per-archetype notes that feed sentiment scoring.
- **Session validator**: does the time math work. Cost parameters against budget parameters, per segment, under optimistic and pessimistic readings. The single highest-value quick check; when in doubt, run this one.
- **Gap tracker**: what is still undecided. Every open decision logged with what it blocks, one owner, and a three-state status.
- **Dependency map**: where does ambiguity hurt most. Nodes and gates; an open decision on a heavily fed gate outranks everything else.
- **Forecast and actuals**: is the plan surviving contact with reality. Baseline times multipliers, stated assumptions, variance read as diagnostic rather than grade.
- **Endowment audit**: what crosses the boundary out of the event. Each reward classified by persistence, lens, reach, and the base-game loop it appears in. A reward that persists but touches no loop is a souvenir, not an endowment.

### 3. Present findings the way a producer needs them

Lead with what breaks and who it breaks for, not with methodology. A finding is a segment, a week, and a stated reason, in that order: "Social players, week 3, cannot reach the gate under the pessimistic reading because the budget covers a third of the cost." Then the arithmetic that produced it, visible and checkable.

State limits without being asked. Forecasts are ballpark math on stated assumptions, not analytics. Sentiment scoring is keyword arithmetic, not psychology. The canvas cannot check what was never mapped. These admissions are part of the method; a legible argument must show its shaky parts, because false precision costs more credibility than honest ranges.

## Things this skill should refuse to fudge

Do not present optimistic-only readings; always show both. Do not let a gate requirement stay ambiguous in the write-up when the ambiguity itself is the finding. Do not classify a persistent reward as an endowment without naming the base-game loop it appears in. Do not report a risk cell without its reasoning, because an unexplained score takes the whole analysis down with it the first time someone probes it. Do not let an assumed input silently survive two exchanges: every rerun restates which numbers are still yours.
