# Production Canvas

An integrated planning instrument for live game events, packaged as a Claude Skill.

Journey mapping, session time math, GDD gap tracking, dependency mapping, risk heatmaps, forecast vs actuals, and endowment audits are not separate tasks. They are views of the same underlying data, and this skill puts them in one place, computed before design lock instead of discovered after launch.

## What you get

- A methodology Claude can run in any conversation: ask "can casual players reach my week 3 gate?" and get honest session math with both optimistic and pessimistic readings, or ask for the full canvas and get an interview followed by an interactive seven-tab planning tool.
- A complete working React artifact template (seven tabs), pre-configured with a fictional sample game (Whisk and Wander, a cozy baking game) so you can explore every view before configuring your own title. A fully pre-filled demo mode is included for screenshots and walkthroughs, no API calls needed.
- Reference documentation for the six methods, the configuration schema, and the artifact renderer constraints.

## Install

1. Download `production-canvas.skill`
2. In Claude, open Settings, then Capabilities, and upload the skill (or open the .skill file in a Claude conversation and click Save skill)
3. In any conversation: "set up the production canvas for my event" or just ask a planning question

## The thinking behind it

The methodology comes from a series of essays on live event production, starting here: https://ugcinside.substack.com/p/i-built-the-production-tool-i-always

The theoretical basis is Self-Determination Theory applied through three lenses (agency, progression, belonging), written up here: https://ugcinside.substack.com/p/three-lenses-for-any-customer-journey

## Honest limits

The forecasts are ballpark math on stated assumptions, not analytics. The sentiment scoring is keyword arithmetic, not psychology. The canvas cannot check what was never mapped. These limits are documented inside the skill and stated in its outputs, on purpose.

## License

MIT. Built by Sunitha Kumar Girish, Budai Labs. Issues and forks welcome; if you run it on your own event, I would genuinely like to hear what lights up.
