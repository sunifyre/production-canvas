# The six methods

Each method is described as: the question it answers, the inputs, the procedure, and the honest limits. Present results per the "findings" guidance in SKILL.md: segment, week, reason, then the arithmetic.

## 1. Session validator (time math)

**Question**: can each player segment actually reach each milestone with the time they really have?

**Inputs**: cost parameters (time per progression unit as a range, units required, units per week) and budget parameters (typical session length as a range, active days per week as a range), plus per-segment budget multipliers and completion-rate factors.

**Procedure**: compute weekly cost per milestone and weekly budget per segment, then the ratio. Run twice:
- Optimistic reading: LOW cost values with HIGH budget values.
- Pessimistic reading: HIGH cost values with LOW budget values.

This polarity matters. Cost and budget parameters point in opposite directions; applying "min" to everything produces a nonsense reading where even the most engaged segment fails. A segment reaches a gate when its progress ratio clears the threshold in every contributing week. The gap between the two readings is the uncertainty, and every segment that fails the pessimistic reading is a conversation the team needs before lock.

**Limits**: multiplication on stated assumptions. The output is "under your own stated numbers, this segment cannot arrive", which is a consequence, not a prediction.

## 2. Journey map

**Question**: what does each kind of player do and feel, week by week?

**Structure**: weeks as columns; four layers as rows: player scenario (present tense, third person, 2-3 sentences), emotional experience (named emotions and friction risks), research insight (one positive, one risk), design opportunity (a short headline plus 1-2 sentences referencing actual mechanics). Below these, one note row per archetype and per engagement level: 1-2 sentences on how that segment experiences that week.

**Procedure**: draft each cell from the event's design context; the user edits. Drafts beat blank pages, and editing twenty drafted cells is faster than writing twenty cells, but every cell is a draft until a human has passed it.

**Sentiment**: score each experience and archetype note by keyword valence (positive terms raise, friction terms lower, clamped to a band). This feeds the risk heatmap. It is arithmetic, not psychology; never defend it as a standalone measure.

## 3. Gap tracker

**Question**: what is still undecided, and what is it silently blocking?

A decision is trackable when it has exactly four attributes: what it is (stated as the decision, not the discussion), what it blocks (the attribute that enables sorting), one owner (shared ownership of an open decision is the formal notation for nobody), and a three-state status (open, in progress, closed).

Sort by what it blocks: a decision blocking implementation scope outranks one blocking flavor text. The test of the tracker is whether a partner sync could be run from it: one screen, every open decision, sorted, owned, stated.

## 4. Dependency map

**Question**: where does ambiguity hurt most?

Map the event as a graph: content, systems, and economy items as nodes; unlock requirements as edges; hard gates (blocking) distinguished from soft dependencies (optional paths). Flag open decisions from the gap tracker directly on their nodes.

Read it by edge concentration: an open decision on a leaf node is a detail; an open decision on a gate that multiple progression tracks feed into is where every ambiguity gets multiplied by every player who approaches it. Requirements that are settled in the design but ambiguous in the interface (for example, one item at final tier required while the UI reads as all items) are findings of the first order, because players who misread a gate do their own session math on the wrong numbers and quietly leave.

## 5. Forecast and actuals

**Question**: is the plan surviving contact with reality?

**Forecast**: take a defensible baseline (concurrent players, historical session length), apply per-week multipliers that encode explicit beliefs (peak at the centerpiece week, dip in the fatigue stretch), adjust session projections by journey sentiment, and write the assumptions next to the numbers. The multipliers are the honest part: each one is a checkable belief.

**Actuals loop**: freeze the forecast at launch, enter real numbers weekly, and read variance as a diagnostic, not a grade. A miss is information about which assumption was wrong: fewer players arriving and players leaving faster are different wrong assumptions with different corrections.

**Limits**: never fit for revenue commitments; state this. A wrong baseline makes everything downstream confidently wrong. If entering actuals is not nearly free, the loop dies by week three, and a lapsed instrument is worse than none because it looks like diligence.

## 6. Endowment audit

**Question**: what does a player have after the event ends that they did not have before?

Classify every event reward and system by four attributes: does it persist past the end date; which lens it feeds (agency, progression, belonging); which segments can actually obtain it (chain this from the session validator's pessimistic reading); and which base-game loop it appears in afterward.

Classification: persists and feeds a loop is an endowment; persists but touches no loop is a souvenir; does not persist is in-event fuel (fine, if deliberate). Watch for conversion valves: items that expire unless exchanged, where one tuning decision determines whether a whole segment leaves with something or nothing.

Summarize per segment: does each segment leave with at least one endowment per lens on the pessimistic path, and at what depth (count of reachable endowments)? The common finding is not spike versus foundation but a depth gap: everyone passes the three-lens check on baseline giveaways while depth concentrates in the top segments. Name the valve that could deepen the middle.

**Limits**: design-time audit of stated intent. The measurement half (endowment engagement 30 days after event end, persistence of social connections formed during the event, habit retention per segment) only exists once the event runs, and post-event retention comparisons carry selection bias: participants were more engaged to begin with.

## Presentation defaults

Use ranges, not point estimates. Show both readings. When inputs were assumed rather than supplied, open with the answer but name the deciding assumption in the same breath, and invite the correction that would change the verdict. Attach reasoning to every risk score. Credit the boring mechanism: when arithmetic finds the problem, say arithmetic found it.
