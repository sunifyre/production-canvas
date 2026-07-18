# Configuration schema

One configuration object drives every method and the artifact. Collect only what the chosen mode needs.

## Core fields (all modes)

```json
{
  "name": "Project Name",
  "subtitle": "Short event subtitle",
  "platform": "Roblox",
  "eventDuration": 5,
  "gameContext": "The base game: genre, playerbase size and age, core loop, what players care about. This feeds every generated cell; more specificity means better drafts.",
  "eventContext": "The event: structure, centerpiece, gates, cooperative content, catch-up systems, known open questions.",
  "keyMechanics": "comma separated list of systems and currencies the event touches",
  "weekThemes": [
    "Week 1: what unlocks, what the player receives, expected time per activity",
    "Week 2: ...",
    "Week 3: ... include gate requirements verbatim, ambiguities are findings",
    "Week 4: ...",
    "Week 5: ..."
  ]
}
```

## Baselines (forecast mode and full artifact)

```json
{
  "robloxGameId": "",
  "lifetimeVisits": 0,
  "baselineCCU": 10000,
  "sessionBaselineMin": 28,
  "eventCCUMultipliers": [1.6, 1.85, 2.2, 1.4, 1.9],
  "sessionTimeMultipliers": [1.15, 1.25, 1.45, 0.95, 1.3],
  "retentionD1": [0.42, 0.38, 0.35, 0.28, 0.36],
  "retentionD7": [0.18, 0.16, 0.15, 0.10, 0.14],
  "retentionD30": [0.07, 0.06, 0.06, 0.04, 0.06]
}
```

Multiplier arrays are per-week beliefs, and each should be defensible in one sentence ("W3 peaks because the centerpiece unlocks"). Elicit the sentence, not just the number. `robloxGameId` is optional; when present the artifact can pull live stats with fallbacks.

## Player segments (all modes)

```json
{
  "archetypes": [
    {"id": "collector", "label": "Collector", "color": "#185FA5",
     "description": "One or two sentences on motivation and friction sensitivity. Feeds AI generation directly.",
     "curve": [0.65, 0.82, 0.95, 0.60, 0.85]}
  ],
  "engagementLevels": [
    {"id": "new", "label": "New", "color": "#1D9E75",
     "description": "Still learning the base game. Most likely to churn.",
     "curve": [0.72, 0.65, 0.78, 0.42, 0.60]}
  ]
}
```

Three archetypes and three engagement levels (new, midlevel, endgame) is the proven shape. `curve` is the prior expectation of engagement per week (0 to 1), used until generated notes supply sentiment. Archetypes are behavioral segments, not psychological needs: they are vantage points where one need dominates expressed behavior.

## Session validator parameters

```json
{
  "sessionParams": {
    "minsPerStage": {"min": 30, "max": 40, "lbl": "Time per rank", "unit": "min"},
    "stagesPerTrack": {"min": 4, "max": 4, "lbl": "Ranks per school", "unit": "stages"},
    "tracksW1": {"min": 2, "max": 2, "lbl": "Tracks in W1", "unit": "tracks"},
    "tracksW2": {"min": 2, "max": 2, "lbl": "Tracks in W2", "unit": "tracks"},
    "sessionMin": {"min": 20, "max": 45, "lbl": "Typical session", "unit": "min", "budget": true},
    "daysPerWeek": {"min": 4, "max": 7, "lbl": "Active days/week", "unit": "days", "budget": true}
  }
}
```

The `budget: true` flag marks parameters where optimistic means HIGH (player has more time). Parameters without it are costs, where optimistic means LOW. Getting this polarity wrong makes every segment fail the optimistic reading, which is a nonsense result; see methods.md section 1. The internal key names (tracksW1 and so on) are legacy and harmless; the labels are what users see.

Per-segment factors live in the artifact as a constant (SSEG): each segment has a budget multiplier (0.75 for new players up to 1.3 for endgame) and a completion-rate factor. Adjust for the target game rather than inheriting blindly.

## Per-event data sets (full artifact)

These are constants in the artifact rather than config fields; the artifact guide lists where each lives. Shapes:

- **Gaps**: `{id, gap, cat, week, owner, status, blocks, notes}` with status in open, in progress, closed, and cat in Design TBD, Economy, Asset Dep., Narrative, Technical.
- **Dependency nodes**: `{id, label, week, type, desc, color}` with type in gate, content, economy. **Edges**: `{from, to, type}` with type hard or soft. **Open ids**: array of node ids carrying open gaps.
- **Endowment items**: `{name, persist, lenses, seg, loop, note}` with persist in permanent, expires, converts; lenses drawn from agency, progression, belonging; seg either "all" or an array of segment labels; loop a phrase naming the base-game loop (empty string means souvenir).
- **Structural risk matrix**: per segment id, an array of per-week risk priors (0 to 1) encoding where the design structurally stresses that segment.
