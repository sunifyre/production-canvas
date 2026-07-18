# Instantiating the canvas artifact

The bundled template `assets/canvas_template.jsx` is the complete working tool (about 1,700 lines, seven tabs). To create the canvas for a new game, copy the template and replace its data constants. Do not restructure the components; the template's patterns exist because the artifact renderer punishes deviations (see the pitfalls section, learned by repeated breakage).

## What to replace for a new game

All constants sit near the top of the file, before the components:

1. **`PS`**: the main config object (name, contexts, weekThemes, baselines, multipliers, archetypes, engagementLevels). Replace wholesale with the new game's config per `references/config-schema.md`. Keep the field names exactly.
2. **`DEFAULT_CELLS`**: pre-filled scenario cells keyed `"scenario-0"` through `"scenario-4"`. Rewrite for the new event, or set to `{}` to start blank and let AI generation fill them.
3. **`INIT_GAPS`**: the gap tracker's starting list.
4. **`GDD_RISK`**: per-segment arrays of structural risk priors per week.
5. **`RNOTES`**: design notes keyed `"segmentid-weekindex"`, shown when a heatmap cell is clicked. Rewrite or empty.
6. **`SPARAMS`**: session validator parameter definitions, including the `budget: true` flags on sessionMin and daysPerWeek. Preserve those flags; the optimistic/pessimistic polarity depends on them.
7. **`SSEG`**: per-segment budget multipliers and completion rates for the validator.
8. **`DEP_NODES`, `DEP_EDGES`, `OPEN_IDS`**: the dependency graph. Week column x positions come from `WEEK_COLS`; extend it if the event runs longer than five weeks.
9. **`ENDOW_ITEMS`, `ENDOW_INSIGHT`**: the endowment audit list and its one-paragraph read.
10. **`DEMO`**: an optional fully fictional dataset for demos and screenshots. Either rewrite for a new fictional game or remove the demo button from SetupScreen. If keeping it, verify zero real-project terms leak into demo strings; a grep for the real project's proper nouns over the DEMO block is the cheap check.

The AI generation prompts in `buildPrompts()` are config-driven and need no changes. The Anthropic API endpoint block at the top works as-is inside claude.ai artifacts (no key needed there); outside claude.ai the user must supply key handling.

## Renderer pitfalls (each of these has caused a blank screen or crash)

The claude.ai artifact renderer is stricter than a normal React toolchain. These rules are absolute in this template:

1. **No React fragments anywhere.** `<>...</>` compiles to an undefined internal call and produces "returnReact is not defined". Wrap in a real element (`<div>`, or `<g>` inside SVG).
2. **No hooks inside `.map()` loops.** Hooks per iterated item blank-screen the artifact. Compute values inline or lift to a child component defined at module level.
3. **No components defined inside other function bodies.** They are recreated per render and break state. All components live at module level.
4. **No `&&` short-circuit rendering.** A leaked `false` inside SVG breaks the renderer. Always ternary: `cond ? x : null`.
5. **No localStorage or sessionStorage.** Unsupported in artifacts; all state is in-memory React state.
6. **Watch variable shadowing.** A local redefinition of an outer helper name has confused the renderer before; keep helper names unique.

After any edit, validate before shipping: balanced braces and parens, zero fragments, zero hooks-in-map. A ten-line script that counts these catches most breakage:

```bash
node -e "
const s=require('fs').readFileSync(process.argv[1],'utf8');
console.log('braces',(s.match(/\{/g)||[]).length-(s.match(/\}/g)||[]).length,
'parens',(s.match(/\(/g)||[]).length-(s.match(/\)/g)||[]).length,
'fragments',(s.match(/<>|<\/>/g)||[]).length,
'hooksInMap',(s.match(/\.map\([^)]*use[A-Z]/g)||[]).length);
" file.jsx
```

## Editing mechanics

For large string replacements in the file, write a Python script to a file and run it, asserting each old string exists before replacing. Shell heredocs mangle quotes in JSX at this scale. Failed assertions before the write mean nothing was saved, which is the safe failure mode; keep it that way by writing the file only after all replacements succeed.

## Performance patterns already in the template

Keep these when editing: `pooled()` limits concurrent AI calls to 4 (all-at-once parallelism triggers API 429s), and `callAI` retries 429s and 5xx with exponential backoff plus jitter. Generation is offered per cell, per row, per column, and generate-all; all four paths route through the same pooled limiter.
