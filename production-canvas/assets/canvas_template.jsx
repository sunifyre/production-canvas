import { useState, useCallback, useEffect } from "react";

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

// ── palette ────────────────────────────────────────────────────────────────────
const GN = "#4a7c59"; const GN2 = "#2d5a3d"; const GN3 = "#e8f5ee";
const AM = "#c17f3a"; const AM2 = "#8b5a1f"; const AM3 = "#fdf0e0";
const BD = "0.5px solid #e0e0dc";

// ── data ───────────────────────────────────────────────────────────────────────
const PS = {
  name:"Whisk and Wander", subtitle:"Grand Bake Festival", platform:"Roblox", eventDuration:5,
  gameContext:"Whisk and Wander — a cozy cafe-building game on a major UGC platform where players run a bakery, learn recipes, and serve a growing town. Large established playerbase, broad demographic, mastery-driven players.",
  eventContext:"The Grand Bake Festival — a 5-week festival event. Players master four recipe schools, present a signature dish at a judged Showcase in week 3, run a cooperative Dinner Rush service in week 4, and chase catch-up and prestige rewards in week 5.",
  keyMechanics:"recipe schools, gold mastery, Flour Tokens, Festival Pass, ingredient stall, Signature Showcase, Dinner Rush, recipe cards, token exchange, Golden Whisk",
  weekThemes:[
    "Week 1: Festival opens. Two recipe schools unlock (Viennoiserie, Tarts). Flour Tokens introduced, free Festival Pass and ingredient stall open. 4-5 orders per rank, 20-30 min per rank.",
    "Week 2: Two more schools unlock (Choux, Macarons). Celebrity judge NPCs visit with special requests. Rare ingredient drops appear in regular deliveries. Players work all four schools toward gold mastery.",
    "Week 3: Signature Showcase opens. Requires all four recipe books plus at least one school at gold mastery. OPEN: entry requirement UI clarity (one gold school required, not all four).",
    "Week 4: Dinner Rush. Cooperative three-wave kitchen service. Clearing enough orders guarantees a mystery recipe card with a small heritage recipe chance. OPEN: final team size.",
    "Week 5: Catch-up week. Flour Tokens exchange for rare ingredients and missing books. Dinner Rush replayable. Flawless run with full gold mastery awards the Golden Whisk. OPEN: flawless-run criteria.",
  ],
  robloxGameId:"", lifetimeVisits:0,
  baselineCCU:10000, sessionBaselineMin:28,
  eventCCUMultipliers:[1.6,1.85,2.2,1.4,1.9],
  sessionTimeMultipliers:[1.15,1.25,1.45,0.95,1.3],
  retentionD1:[0.42,0.38,0.35,0.28,0.36],
  retentionD7:[0.18,0.16,0.15,0.10,0.14],
  retentionD30:[0.07,0.06,0.06,0.04,0.06],
  archetypes:[
    {id:"collector",label:"Collector",color:"#185FA5",description:"Motivated by completing recipe sets, earning every ribbon, and rare finds. High FOMO sensitivity.",curve:[0.65,0.82,0.95,0.60,0.85]},
    {id:"social",label:"Social/Casual",color:"#9E3F8E",description:"Motivated by friends, the festival atmosphere, light daily play. Disengages if content feels like homework.",curve:[0.70,0.78,0.82,0.48,0.72]},
    {id:"trader",label:"Trader",color:"#B85C00",description:"Motivated by acquiring rare ingredients and recipes with market value. Strategic about timing.",curve:[0.55,0.68,0.88,0.52,0.90]},
  ],
  engagementLevels:[
    {id:"new",label:"New",color:"#1D9E75",description:"Still learning the base game. Easily overwhelmed, most likely to churn.",curve:[0.72,0.65,0.78,0.42,0.60]},
    {id:"mid",label:"Midlevel",color:"#534AB7",description:"Comfortable with core mechanics. Motivated by event progression.",curve:[0.60,0.80,0.90,0.58,0.82]},
    {id:"endgame",label:"Endgame",color:"#D85A30",description:"Mastered the base game. Cares about prestige, exclusive rewards, leaderboards.",curve:[0.50,0.72,0.95,0.65,0.92]},
  ],
};

const BLANK = {
  name:"",subtitle:"",platform:"Roblox",eventDuration:5,
  robloxGameId:"",lifetimeVisits:0,
  gameContext:"",eventContext:"",keyMechanics:"",
  weekThemes:["","","","",""],
  baselineCCU:5000,sessionBaselineMin:25,
  eventCCUMultipliers:[1.5,1.8,2.0,1.3,1.7],
  sessionTimeMultipliers:[1.1,1.2,1.4,0.95,1.25],
  retentionD1:[0.40,0.36,0.33,0.26,0.34],
  retentionD7:[0.17,0.15,0.14,0.09,0.13],
  retentionD30:[0.06,0.05,0.05,0.03,0.05],
  archetypes:[
    {id:"a1",label:"",color:"#185FA5",description:"",curve:[0.6,0.7,0.85,0.55,0.75]},
    {id:"a2",label:"",color:"#9E3F8E",description:"",curve:[0.65,0.72,0.80,0.50,0.70]},
    {id:"a3",label:"",color:"#B85C00",description:"",curve:[0.55,0.65,0.82,0.50,0.85]},
  ],
  engagementLevels:[
    {id:"new",label:"New",color:"#1D9E75",description:"",curve:[0.70,0.62,0.75,0.40,0.58]},
    {id:"mid",label:"Midlevel",color:"#534AB7",description:"",curve:[0.58,0.78,0.88,0.56,0.80]},
    {id:"endgame",label:"Endgame",color:"#D85A30",description:"",curve:[0.48,0.70,0.93,0.63,0.90]},
  ],
};

const DEFAULT_CELLS = {
  "scenario-0":"The player arrives at their cafe to find the Grand Bake Festival tents going up in the town square. The festival board unlocks two recipe schools, Viennoiserie and Tarts, and introduces Flour Tokens earned from every completed order. The free Festival Pass and the pop-up ingredient stall open immediately.",
  "scenario-1":"Two more recipe schools unlock, Choux and Macarons, and celebrity judge NPCs begin visiting the cafe with special requests. Rare ingredient drops now appear in regular deliveries, and players start working all four schools toward gold mastery before the Showcase opens.",
  "scenario-2":"The Signature Showcase opens on the festival main stage. Players holding all four recipe books with at least one school at gold mastery present their signature dish in a judged ceremony. Earning the Showcase ribbon unlocks the master kitchen and a permanent menu slot.",
  "scenario-3":"The Dinner Rush event begins: teams of players run a shared festival kitchen through three escalating service waves, from steady orders to a full-house finale. Clearing enough orders guarantees a mystery recipe card with a small chance of a lost heritage recipe.",
  "scenario-4":"Final week. Catch-up systems go live: Flour Tokens exchange directly for rare ingredients and missing recipe books. Dinner Rush becomes replayable with escalating stakes, and a flawless service run with a full gold-mastery menu awards the exclusive Golden Whisk trophy.",
};

// ── Demo data: fictional game, pre-filled state for demos and screenshots ──
const DEMO = {
  cells: {
    "scenario-0":"The player arrives at their cafe to find the Grand Bake Festival tents going up in the town square. The festival board unlocks two recipe schools, Viennoiserie and Tarts, and introduces Flour Tokens earned from every completed order. The free Festival Pass and the pop-up ingredient stall open immediately.",
    "scenario-1":"Two more recipe schools unlock, Choux and Macarons, and celebrity judge NPCs begin visiting the cafe with special requests. Rare ingredient drops now appear in regular deliveries, and players start working all four schools toward gold mastery before the Showcase opens.",
    "scenario-2":"The Signature Showcase opens on the festival main stage. Players holding all four recipe books with at least one school at gold mastery present their signature dish in a judged ceremony. Earning the Showcase ribbon unlocks the master kitchen and a permanent menu slot.",
    "scenario-3":"The Dinner Rush event begins: teams of players run a shared festival kitchen through three escalating service waves, from steady orders to a full-house finale. Clearing enough orders guarantees a mystery recipe card with a small chance of a lost heritage recipe.",
    "scenario-4":"Final week. Catch-up systems go live: Flour Tokens exchange directly for rare ingredients and missing recipe books. Dinner Rush becomes replayable with escalating stakes, and a flawless service run with a full gold-mastery menu awards the exclusive Golden Whisk trophy.",
    "experience-0":"Players arrive curious and slightly overwhelmed: a familiar cafe transformed, two recipe schools, a new currency, and a free pass all land at once. Excitement is high but the risk is early confusion about where to start.",
    "experience-1":"Momentum builds as completionists chase rare ingredient drops and two more schools open. Friction appears for players juggling four mastery tracks, and time-poor players start feeling the pace.",
    "experience-2":"The Showcase is the emotional peak: pride and recognition for those who arrive prepared. For everyone else, anxiety about the requirement, and frustration if the entry rules read as stricter than they are.",
    "experience-3":"Dinner Rush delivers energy and teamwork, but new players report feeling overwhelmed by the three-wave format, and fatigue creeps in for casual players who fell behind on mastery.",
    "experience-4":"A satisfying closing week for engaged players chasing the flawless run. Catch-up systems relieve pressure, though some late arrivals feel the festival ending just as they got going.",
    "research-0":"POSITIVE: The free pass and instant stall unlock remove week-one friction and set a generous tone.\nNEGATIVE: Three new systems introduced simultaneously risks early cognitive overload for younger players.",
    "research-1":"POSITIVE: Rare drops in regular deliveries successfully convert routine play into festival progress.\nNEGATIVE: Four parallel mastery tracks stretch casual weekly time budgets past comfortable limits.",
    "research-2":"POSITIVE: The Showcase ceremony is a strong social share trigger and status marker.\nNEGATIVE: Entry requirement ambiguity (one gold school vs all four) could suppress attempts among exactly the players who need encouragement.",
    "research-3":"POSITIVE: Guaranteed recipe card above a modest order threshold keeps Dinner Rush rewarding for weaker teams.\nNEGATIVE: Team size for Dinner Rush remains unresolved and blocks kitchen layout work.",
    "research-4":"POSITIVE: The token exchange gives lapsed players a credible reason to return for the finale.\nNEGATIVE: The flawless-run trophy may be tuned out of reach for all but the top segment.",
    "opportunity-0":"OPPORTUNITY: Guided first-session path\nDETAIL: A single clear thread through the first session (recipe, order, stall visit) using the existing daily order system would cut early overload without new systems.",
    "opportunity-1":"OPPORTUNITY: Mastery-at-a-glance tracker\nDETAIL: One screen showing all four schools and gold progress would turn the juggling problem into a checklist, leveraging existing menu UI patterns.",
    "opportunity-2":"OPPORTUNITY: Showcase requirement clarity pass\nDETAIL: Explicit UI copy showing one gold school required plus book ownership, with a progress readout, directly protects Showcase participation for casual and new players.",
    "opportunity-3":"OPPORTUNITY: Dinner Rush onboarding moment\nDETAIL: A short pre-service brief (waves, stations, timing tips) delivered by the head judge NPC reduces new-player overwhelm at near-zero build cost.",
    "opportunity-4":"OPPORTUNITY: Returner welcome flow\nDETAIL: Detect lapsed players in week five and surface the token exchange immediately on login, converting the catch-up system into a re-engagement hook.",
  },
  aNotes: {
    "collector-0":"Completionists are energised: two recipe schools and a full book set to chase. Mild anxiety about drop rates already forming.",
    "collector-1":"Peak acquisition mode. Rare ingredient drops turn every delivery into a lottery ticket, which this group loves.",
    "collector-2":"The Showcase ribbon is the trophy moment. They arrive prepared and proud, and immediately ask what else is collectible.",
    "collector-3":"Guaranteed recipe cards keep them running Dinner Rush, but the low heritage-recipe chance introduces grind fatigue risk.",
    "collector-4":"The Golden Whisk is irresistible. Expect repeated flawless-run attempts and some frustration at the tuning.",
    "social-0":"Casuals enjoy the festival spectacle but engage lightly. The free pass reads as welcoming.",
    "social-1":"Friction begins: four schools feel like homework. Sessions with friends stay fun but mastery lags noticeably.",
    "social-2":"Risky week. Many casuals arrive short of gold mastery and the entry wording will decide whether they push on or drift.",
    "social-3":"Dinner Rush is the week they came for, if friends are running it. Solo casuals feel the fatigue stretch hardest here.",
    "social-4":"Relief week. The token exchange lets them finish something, which is what this segment needs to leave satisfied.",
    "trader-0":"Market-minded players are watching, not baking. Early positioning on festival ingredients begins quietly.",
    "trader-1":"Rare drops create the first real market activity. They farm deliveries with strategic intent.",
    "trader-2":"The non-tradeable ribbon disappoints them, but gold-mastery recipes themselves gain bragging value.",
    "trader-3":"Recipe cards enter circulation. Expected value against the heritage chance gets calculated immediately.",
    "trader-4":"Peak market week. The exchange system plus the heritage recipe make week five the trading event of the season.",
  },
  eNotes: {
    "eng-new-0":"New players drawn by the festival face the steepest ramp: game basics plus event systems at once. Churn risk is front-loaded.",
    "eng-new-1":"Those who survived week one settle into a single school. The four-track expectation quietly excludes them.",
    "eng-new-2":"Very few reach the Showcase. The ones who do describe it as the moment the game clicked. Entry clarity matters most here.",
    "eng-new-3":"Dinner Rush overwhelms without onboarding. The guaranteed card above a modest threshold is the saving grace.",
    "eng-new-4":"Catch-up gives late joiners a token of completion. Some convert to regulars; most needed this week to exist.",
    "eng-mid-0":"Comfortable and curious. Midlevel players absorb the new systems fastest and set the pace for the community.",
    "eng-mid-1":"Steady progress across all four schools. This is the segment the week two design actually fits.",
    "eng-mid-2":"Most Showcase entries happen here. Pride is high; the permanent menu slot gives a tangible reason to have engaged.",
    "eng-mid-3":"Core Dinner Rush audience. Kitchen performance on lower-end devices is their main complaint vector.",
    "eng-mid-4":"Chasing the flawless run with mixed success. Tuning decides whether this week ends on triumph or grumbling.",
    "eng-endgame-0":"Endgame players speedrun the first schools and start theorycrafting signature dishes by day two.",
    "eng-endgame-1":"All four schools at gold early. Attention shifts to helping friends and market plays.",
    "eng-endgame-2":"First Showcase entries within hours of opening. The ceremony lands well with this prestige-driven group.",
    "eng-endgame-3":"They carry Dinner Rush teams. Leaderboards and service mastery keep them fully engaged.",
    "eng-endgame-4":"The flawless run and heritage recipe are built for them. This week is their victory lap.",
  },
  gaps: [
    {id:1,gap:"Dinner Rush team size",cat:"Design TBD",week:"W4",owner:"Design",status:"open",blocks:"Kitchen layout, matchmaking scope",notes:"6 is current design. 4 discussed as performance mitigation. Not yet closed."},
    {id:2,gap:"Flour Token earn/spend rates",cat:"Economy",week:"W1-W5",owner:"Economy",status:"in progress",blocks:"Stall pricing, pass reward cadence",notes:"Ballpark rates agreed. Exact values post design lock."},
    {id:3,gap:"Token to rare ingredient exchange rate",cat:"Economy",week:"W5",owner:"Economy",status:"in progress",blocks:"Catch-up path viability",notes:"Working range identified. Final tuning pending."},
    {id:4,gap:"Mastery chain length per school",cat:"Economy",week:"W1-W2",owner:"Design",status:"in progress",blocks:"Time commitment estimate",notes:"4-5 orders per rank assumed."},
    {id:5,gap:"Showcase entry UI clarity (one vs all four)",cat:"Design TBD",week:"W3",owner:"UX",status:"open",blocks:"Casual and new player Showcase participation",notes:"Only one gold school required. UI must not imply all four."},
    {id:6,gap:"Festival cinematic asset list",cat:"Asset Dep.",week:"W1",owner:"Art",status:"open",blocks:"Production scheduling",notes:"Follow-up due next week."},
    {id:7,gap:"Golden Whisk flawless-run definition",cat:"Design TBD",week:"W5",owner:"Design",status:"open",blocks:"Reward accessibility tuning",notes:"Rough criteria set. TBC after Dinner Rush tuning."},
  ],
  depNodes: [
    {id:"entry",    label:"Festival Entry",     week:"W1", type:"gate",   desc:"Player opens the festival board. Festival Pass and ingredient stall unlock. Flour Tokens begin.", color:"#185FA5"},
    {id:"vien",     label:"Viennoiserie School",week:"W1", type:"content",desc:"First recipe school. Rank up through orders toward gold mastery.",                                  color:"#D85A30"},
    {id:"tarts",    label:"Tarts School",       week:"W1", type:"content",desc:"Second recipe school, unlocked alongside Viennoiserie.",                                            color:"#534AB7"},
    {id:"tokens",   label:"Flour Tokens",       week:"W1", type:"economy",desc:"Earned from completed orders. Feeds the ingredient stall. Rates still open.",                       color:"#c4a832"},
    {id:"choux",    label:"Choux School",       week:"W2", type:"content",desc:"Third recipe school, unlocked in week two.",                                                        color:"#9E3F8E"},
    {id:"macarons", label:"Macarons School",    week:"W2", type:"content",desc:"Fourth recipe school, unlocked in week two.",                                                       color:"#1D9E75"},
    {id:"showcase", label:"Showcase Gate",      week:"W3", type:"gate",   desc:"Requires all four recipe books plus at least one school at gold. UI must not imply all four at gold. OPEN GAP.", color:"#c0392b"},
    {id:"kitchen",  label:"Master Kitchen",     week:"W3", type:"content",desc:"Unlocked by the Showcase ribbon. Permanent menu slot and prestige cosmetics.",                      color:"#4a7c59"},
    {id:"rush",     label:"Dinner Rush",        week:"W4", type:"content",desc:"Cooperative three-wave service event. Team size still open (6 vs 4). OPEN GAP.",                    color:"#185FA5"},
    {id:"cards",    label:"Recipe Cards",       week:"W4", type:"economy",desc:"Guaranteed above a modest order threshold in Dinner Rush. Small heritage recipe chance.",           color:"#c17f3a"},
    {id:"exchange", label:"Token Exchange",     week:"W5", type:"economy",desc:"Flour Tokens exchange for rare ingredients and missing books. Rate still open. OPEN GAP.",          color:"#1D9E75"},
    {id:"whisk",    label:"Golden Whisk",       week:"W5", type:"content",desc:"Flawless service run with a full gold-mastery menu. Criteria still open. OPEN GAP.",                color:"#c4a832"},
    {id:"heritage", label:"Heritage Recipe",    week:"W5", type:"content",desc:"Very low chance from recipe cards. The festival's most coveted find.",                              color:"#9E3F8E"},
  ],
  depEdges: [
    {from:"entry",   to:"vien",     type:"hard"},
    {from:"entry",   to:"tarts",    type:"hard"},
    {from:"entry",   to:"tokens",   type:"hard"},
    {from:"vien",    to:"showcase", type:"hard"},
    {from:"tarts",   to:"showcase", type:"hard"},
    {from:"choux",   to:"showcase", type:"hard"},
    {from:"macarons",to:"showcase", type:"hard"},
    {from:"showcase",to:"kitchen",  type:"hard"},
    {from:"kitchen", to:"rush",     type:"soft"},
    {from:"rush",    to:"cards",    type:"hard"},
    {from:"tokens",  to:"exchange", type:"hard"},
    {from:"cards",   to:"heritage", type:"soft"},
    {from:"exchange",to:"heritage", type:"soft"},
    {from:"kitchen", to:"whisk",    type:"hard"},
    {from:"rush",    to:"whisk",    type:"hard"},
  ],
  depOpen: ["showcase","rush","tokens","exchange","whisk"],
  sessionParams: {minsPerStage:{min:15,max:30,lbl:"Time per rank",unit:"min"},stagesPerTrack:{min:4,max:4,lbl:"Ranks per school",unit:"ranks"},tracksW1:{min:2,max:2,lbl:"Schools in W1",unit:"schools"},tracksW2:{min:2,max:2,lbl:"Schools in W2",unit:"schools"},sessionMin:{min:20,max:40,lbl:"Typical session",unit:"min",budget:true},daysPerWeek:{min:4,max:7,lbl:"Active days/week",unit:"days",budget:true}},
  endow: [
    {name:"Recipe books (x4)", persist:"permanent", lenses:["progression","agency"], seg:"all", loop:"Menu planning and daily orders", note:"Given across W1-W2. Baseline endowment for every segment."},
    {name:"Gold mastery recipes", persist:"permanent", lenses:["progression"], seg:["Endgame","Collector","Midlevel"], loop:"Signature items in daily service", note:"Time-gated. Casual reach depends entirely on the catch-up week."},
    {name:"Showcase ribbon + menu slot", persist:"permanent", lenses:["belonging","agency"], seg:["Endgame","Collector"], loop:"A permanent menu slot used weekly", note:"Gate-locked on the pessimistic path."},
    {name:"Recipe cards", persist:"permanent", lenses:["progression"], seg:["Endgame","Collector","Midlevel"], loop:"New dishes in rotation", note:"Dinner Rush reward with mid-tier reach."},
    {name:"Heritage recipe", persist:"permanent", lenses:["belonging","progression"], seg:["Endgame"], loop:"Signature dish and bragging rights", note:"Lottery tier."},
    {name:"Golden Whisk trophy", persist:"permanent", lenses:["belonging"], seg:["Endgame"], loop:"", note:"Persists but touches no loop. The audit calls it what it is: a souvenir."},
    {name:"Flour Tokens", persist:"expires", lenses:[], seg:"all", loop:"", note:"Dies with the festival."},
    {name:"Festival decorations", persist:"permanent", lenses:["belonging"], seg:"all", loop:"Cafe decor seen by every visitor", note:"Free pass reward. Wide and gentle."},
  ],
  endowInsight: "Every segment keeps the recipe books, so nobody leaves empty. Depth concentrates at the top: Endgame leaves with six endowments, New and Social with two. The Golden Whisk persists but feeds no loop, and the token exchange is the only valve that deepens the middle. This event is a foundation for the top two segments and a shallow one for everyone else.",
  actuals: [
    {mau:"1520000", session:"31", d1:"40", d7:"17", d30:""},
    {mau:"1710000", session:"34", d1:"37", d7:"15", d30:""},
    {mau:"2050000", session:"39", d1:"33", d7:"", d30:""},
    {mau:"", session:"", d1:"", d7:"", d30:""},
    {mau:"", session:"", d1:"", d7:"", d30:""},
  ],
};

const INIT_GAPS = [
  {id:1,gap:"Dinner Rush team size",cat:"Design TBD",week:"W4",owner:"Design",status:"open",blocks:"Kitchen layout, matchmaking scope",notes:"6 is current design. 4 discussed as performance mitigation. Not yet closed."},
  {id:2,gap:"Flour Token earn/spend rates",cat:"Economy",week:"W1-W5",owner:"Economy",status:"in progress",blocks:"Stall pricing, pass reward cadence",notes:"Ballpark rates agreed. Exact values post design lock."},
  {id:3,gap:"Token to rare ingredient exchange rate",cat:"Economy",week:"W5",owner:"Economy",status:"in progress",blocks:"Catch-up path viability",notes:"Working range identified. Final tuning pending."},
  {id:4,gap:"Mastery chain length per school",cat:"Economy",week:"W1-W2",owner:"Design",status:"in progress",blocks:"Time commitment estimate",notes:"4-5 orders per rank assumed."},
  {id:5,gap:"Showcase entry UI clarity (one vs all four)",cat:"Design TBD",week:"W3",owner:"UX",status:"open",blocks:"Casual and new player Showcase participation",notes:"Only one gold school required. UI must not imply all four."},
  {id:6,gap:"Festival cinematic asset list",cat:"Asset Dep.",week:"W1",owner:"Art",status:"open",blocks:"Production scheduling",notes:"Follow-up due next week."},
  {id:7,gap:"Golden Whisk flawless-run definition",cat:"Design TBD",week:"W5",owner:"Design",status:"open",blocks:"Reward accessibility tuning",notes:"Rough criteria set. TBC after Dinner Rush tuning."},
];

// ── utils ──────────────────────────────────────────────────────────────────────
const fmtN = n => n>=1e6?(n/1e6).toFixed(1)+"M":n>=1000?(n/1e3).toFixed(0)+"K":String(n);
const fmtT = m => m<60?Math.round(m)+"m":Math.floor(m/60)+"h"+(Math.round(m%60)?" "+Math.round(m%60)+"m":"");
const scoreSent = t => {
  if(!t) return 0.5;
  const l=t.toLowerCase(); let s=0.5;
  ["excit","curious","delight","joy","proud","eager","satisf","reward","achiev","engag"].forEach(w=>{if(l.includes(w))s+=0.07;});
  ["fatigu","frustrat","overwhelm","drop","churn","anxiet","bore","confus","friction","stress"].forEach(w=>{if(l.includes(w))s-=0.07;});
  return Math.min(0.97,Math.max(0.12,s));
};
const riskColor = s => s>=0.70?"#c0392b":s>=0.50?"#c17f3a":s>=0.30?"#c4a832":GN;
const riskLabel = s => s>=0.70?"critical":s>=0.50?"high":s>=0.30?"medium":"low";
const GDD_RISK = {collector:[0.20,0.25,0.35,0.30,0.15],social:[0.30,0.40,0.50,0.75,0.40],trader:[0.25,0.30,0.20,0.30,0.20],new:[0.55,0.60,0.45,0.60,0.35],mid:[0.20,0.25,0.30,0.40,0.20],endgame:[0.10,0.15,0.15,0.25,0.10]};

// Run tasks with max N concurrent — avoids 429 rate limit errors
async function pooled(tasks, concurrency=4) {
  const results = [];
  let i = 0;
  async function worker() {
    while(i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  }
  await Promise.all(Array.from({length: Math.min(concurrency, tasks.length)}, worker));
  return results;
}

async function callAI(prompt, max=600, retries=4) {
  for(let attempt=0; attempt<=retries; attempt++) {
    const r = await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,max_tokens:max,messages:[{role:"user",content:prompt}]})});
    if(r.status===429 || r.status>=500) {
      if(attempt===retries) throw new Error("API "+r.status+" after "+retries+" retries");
      const wait = Math.pow(2, attempt) * 1000 + Math.random()*500; // 1s, 2s, 4s, 8s + jitter
      await new Promise(res=>setTimeout(res, wait));
      continue;
    }
    if(!r.ok) throw new Error("API "+r.status);
    const d = await r.json();
    return d.content.find(b=>b.type==="text").text.trim();
  }
}

function buildPrompts(cfg) {
  const ctx = cfg.gameContext+"\n\nEvent: "+cfg.eventContext+"\nMechanics: "+cfg.keyMechanics;
  return {
    scenario:    (w,t)=>"You are a game designer for "+cfg.name+" ("+cfg.platform+").\n"+ctx+"\nWeek: "+t+"\n\nWrite a 2-3 sentence player scenario for "+w+". Present tense, third person.",
    experience:  (w,t)=>"You are a UX researcher for "+cfg.name+".\n"+ctx+"\nWeek: "+t+"\n\nDescribe the player's emotional state in "+w+" in 2 sentences. Name specific emotions and friction risks.",
    research:    (w,t)=>"You are a games researcher for "+cfg.name+".\n"+ctx+"\nWeek: "+t+"\n\nWrite exactly:\nPOSITIVE: [one sentence]\nNEGATIVE: [one sentence]",
    opportunity: (w,t)=>"You are a product manager for "+cfg.name+".\n"+ctx+"\nWeek: "+t+"\n\nWrite exactly:\nOPPORTUNITY: [5-8 word headline]\nDETAIL: [1-2 sentences referencing "+cfg.keyMechanics+"]",
    archetype:   (a,w,t)=>"You are a UX researcher for "+cfg.name+".\n"+ctx+"\nArchetype: "+a.label+" — "+a.description+"\nWeek: "+t+"\n\n1-2 sentences on how a "+a.label+" player feels in "+w+".",
    engagement:  (e,w,t)=>"You are a UX researcher for "+cfg.name+".\n"+ctx+"\nEngagement: "+e.label+" — "+e.description+"\nWeek: "+t+"\n\n1-2 sentences on how a "+e.label+" player feels in "+w+". Note churn risk if relevant.",
  };
}

// ── shared primitives ──────────────────────────────────────────────────────────
function Btn({children,onClick,style={},disabled=false}) {
  return <button onClick={onClick} disabled={disabled} style={{cursor:disabled?"default":"pointer",opacity:disabled?0.5:1,...style}}>{children}</button>;
}

function SBox({label,val,color,note}) {
  return (
    <div style={{background:"#f5f5f2",borderRadius:6,padding:"8px 10px",textAlign:"center"}}>
      <div style={{fontSize:9,color:"#6b6b6b",marginBottom:2}}>{label}</div>
      <div style={{fontSize:18,fontWeight:600,color:color}}>{val}</div>
      {note ? <div style={{fontSize:8,color:"#6b6b6b"}}>{note}</div> : null}
    </div>
  );
}

function Inp({value,onChange,style={},placeholder="",type="text",rows}) {
  const base = {fontSize:12,padding:"7px 10px",borderRadius:6,border:BD,background:"#f9f9f7",color:"#1a1a1a",width:"100%",boxSizing:"border-box",...style};
  if(rows) return <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{...base,resize:"vertical",fontFamily:"-apple-system,sans-serif"}}/>;
  return <input type={type} value={value} onChange={e=>onChange(type==="number"?Number(e.target.value):e.target.value)} placeholder={placeholder} style={base}/>;
}

// ── SetupScreen ────────────────────────────────────────────────────────────────
function SetupScreen({onLoad}) {
  const [mode,setMode] = useState("home");
  const [draft,setDraft] = useState(null);
  const [step,setStep] = useState(0);
  const [importTxt,setImportTxt] = useState("");
  const [importErr,setImportErr] = useState("");

  const upd = (k,v) => setDraft(d=>({...d,[k]:v}));

  if(mode==="home") return (
    <div style={{maxWidth:500,margin:"3rem auto",padding:"0 1.5rem",fontFamily:"-apple-system,sans-serif"}}>
      <div style={{marginBottom:"2rem"}}>
        <div style={{fontSize:11,color:"#999",marginBottom:6}}>journey map generator</div>
        <h2 style={{margin:"0 0 6px",fontSize:22,fontWeight:500}}>progression // engagement</h2>
        <p style={{margin:0,fontSize:13,color:"#666"}}>AI-powered player journey map tool.</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <button onClick={()=>onLoad(PS)} style={{padding:"14px 18px",borderRadius:10,border:"1px solid "+GN,background:GN3,cursor:"pointer",textAlign:"left"}}>
          <div style={{fontWeight:600,color:GN2,marginBottom:3}}>Load sample — Whisk and Wander</div>
          <div style={{fontSize:11,color:GN}}>Fictional cozy baking game · 5-week festival event · pre-configured</div>
        </button>
        <button onClick={()=>onLoad({...PS, _demo:true})} style={{padding:"14px 18px",borderRadius:10,border:"1px solid #534AB7",background:"#EEEDFE",cursor:"pointer",textAlign:"left"}}>
          <div style={{fontWeight:600,color:"#3C3489",marginBottom:3}}>Load demo — fully pre-filled</div>
          <div style={{fontSize:11,color:"#534AB7"}}>Same sample game with every cell, note, and sample actual filled in. No API calls. Built for demos and screenshots.</div>
        </button>
        <button onClick={()=>{setDraft(JSON.parse(JSON.stringify(BLANK)));setMode("new");setStep(0);}} style={{padding:"14px 18px",borderRadius:10,border:BD,background:"white",cursor:"pointer",textAlign:"left"}}>
          <div style={{fontWeight:600,marginBottom:3}}>Configure a new game</div>
          <div style={{fontSize:11,color:"#666"}}>Set up archetypes, week themes, and baselines</div>
        </button>
        <button onClick={()=>setMode("import")} style={{padding:"14px 18px",borderRadius:10,border:BD,background:"white",cursor:"pointer",textAlign:"left"}}>
          <div style={{fontWeight:600,marginBottom:3}}>Import config JSON</div>
          <div style={{fontSize:11,color:"#666"}}>Paste a previously exported config</div>
        </button>
      </div>
    </div>
  );

  if(mode==="import") return (
    <div style={{maxWidth:500,margin:"2rem auto",padding:"0 1.5rem",fontFamily:"-apple-system,sans-serif"}}>
      <button onClick={()=>setMode("home")} style={{fontSize:11,color:"#666",background:"none",border:"none",cursor:"pointer",marginBottom:12,padding:0}}>← back</button>
      <h3 style={{margin:"0 0 12px",fontSize:15,fontWeight:600}}>Import config JSON</h3>
      <textarea value={importTxt} onChange={e=>setImportTxt(e.target.value)} rows={8} placeholder={'{"name":"My Game","platform":"Roblox",...}'} style={{fontSize:11,padding:"8px",border:BD,borderRadius:6,width:"100%",boxSizing:"border-box",fontFamily:"monospace",resize:"vertical"}}/>
      {importErr ? <div style={{fontSize:11,color:"#c0392b",marginTop:4}}>{importErr}</div> : null}
      <button onClick={()=>{try{const p=JSON.parse(importTxt);if(!p.name)throw new Error("Missing name");onLoad(p);}catch(e){setImportErr("Invalid: "+e.message);}}} style={{marginTop:10,padding:"8px 20px",background:GN,color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:12}}>load config</button>
    </div>
  );

  if(mode==="new" && draft) {
    const STEPS = ["basics","context","weeks","archetypes"];
    const wc = draft.eventDuration||5;
    return (
      <div style={{maxWidth:580,margin:"2rem auto",padding:"0 1.5rem",fontFamily:"-apple-system,sans-serif"}}>
        <button onClick={()=>setMode("home")} style={{fontSize:11,color:"#666",background:"none",border:"none",cursor:"pointer",marginBottom:12,padding:0}}>← back</button>
        <div style={{display:"flex",borderBottom:BD,marginBottom:20}}>
          {STEPS.map((s,i)=>(
            <div key={s} onClick={()=>setStep(i)} style={{flex:1,padding:"6px 0",textAlign:"center",fontSize:11,cursor:"pointer",borderBottom:step===i?"2px solid "+GN:"2px solid transparent",color:step===i?GN:"#666",fontWeight:step===i?600:400,marginBottom:-1}}>{s}</div>
          ))}
        </div>
        {step===0 ? (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <h3 style={{margin:"0 0 4px",fontSize:14,fontWeight:600}}>Game basics</h3>
            {[["name","Project / event name","text"],["subtitle","Short subtitle","text"],["platform","Platform","text"],["robloxGameId","Platform game ID (optional, enables live stats)","text"],["eventDuration","Duration (weeks)","number"]].map(([k,lbl,t])=>(
              <div key={k}><div style={{fontSize:11,color:"#666",marginBottom:4}}>{lbl}</div><Inp value={draft[k]||""} onChange={v=>upd(k,v)} type={t}/></div>
            ))}
          </div>
        ) : null}
        {step===1 ? (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <h3 style={{margin:"0 0 4px",fontSize:14,fontWeight:600}}>Context</h3>
            <p style={{margin:"0 0 8px",fontSize:11,color:"#666"}}>This feeds every AI prompt — more detail = better output.</p>
            {[["gameContext","Game context (mechanics, playerbase, stats)"],["eventContext","Event context (structure, goals, gaps)"],["keyMechanics","Key mechanics (comma separated)"]].map(([k,lbl])=>(
              <div key={k}><div style={{fontSize:11,color:"#666",marginBottom:4}}>{lbl}</div><Inp value={draft[k]||""} onChange={v=>upd(k,v)} rows={3}/></div>
            ))}
          </div>
        ) : null}
        {step===2 ? (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <h3 style={{margin:"0 0 4px",fontSize:14,fontWeight:600}}>Week themes</h3>
            <p style={{margin:"0 0 8px",fontSize:11,color:"#666"}}>Describe each week — drives all AI generation per column.</p>
            {Array.from({length:wc}).map((_,i)=>(
              <div key={i}><div style={{fontSize:11,color:"#666",marginBottom:4}}>Week {i+1}</div><Inp value={(draft.weekThemes||[])[i]||""} onChange={v=>{const t=[...(draft.weekThemes||[])];t[i]=v;upd("weekThemes",t);}} rows={2}/></div>
            ))}
          </div>
        ) : null}
        {step===3 ? (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <h3 style={{margin:"0 0 4px",fontSize:14,fontWeight:600}}>Player archetypes</h3>
            {(draft.archetypes||[]).map((a,i)=>(
              <div key={i} style={{padding:"10px 12px",border:"1px solid #e0e0dc",borderRadius:8,background:"white"}}>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <div style={{flex:1}}><div style={{fontSize:10,color:"#666",marginBottom:3}}>label</div><Inp value={a.label} onChange={v=>{const arr=[...draft.archetypes];arr[i]={...arr[i],label:v};upd("archetypes",arr);}}/></div>
                  <div><div style={{fontSize:10,color:"#666",marginBottom:3}}>colour</div><input type="color" value={a.color} onChange={e=>{const arr=[...draft.archetypes];arr[i]={...arr[i],color:e.target.value};upd("archetypes",arr);}} style={{width:40,height:36,borderRadius:5,border:BD,cursor:"pointer",padding:2}}/></div>
                </div>
                <div style={{fontSize:10,color:"#666",marginBottom:3}}>description (fed to AI)</div>
                <Inp value={a.description} onChange={v=>{const arr=[...draft.archetypes];arr[i]={...arr[i],description:v};upd("archetypes",arr);}} rows={2}/>
              </div>
            ))}
          </div>
        ) : null}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
          <Btn onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{fontSize:12,padding:"7px 16px"}}>← back</Btn>
          {step<STEPS.length-1
            ? <Btn onClick={()=>setStep(s=>s+1)} style={{fontSize:12,padding:"7px 16px",background:GN,color:"white",border:"none",borderRadius:8}}>next →</Btn>
            : <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)],{type:"application/json"}));a.download=(draft.name||"game")+"_config.json";a.click();}} style={{fontSize:12,padding:"7px 14px"}}>export JSON</Btn>
                <Btn onClick={()=>onLoad(draft)} style={{fontSize:12,padding:"7px 16px",background:GN,color:"white",border:"none",borderRadius:8}}>launch →</Btn>
              </div>}
        </div>
      </div>
    );
  }
  return null;
}

// ── Cell ───────────────────────────────────────────────────────────────────────
const LAYER_CFG = {
  scenario:    {color:GN, bg:GN3, accent:GN2, minH:80},
  experience:  {color:AM, bg:AM3, accent:AM2, minH:60},
  research:    {color:"#7a6a4a", bg:"#f5f0e8", accent:"#5a4a2a", minH:90},
  opportunity: {color:"#c4a832", bg:"#fdf8e0", accent:"#8a7010", minH:90},
};

function Cell({layer,content,loading,onGenerate,onEdit}) {
  const lc = LAYER_CFG[layer];
  const [editing,setEditing] = useState(false);
  const [draft,setDraft] = useState(content||"");
  useEffect(()=>{setDraft(content||"");setEditing(false);},[content]);

  if(loading) return (
    <div style={{background:"white",border:"1px solid #ddd",borderRadius:8,padding:10,minHeight:lc.minH,display:"flex",alignItems:"center",color:lc.color,fontSize:11,gap:6}}>
      <span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</span> generating...
    </div>
  );
  if(!content) return (
    <div onClick={onGenerate} style={{background:"white",border:"1px dashed #ccc",borderRadius:8,padding:10,minHeight:lc.minH,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#888"} onMouseLeave={e=>e.currentTarget.style.borderColor="#ccc"}>
      <div style={{fontSize:20,color:"#ccc",marginBottom:4}}>+</div>
      <div style={{fontSize:10,color:"#bbb"}}>click to generate</div>
    </div>
  );
  if(editing) return (
    <div style={{background:lc.bg,border:"2px solid "+lc.color,borderRadius:8,padding:"8px 10px",minHeight:lc.minH,display:"flex",flexDirection:"column",gap:6}}>
      <textarea autoFocus value={draft} onChange={e=>setDraft(e.target.value)} style={{flex:1,minHeight:lc.minH-36,fontSize:11,lineHeight:1.5,border:"none",background:"transparent",resize:"none",color:"#333",fontFamily:"-apple-system,sans-serif",padding:0,outline:"none",width:"100%",boxSizing:"border-box"}}/>
      <div style={{display:"flex",gap:5,justifyContent:"flex-end"}}>
        <button onClick={()=>{setDraft(content);setEditing(false);}} style={{fontSize:9,padding:"2px 8px",cursor:"pointer",color:"#666",background:"transparent",border:"0.5px solid #ccc",borderRadius:5}}>cancel</button>
        <button onClick={()=>{onEdit(draft);setEditing(false);}} style={{fontSize:9,padding:"2px 8px",cursor:"pointer",color:"white",background:lc.color,border:"none",borderRadius:5}}>save</button>
      </div>
    </div>
  );

  // render content
  let body;
  if(layer==="research") {
    const pos = (content.match(/POSITIVE:\s*(.+?)(?=NEGATIVE:|$)/)||[])[1]||"";
    const neg = (content.match(/NEGATIVE:\s*([\s\S]+)/)||[])[1]||"";
    body = (
      <div>
        {pos ? <div style={{marginBottom:5}}><span style={{background:GN3,color:GN2,fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:4}}>+ positive</span><p style={{margin:"3px 0 0",fontSize:10,color:GN2,lineHeight:1.4}}>{pos.trim()}</p></div> : null}
        {neg ? <div><span style={{background:"#fdeaea",color:"#a32d2d",fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:4}}>- risk</span><p style={{margin:"3px 0 0",fontSize:10,color:"#a32d2d",lineHeight:1.4}}>{neg.trim()}</p></div> : null}
      </div>
    );
  } else if(layer==="opportunity") {
    const opp = (content.match(/OPPORTUNITY:\s*(.+?)(?=DETAIL:|$)/)||[])[1]||"";
    const det = (content.match(/DETAIL:\s*([\s\S]+)/)||[])[1]||"";
    body = <div>{opp ? <p style={{margin:"0 0 4px",fontWeight:600,fontSize:11,color:lc.accent}}>{opp.trim()}</p> : null}{det ? <p style={{margin:0,fontSize:10,color:"#555",lineHeight:1.4}}>{det.trim()}</p> : null}</div>;
  } else {
    body = <p style={{margin:0,fontSize:11,lineHeight:1.5,color:lc.accent}}>{content}</p>;
  }

  return (
    <div style={{background:lc.bg,border:"1px solid "+lc.color,borderRadius:8,padding:"8px 10px",minHeight:lc.minH,position:"relative"}} onMouseEnter={e=>e.currentTarget.querySelector(".ca").style.opacity="1"} onMouseLeave={e=>e.currentTarget.querySelector(".ca").style.opacity="0"}>
      {body}
      <div className="ca" style={{position:"absolute",top:5,right:5,display:"flex",gap:4,opacity:0,transition:"opacity 0.15s"}}>
        <button onClick={()=>setEditing(true)} style={{fontSize:9,padding:"2px 6px",cursor:"pointer",background:"white",border:"0.5px solid "+lc.color,borderRadius:4,color:lc.accent}}>✏</button>
        <button onClick={onGenerate} style={{fontSize:9,padding:"2px 6px",cursor:"pointer",background:"white",border:"0.5px solid "+lc.color,borderRadius:4,color:lc.accent}}>↺</button>
      </div>
    </div>
  );
}

// ── Emotion Curve (static SVG, no hooks in loops) ─────────────────────────────
function EmotionCurve({sentScores,cfg,aNotes,eNotes,mode,visA,visE,actA,actE,setActA,setActE}) {
  const W=560,H=110,PL=28,PR=16,PT=16,PB=24;
  const iW=W-PL-PR, iH=H-PT-PB;
  const xOf = i => PL+i/(cfg.eventDuration-1)*iW;
  const yOf = v => PT+iH-(v*iH);
  const toD = vals => vals.map((v,i)=>(i===0?"M":"L")+xOf(i).toFixed(1)+","+yOf(Math.max(0,Math.min(1,v))).toFixed(1)).join(" ");
  const WEEKS = Array.from({length:cfg.eventDuration},(_,i)=>i);

  const sentVals = WEEKS.map(i=>sentScores[i]!==null?sentScores[i]:0.6);

  return (
    <svg width="100%" viewBox={"0 0 "+W+" "+H} style={{display:"block"}}>
      <line x1={PL} y1={PT} x2={PL} y2={PT+iH} stroke="#eee" strokeWidth="0.5"/>
      <line x1={PL} y1={PT+iH} x2={W-PR} y2={PT+iH} stroke="#eee" strokeWidth="0.5"/>
      <line x1={PL} y1={PT+iH/2} x2={W-PR} y2={PT+iH/2} stroke="#eee" strokeWidth="0.5" strokeDasharray="3 3"/>
      <text x={PL-3} y={PT+iH} fontSize="8" fill="#bbb" textAnchor="end">low</text>
      <text x={PL-3} y={PT+4} fontSize="8" fill="#bbb" textAnchor="end">high</text>

      {mode==="archetype" ? cfg.archetypes.map(a => {
        if(!visA[a.id]) return null;
        const vals = WEEKS.map(i=>{const k=a.id+"-"+i;return aNotes[k]?scoreSent(aNotes[k]):a.curve[i];});
        const isAct = actA===a.id;
        return (
          <g key={a.id} onClick={()=>setActA(a.id)} style={{cursor:"pointer"}}>
            <path d={toD(vals)} fill="none" stroke={a.color} strokeWidth={isAct?2.5:1.5} strokeOpacity={isAct?1:0.5}/>
            {vals.map((v,i)=>(
              <circle key={i} cx={xOf(i)} cy={yOf(Math.max(0,Math.min(1,v)))} r={isAct?5:3} fill="white" stroke={a.color} strokeWidth={isAct?2:1.5} strokeOpacity={isAct?1:0.6}/>
            ))}
          </g>
        );
      }) : null}

      {mode==="engagement" ? cfg.engagementLevels.map(e => {
        if(!visE[e.id]) return null;
        const vals = WEEKS.map(i=>{const k="eng-"+e.id+"-"+i;return eNotes[k]?scoreSent(eNotes[k]):e.curve[i];});
        const isAct = actE===e.id;
        return (
          <g key={e.id} onClick={()=>setActE(e.id)} style={{cursor:"pointer"}}>
            <path d={toD(vals)} fill="none" stroke={e.color} strokeWidth={isAct?2.5:1.5} strokeOpacity={isAct?1:0.5}/>
            {vals.map((v,i)=>(
              <circle key={i} cx={xOf(i)} cy={yOf(Math.max(0,Math.min(1,v)))} r={isAct?5:3} fill="white" stroke={e.color} strokeWidth={isAct?2:1.5} strokeOpacity={isAct?1:0.6}/>
            ))}
          </g>
        );
      }) : null}

      <path d={toD(sentVals)} fill="none" stroke={AM} strokeWidth="1.5" strokeDasharray="5 4" strokeOpacity="0.5"/>
      {sentVals.map((v,i)=>(
        <circle key={i} cx={xOf(i)} cy={yOf(Math.max(0,Math.min(1,v)))} r="3" fill="white" stroke={AM} strokeWidth="1" strokeOpacity="0.5"/>
      ))}
    </svg>
  );
}

// ── Gap Tracker ────────────────────────────────────────────────────────────────
const GSTATUS = [{id:"open",label:"Open",color:"#c0392b",bg:"#fdeaea"},{id:"in progress",label:"In Progress",color:AM,bg:AM3},{id:"closed",label:"Closed",color:GN,bg:GN3}];

function GapTracker({cfg,cells,initGaps}) {
  const [gaps,setGaps] = useState(initGaps || INIT_GAPS);
  const [filter,setFilter] = useState("all");
  const [editing,setEditing] = useState(null);
  const [adding,setAdding] = useState(false);
  const [newG,setNewG] = useState({gap:"",cat:"Design TBD",week:"",owner:"",status:"open",blocks:"",notes:""});
  const [aiLoad,setAiLoad] = useState(false);

  const upd = (id,k,v) => setGaps(gs=>gs.map(g=>g.id===id?{...g,[k]:v}:g));
  const shown = filter==="all"?gaps:gaps.filter(g=>g.status===filter);
  const ct = s => gaps.filter(g=>g.status===s).length;
  const CATS = ["Design TBD","Economy","Asset Dep.","Narrative","Technical"];

  const aiScan = async () => {
    setAiLoad(true);
    try {
      const scenes = Object.entries(cells).filter(([k])=>k.startsWith("scenario-")).map(([k,v])=>"W"+(parseInt(k.split("-")[1])+1)+": "+v).join("\n");
      const have = gaps.map(g=>g.gap).join(", ");
      const txt = await callAI("Senior game producer reviewing "+cfg.name+".\n\nSCENARIOS:\n"+scenes+"\n\nEXISTING: "+have+"\n\nIdentify up to 3 NEW design gaps. Return ONLY valid JSON array: [{\"gap\":\"...\",\"cat\":\"Design TBD\",\"week\":\"W1\",\"owner\":\"TBD\",\"status\":\"open\",\"blocks\":\"...\",\"notes\":\"...\"}]", 800);
      const cleaned = txt.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(cleaned);
      const maxId = Math.max(...gaps.map(g=>g.id));
      setGaps(gs=>[...gs,...parsed.map((g,i)=>({...g,id:maxId+i+1}))]);
    } catch(e) { console.error("AI scan:",e); }
    setAiLoad(false);
  };

  const exportCSV = () => {
    const rows = ["Gap,Category,Week,Owner,Status,Blocks,Notes",...gaps.map(g=>[g.gap,g.cat,g.week,g.owner,g.status,g.blocks,g.notes].map(v=>'"'+(v||"").replace(/"/g,'""')+'"').join(","))].join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([rows],{type:"text/csv"}));a.download=cfg.name.replace(/\s+/g,"_")+"_gaps.csv";a.click();
  };

  const finp = {fontSize:11,padding:"4px 8px",borderRadius:5,border:BD,background:"#f9f9f7",width:"100%",boxSizing:"border-box"};

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",gap:6}}>
          {GSTATUS.map(s=>(
            <div key={s.id} onClick={()=>setFilter(filter===s.id?"all":s.id)} style={{color:s.color,background:s.bg,fontSize:11,fontWeight:600,padding:"3px 12px",borderRadius:20,cursor:"pointer",opacity:filter!=="all"&&filter!==s.id?0.4:1}}>{ct(s.id)} {s.id}</div>
          ))}
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          <button onClick={aiScan} disabled={aiLoad} style={{fontSize:11,padding:"5px 12px",cursor:"pointer",color:"#534AB7",border:"0.5px solid #534AB7",borderRadius:6,background:"#EEEDFE"}}>{aiLoad?"scanning...":"AI scan ↗"}</button>
          <button onClick={()=>setAdding(a=>!a)} style={{fontSize:11,padding:"5px 12px",cursor:"pointer",background:GN,color:"white",border:"none",borderRadius:6}}>{adding?"cancel":"+ add"}</button>
          <button onClick={exportCSV} style={{fontSize:11,padding:"5px 12px",cursor:"pointer"}}>CSV ↓</button>
        </div>
      </div>

      {adding ? (
        <div style={{background:"white",border:"1px solid "+GN,borderRadius:10,padding:"14px 16px",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:10}}>New gap</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
            <div><div style={{fontSize:9,color:"#666",marginBottom:2}}>gap</div><input value={newG.gap} onChange={e=>setNewG(g=>({...g,gap:e.target.value}))} style={finp}/></div>
            <div><div style={{fontSize:9,color:"#666",marginBottom:2}}>category</div><select value={newG.cat} onChange={e=>setNewG(g=>({...g,cat:e.target.value}))} style={finp}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><div style={{fontSize:9,color:"#666",marginBottom:2}}>week</div><input value={newG.week} onChange={e=>setNewG(g=>({...g,week:e.target.value}))} style={finp}/></div>
            <div><div style={{fontSize:9,color:"#666",marginBottom:2}}>owner</div><input value={newG.owner} onChange={e=>setNewG(g=>({...g,owner:e.target.value}))} style={finp}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            <div><div style={{fontSize:9,color:"#666",marginBottom:2}}>blocks</div><input value={newG.blocks} onChange={e=>setNewG(g=>({...g,blocks:e.target.value}))} style={finp}/></div>
            <div><div style={{fontSize:9,color:"#666",marginBottom:2}}>notes</div><input value={newG.notes} onChange={e=>setNewG(g=>({...g,notes:e.target.value}))} style={finp}/></div>
          </div>
          <button onClick={()=>{if(!newG.gap.trim())return;setGaps(gs=>[...gs,{...newG,id:Math.max(...gs.map(g=>g.id))+1}]);setAdding(false);setNewG({gap:"",cat:"Design TBD",week:"",owner:"",status:"open",blocks:"",notes:"",});}} style={{fontSize:11,padding:"5px 16px",cursor:"pointer",background:GN,color:"white",border:"none",borderRadius:6}}>add</button>
        </div>
      ) : null}

      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {shown.length===0 ? <div style={{fontSize:12,color:"#666",padding:"24px 0",textAlign:"center"}}>No gaps match this filter.</div> : null}
        {shown.map(g=>{
          const s = GSTATUS.find(x=>x.id===g.status)||GSTATUS[0];
          const isE = editing===g.id;
          return (
            <div key={g.id} style={{background:"white",border:BD,borderLeft:"3px solid "+s.color,borderRadius:8,padding:"10px 14px"}}>
              {isE ? (
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
                    <div><div style={{fontSize:9,color:"#666",marginBottom:2}}>gap</div><input value={g.gap} onChange={e=>upd(g.id,"gap",e.target.value)} style={finp}/></div>
                    <div><div style={{fontSize:9,color:"#666",marginBottom:2}}>category</div><select value={g.cat} onChange={e=>upd(g.id,"cat",e.target.value)} style={finp}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
                    <div><div style={{fontSize:9,color:"#666",marginBottom:2}}>week</div><input value={g.week} onChange={e=>upd(g.id,"week",e.target.value)} style={finp}/></div>
                    <div><div style={{fontSize:9,color:"#666",marginBottom:2}}>owner</div><input value={g.owner} onChange={e=>upd(g.id,"owner",e.target.value)} style={finp}/></div>
                    <div><div style={{fontSize:9,color:"#666",marginBottom:2}}>status</div><select value={g.status} onChange={e=>upd(g.id,"status",e.target.value)} style={finp}>{GSTATUS.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setEditing(null)} style={{fontSize:10,padding:"3px 12px",cursor:"pointer",background:GN,color:"white",border:"none",borderRadius:5}}>done</button>
                    <button onClick={()=>{setGaps(gs=>gs.filter(x=>x.id!==g.id));setEditing(null);}} style={{fontSize:10,padding:"3px 12px",cursor:"pointer",color:"#c0392b",border:"0.5px solid #c0392b",borderRadius:5,background:"transparent"}}>delete</button>
                  </div>
                </div>
              ) : (
                <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"start"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:12,fontWeight:600}}>{g.gap}</span>
                      <span style={{color:s.color,background:s.bg,fontSize:9,padding:"1px 7px",borderRadius:10,fontWeight:600}}>{g.status}</span>
                      <span style={{fontSize:9,color:"#666",background:"#f5f5f2",padding:"1px 6px",borderRadius:8}}>{g.cat}</span>
                      {g.week ? <span style={{fontSize:9,color:"#666"}}>{g.week}</span> : null}
                      {g.owner ? <span style={{fontSize:9,color:"#666"}}>· {g.owner}</span> : null}
                    </div>
                    {g.blocks ? <div style={{fontSize:10,color:"#c0392b",marginBottom:3}}>blocks: {g.blocks}</div> : null}
                    {g.notes ? <div style={{fontSize:10,color:"#666",lineHeight:1.5}}>{g.notes}</div> : null}
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    {g.status==="open" ? <button onClick={()=>upd(g.id,"status","in progress")} style={{fontSize:9,padding:"2px 8px",cursor:"pointer",color:AM,border:"0.5px solid "+AM,borderRadius:5,background:"transparent",whiteSpace:"nowrap"}}>→ in progress</button> : null}
                    {g.status==="in progress" ? <button onClick={()=>upd(g.id,"status","closed")} style={{fontSize:9,padding:"2px 8px",cursor:"pointer",color:GN,border:"0.5px solid "+GN,borderRadius:5,background:"transparent",whiteSpace:"nowrap"}}>→ close</button> : null}
                    {g.status==="closed" ? <button onClick={()=>upd(g.id,"status","open")} style={{fontSize:9,padding:"2px 8px",cursor:"pointer",color:"#888",border:"0.5px solid #ccc",borderRadius:5,background:"transparent"}}>reopen</button> : null}
                    <button onClick={()=>setEditing(isE?null:g.id)} style={{fontSize:9,padding:"2px 8px",cursor:"pointer",color:"#666",border:"0.5px solid #ccc",borderRadius:5,background:"transparent"}}>edit</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Session Validator ──────────────────────────────────────────────────────────
const SPARAMS = {minsPerStage:{min:30,max:40,lbl:"Time per stage",unit:"min"},stagesPerTrack:{min:4,max:4,lbl:"Stages per track",unit:"stages"},tracksW1:{min:2,max:2,lbl:"Tracks in W1",unit:"tracks"},tracksW2:{min:2,max:2,lbl:"Tracks in W2",unit:"tracks"},sessionMin:{min:20,max:45,lbl:"Typical session",unit:"min",budget:true},daysPerWeek:{min:4,max:7,lbl:"Active days/week",unit:"days",budget:true}};
const SSEG = [{id:"new",lbl:"New Player",color:"#1D9E75",mult:0.75,rate:0.35},{id:"mid",lbl:"Midlevel",color:"#534AB7",mult:1.0,rate:0.70},{id:"endgame",lbl:"Endgame",color:"#D85A30",mult:1.3,rate:0.95},{id:"collector",lbl:"Collector",color:"#185FA5",mult:1.2,rate:0.90},{id:"social",lbl:"Social",color:"#9E3F8E",mult:0.8,rate:0.45}];

function SessionValidator({paramDefs}) {
  const DEFS = paramDefs || SPARAMS;
  const [params,setParams] = useState(()=>Object.fromEntries(Object.entries(DEFS).map(([k,v])=>[k,{min:v.min,max:v.max}])));
  const [pessimistic,setPessimistic] = useState(false);
  const [activeSeg,setActiveSeg] = useState("mid");
  const v = k => {
    const isBudget = !!DEFS[k].budget;
    // optimistic: low cost, high budget. pessimistic: high cost, low budget.
    if(pessimistic) return isBudget ? params[k].min : params[k].max;
    return isBudget ? params[k].max : params[k].min;
  };
  const mpd = v("stagesPerTrack")*v("minsPerStage");
  const mAll = (v("tracksW1")+v("tracksW2"))*mpd;
  const segs = SSEG.map(s=>{
    const b=v("sessionMin")*s.mult*v("daysPerWeek"),w1=Math.min(1,b/(v("tracksW1")*mpd))*s.rate,w2=Math.min(1,b/(v("tracksW2")*mpd))*s.rate;
    const elders=Math.min(4,Math.round((w1+w2)*4)),canMerge=elders>=1&&w1>0.3&&w2>0.3;
    return {...s,budget:Math.round(b),elders,canMerge,canGolden:s.rate>=0.85&&canMerge};
  });
  const act = segs.find(s=>s.id===activeSeg);
  const reachPct = Math.round(segs.filter(s=>s.canMerge).length/segs.length*100)+"%";

  const tColor = (m,warn,bad) => m>=bad?"#c0392b":m>=warn?AM:GN;
  const tColorInv = (v,warn,bad) => v<=bad?"#c0392b":v<=warn?AM:GN;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:13,fontWeight:600}}>Session Time Validator</div>
          <div style={{fontSize:11,color:"#666"}}>How much time does this event ask of players? All values are ballpark estimates.</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setPessimistic(false)} style={{fontSize:10,padding:"3px 10px",borderRadius:10,cursor:"pointer",background:!pessimistic?GN:"#f5f5f2",color:!pessimistic?"white":"#666",border:BD}}>optimistic</button>
          <button onClick={()=>setPessimistic(true)} style={{fontSize:10,padding:"3px 10px",borderRadius:10,cursor:"pointer",background:pessimistic?"#c0392b":"#f5f5f2",color:pessimistic?"white":"#666",border:BD}}>pessimistic</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"250px 1fr",gap:14}}>
        <div style={{background:"white",border:BD,borderRadius:10,padding:"14px 16px"}}>
          <div style={{fontSize:11,fontWeight:600,marginBottom:10}}>GDD parameters</div>
          {Object.entries(DEFS).map(([k,def])=>(
            <div key={k} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}>
                <span style={{fontWeight:600}}>{def.lbl}</span>
                <span style={{color:"#999",fontSize:9}}>{params[k].min}–{params[k].max} {def.unit}</span>
              </div>
              <div style={{display:"flex",gap:6}}>
                {["min","max"].map(mm=>(
                  <div key={mm} style={{flex:1}}>
                    <div style={{fontSize:9,color:"#999"}}>{mm}</div>
                    <input type="range" min={1} max={k.includes("Min")?180:10} value={params[k][mm]} onChange={e=>setParams(p=>({...p,[k]:{...p[k],[mm]:mm==="min"?Math.min(parseInt(e.target.value),p[k].max):Math.max(parseInt(e.target.value),p[k].min)}}))} style={{width:"100%",accentColor:mm==="min"?GN:"#534AB7"}}/>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            <SBox label="Time per track" val={fmtT(mpd)} color={tColor(mpd,120,180)}/>
            <SBox label="All 4 tracks" val={fmtT(mAll)} color={tColor(mAll,360,600)}/>
            <SBox label="Segments reaching merge" val={reachPct} color={tColorInv(segs.filter(s=>s.canMerge).length/segs.length,0.6,0.4)}/>
          </div>
          <div style={{background:"white",border:BD,borderRadius:10,padding:"12px 14px"}}>
            <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
              {segs.map(s=><button key={s.id} onClick={()=>setActiveSeg(s.id)} style={{fontSize:10,padding:"4px 12px",borderRadius:12,cursor:"pointer",background:activeSeg===s.id?s.color:"#f5f5f2",color:activeSeg===s.id?"white":"#666",border:BD}}>{s.lbl}</button>)}
            </div>
            {act ? (
              <div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:10}}>
                  <SBox label="Weekly time budget" val={fmtT(act.budget)} color={act.color}/>
                  <SBox label="Final tier by W3" val={act.elders+"/4"} color={act.elders>=1?GN:"#c0392b"}/>
                  <SBox label="Reaches gate?" val={act.canMerge?"✓":"✗"} color={act.canMerge?GN:"#c0392b"}/>
                  <SBox label="Stretch reward?" val={act.canGolden?"✓":"✗"} color={act.canGolden?GN:"#c0392b"}/>
                </div>
                {!act.canMerge ? <div style={{fontSize:10,color:"#c0392b",background:"#fdeaea",padding:"6px 10px",borderRadius:6}}>⚠ {act.lbl} players may not reach the W3 gate. Key risk: only one track at final tier is required but all four must be owned — UI clarity is critical.</div> : null}
                {act.canMerge&&act.canGolden ? <div style={{fontSize:10,color:GN,background:GN3,padding:"6px 10px",borderRadius:6}}>✓ {act.lbl} can reach all milestones including the stretch reward.</div> : null}
                {act.canMerge&&!act.canGolden ? <div style={{fontSize:10,color:AM2,background:AM3,padding:"6px 10px",borderRadius:6}}>◎ {act.lbl} can pass the gate but not reach the stretch reward.</div> : null}
              </div>
            ) : null}
          </div>
          <div style={{background:"white",border:BD,borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontSize:11,fontWeight:600,marginBottom:8}}>All segments</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
              <thead><tr style={{borderBottom:BD}}>{["Segment","Budget","Final tier","Gate?","Stretch?"].map(h=><th key={h} style={{textAlign:"left",padding:"5px 8px",fontWeight:600,color:"#666",fontSize:9}}>{h}</th>)}</tr></thead>
              <tbody>
                {segs.map(s=>(
                  <tr key={s.id} onClick={()=>setActiveSeg(s.id)} style={{borderBottom:BD,cursor:"pointer",background:activeSeg===s.id?"#f5f5f2":"transparent"}}>
                    <td style={{padding:"6px 8px",fontWeight:600,color:s.color}}>{s.lbl}</td>
                    <td style={{padding:"6px 8px"}}>{fmtT(s.budget)}</td>
                    <td style={{padding:"6px 8px",color:s.elders>=2?GN:s.elders>=1?AM:"#c0392b",fontWeight:600}}>{s.elders}/4</td>
                    <td style={{padding:"6px 8px",color:s.canMerge?GN:"#c0392b",fontWeight:600}}>{s.canMerge?"✓":"✗"}</td>
                    <td style={{padding:"6px 8px",color:s.canGolden?GN:"#c0392b",fontWeight:600}}>{s.canGolden?"✓":"✗"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Risk Heatmap ───────────────────────────────────────────────────────────────
const HSEGS = [{id:"collector",lbl:"Collector",type:"archetype"},{id:"social",lbl:"Social/Casual",type:"archetype"},{id:"trader",lbl:"Trader",type:"archetype"},{id:"new",lbl:"New Player",type:"engagement"},{id:"mid",lbl:"Midlevel",type:"engagement"},{id:"endgame",lbl:"Endgame",type:"engagement"}];
const RNOTES = {"social-3":"Highest churn risk: fatigue stretch meets weakest motivation archetype. Solo-friendly daily path critical.","new-2":"Showcase gate risk: only one gold school required, but if the UI reads as all four, new players abandon before trying.","social-2":"Showcase requires sustained W1+W2 mastery work that social players may not have banked.","trader-4":"W5 token exchange opens the ingredient market: the biggest engagement moment for this archetype.","new-3":"Dinner Rush wave format overwhelms new players without a pre-service brief."};

function RiskHeatmap({cfg,aNotes,eNotes,isDemo}) {
  const [sel,setSel] = useState(null);
  const [src,setSrc] = useState("combined");
  const N = cfg.eventDuration;
  const WEEKS = Array.from({length:N},(_,i)=>i);

  const getScore = (seg,wi) => {
    const key = seg.type==="archetype"?seg.id+"-"+wi:"eng-"+seg.id+"-"+wi;
    const txt = seg.type==="archetype"?aNotes[key]:eNotes[key];
    const sent = txt ? scoreSent(txt) : null;
    const sent2risk = sent===null?null:1-sent;
    const gdd = GDD_RISK[seg.id]?.[wi]??null;
    if(src==="sentiment") return sent2risk;
    if(src==="gdd") return gdd;
    if(sent2risk!==null&&gdd!==null) return (sent2risk*0.45+gdd*0.55);
    return sent2risk!==null?sent2risk:gdd;
  };

  const CW=80,CH=44,LW=112,SVG_W=LW+N*CW+10,SVG_H=30+HSEGS.length*CH+8;

  const selSeg = sel?HSEGS.find(s=>sel.startsWith(s.id+"_")||sel===s.id+"_"+sel.split("_")[1]):null;
  const selWi = sel?parseInt(sel.split("_")[1]):null;
  const selScore = selSeg!==null&&selWi!==null?getScore(selSeg,selWi):null;

  const all = [];
  HSEGS.forEach(seg=>WEEKS.forEach(wi=>{const sc=getScore(seg,wi);if(sc!==null)all.push({seg:seg.id,wi,sc,lbl:seg.lbl+"/W"+(wi+1)});}));
  const top = [...all].sort((a,b)=>b.sc-a.sc).slice(0,3);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div><div style={{fontSize:13,fontWeight:600}}>Risk Heatmap</div><div style={{fontSize:11,color:"#666"}}>Week × player segment — combined GDD + sentiment scoring</div></div>
        <div style={{display:"flex",gap:5}}>
          {[{id:"combined",lbl:"combined"},{id:"gdd",lbl:"GDD only"},{id:"sentiment",lbl:"sentiment only"}].map(x=>(
            <button key={x.id} onClick={()=>setSrc(x.id)} style={{fontSize:10,padding:"3px 10px",borderRadius:10,cursor:"pointer",background:src===x.id?GN:"#f5f5f2",color:src===x.id?"white":"#666",border:BD}}>{x.lbl}</button>
          ))}
        </div>
      </div>

      {top.length>0 ? (
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:10,fontWeight:600,color:"#666"}}>top risks:</span>
          {top.map((r,i)=>(
            <div key={i} onClick={()=>setSel(r.seg+"_"+r.wi)} style={{fontSize:10,padding:"3px 10px",borderRadius:8,cursor:"pointer",background:riskColor(r.sc)+"22",border:"1px solid "+riskColor(r.sc),color:riskColor(r.sc),fontWeight:600}}>{r.lbl} — {riskLabel(r.sc)}</div>
          ))}
        </div>
      ) : null}

      <div style={{overflowX:"auto",borderRadius:10,border:BD,background:"#f7f7f5",marginBottom:10}}>
        <svg width={SVG_W} height={SVG_H} style={{display:"block"}}>
          {WEEKS.map(wi=>(
            <g key={wi}>
              <rect x={LW+wi*CW} y={0} width={CW-2} height={26} fill={GN} rx="4"/>
              <text x={LW+wi*CW+CW/2-1} y={17} textAnchor="middle" fontSize="11" fill="white" fontWeight="600">Week {wi+1}</text>
            </g>
          ))}
          {HSEGS.map((seg,si)=>(
            <g key={seg.id}>
              <rect x={0} y={30+si*CH} width={LW-4} height={CH-2} fill="white" rx="4"/>
              <text x={8} y={30+si*CH+15} fontSize="10" fill="#1a1a1a" fontWeight="600">{seg.lbl}</text>
              <text x={8} y={30+si*CH+27} fontSize="8" fill="#999">{seg.type}</text>
              {WEEKS.map(wi=>{
                const sc = getScore(seg,wi);
                const ck = seg.id+"_"+wi;
                const isSel = sel===ck;
                const fc = sc!==null?riskColor(sc):"#ccc";
                return (
                  <g key={wi} onClick={()=>setSel(isSel?null:ck)} style={{cursor:"pointer"}}>
                    <rect x={LW+wi*CW+1} y={30+si*CH+1} width={CW-4} height={CH-4} fill={fc} fillOpacity={sc!==null?0.7:0.2} rx="5" stroke={isSel?"#333":"none"} strokeWidth={isSel?2:0}/>
                    {sc!==null ? (
                      <g>
                        <text x={LW+wi*CW+CW/2-1} y={30+si*CH+19} textAnchor="middle" fontSize="12" fontWeight="700" fill="white">{Math.round(sc*100)}</text>
                        <text x={LW+wi*CW+CW/2-1} y={30+si*CH+31} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.9)">{riskLabel(sc)}</text>
                      </g>
                    ) : (
                      <text x={LW+wi*CW+CW/2-1} y={30+si*CH+24} textAnchor="middle" fontSize="9" fill="#aaa">—</text>
                    )}
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      {sel&&selSeg&&selWi!==null ? (
        <div style={{background:"white",border:"2px solid "+(selScore!==null?riskColor(selScore):"#ccc"),borderRadius:10,padding:"14px 16px",marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:600}}>{selSeg.lbl} — Week {selWi+1}</span>
              {selScore!==null ? <span style={{fontSize:11,padding:"2px 10px",borderRadius:10,fontWeight:600,background:riskColor(selScore)+"22",color:riskColor(selScore),border:"1px solid "+riskColor(selScore)}}>{riskLabel(selScore)} · {Math.round(selScore*100)}</span> : null}
            </div>
            <button onClick={()=>setSel(null)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:16,color:"#666"}}>✕</button>
          </div>
          {!isDemo && RNOTES[selSeg.id+"-"+selWi] ? (
            <div style={{fontSize:11,color:selScore!==null?riskColor(selScore):"#333",background:selScore!==null?riskColor(selScore)+"11":"#f5f5f2",padding:"8px 12px",borderRadius:6,lineHeight:1.6}}>
              <strong>Design note: </strong>{RNOTES[selSeg.id+"-"+selWi]}
            </div>
          ) : (
            <div style={{fontSize:10,color:"#666",fontStyle:"italic"}}>No specific design note for this cell. Generate archetype/engagement notes on the journey map tab to populate sentiment scoring.</div>
          )}
        </div>
      ) : null}
      <div style={{fontSize:10,color:"#666",padding:"8px 12px",background:"#f7f7f5",borderRadius:8}}>Combined view: GDD risk (55%) + sentiment from generated notes (45%). Generate archetype notes on the journey map tab to improve sentiment data.</div>
    </div>
  );
}

// ── Data Forecast ──────────────────────────────────────────────────────────────
function DataForecast({cfg,sentScores,demoActuals}) {
  const [fc,setFc] = useState(null);
  const [metric,setMetric] = useState("mau");
  const [viewMode,setViewMode] = useState("forecast"); // "forecast" | "actual" | "compare"
  const [live,setLive] = useState(null);
  const [liveLoading,setLiveLoading] = useState(false);
  const [liveNote,setLiveNote] = useState("");
  const WEEKS = Array.from({length:cfg.eventDuration},(_,i)=>"Week "+(i+1));

  const fetchLive = async () => {
    if(!cfg.robloxGameId){setLiveNote("No game ID in config. Add one to enable live stats.");return;}
    setLiveLoading(true); setLiveNote("");
    try {
      // Attempt 1: direct platform API (usually blocked by CORS in browser)
      const res = await fetch("https://games.roblox.com/v1/games?universeIds="+cfg.robloxGameId);
      if(!res.ok) throw new Error("HTTP "+res.status);
      const data = await res.json();
      const game = data.data ? data.data[0] : null;
      if(!game) throw new Error("No game data");
      setLive({playing:game.playing,visits:game.visits,source:"live"});
      setLiveNote("Live platform data.");
    } catch(e1) {
      try {
        // Attempt 2: AI estimate from training knowledge
        const prompt = "Based on your knowledge of the Roblox game with universe ID "+cfg.robloxGameId+" (context: "+cfg.gameContext.slice(0,200)+"), return ONLY a JSON object, no markdown, shaped like {\"playing\":10000,\"visits\":250000000}. Best realistic estimates.";
        const txt = await callAI(prompt,200);
        const parsed = JSON.parse(txt.replace(/```json|```/g,"").trim());
        setLive({playing:parsed.playing,visits:parsed.visits,source:"ai"});
        setLiveNote("Platform API blocked by CORS. Showing AI estimate.");
      } catch(e2) {
        // Attempt 3: config baseline
        setLive({playing:cfg.baselineCCU,visits:cfg.lifetimeVisits||0,source:"config"});
        setLiveNote("Live fetch and AI estimate both failed. Showing config baseline.");
      }
    }
    setLiveLoading(false);
  };

  // actual data state — editable per week
  const [actual,setActual] = useState(()=>demoActuals ? demoActuals.map(a=>({...a})) : Array.from({length:cfg.eventDuration},()=>({
    mau:"", session:"", d1:"", d7:"", d30:""
  })));
  const setActualField = (wi,field,val) => setActual(a=>a.map((row,i)=>i===wi?{...row,[field]:val}:row));

  const run = () => {
    const baseCCU = live && live.playing ? live.playing : cfg.baselineCCU;
    const mau = WEEKS.map((_,i)=>Math.round(baseCCU*cfg.eventCCUMultipliers[i]*90));
    const smod = WEEKS.map((_,i)=>sentScores[i]!==null?0.8+sentScores[i]*0.4:1.0);
    const session = WEEKS.map((_,i)=>Math.round(cfg.sessionBaselineMin*cfg.sessionTimeMultipliers[i]*smod[i]));
    const hours = mau.map((m,i)=>Math.round(m*session[i]/60));
    const ret = WEEKS.map((_,i)=>({d1:Math.round(cfg.retentionD1[i]*100),d7:Math.round(cfg.retentionD7[i]*100),d30:Math.round(cfg.retentionD30[i]*100)}));
    setFc({mau,session,hours,ret});
  };

  const maxOf = arr => Math.max(...arr,1);

  // variance: positive = above forecast (good for MAU/session), color accordingly
  const variance = (fcVal,actVal) => {
    if(!actVal||isNaN(Number(actVal))) return null;
    return Math.round((Number(actVal)-fcVal)/fcVal*100);
  };
  const varColor = (v,invert=false) => {
    if(v===null) return "#999";
    if(invert) v = -v;
    return v>=10?GN:v>=-10?AM:"#c0392b";
  };
  const varLabel = v => v===null?"—":v>0?"+"+v+"%":v+"%";

  const ainp = {fontSize:11,padding:"4px 6px",border:BD,borderRadius:5,background:"#f9f9f7",width:"100%",boxSizing:"border-box",textAlign:"center"};

  return (
    <div>
      {/* baseline card with live pull */}
      <div style={{background:"white",border:BD,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:600}}>Baseline data</div>
          <button onClick={fetchLive} disabled={liveLoading} style={{fontSize:10,padding:"4px 12px",cursor:"pointer",background:"#EEEDFE",color:"#534AB7",border:"0.5px solid #534AB7",borderRadius:6}}>{liveLoading?"fetching...":"pull live stats ↗"}</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          <SBox label={live?"Live CCU":"Baseline CCU"} val={fmtN(live?live.playing:cfg.baselineCCU)} color={GN} note={live?(live.source==="live"?"platform API":live.source==="ai"?"AI estimate":"config fallback"):"from config"}/>
          <SBox label="Lifetime visits" val={live&&live.visits?fmtN(live.visits):cfg.lifetimeVisits?fmtN(cfg.lifetimeVisits):"—"} color="#185FA5" note={live?"":"from config"}/>
          <SBox label="Session baseline" val={cfg.sessionBaselineMin+"m"} color="#534AB7"/>
          <SBox label="Event duration" val={cfg.eventDuration+" weeks"} color={AM2}/>
        </div>
        {liveNote ? <div style={{marginTop:8,fontSize:10,color:live&&live.source==="live"?GN:"#8b5a1f",background:live&&live.source==="live"?GN3:AM3,padding:"5px 10px",borderRadius:6}}>{liveNote}</div> : null}
      </div>

      {/* controls */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
        <button onClick={run} style={{fontSize:12,padding:"7px 18px",cursor:"pointer",background:GN,color:"white",border:"none",borderRadius:8}}>run forecast ↗</button>
        <div style={{display:"flex",gap:0}}>
          {[{id:"forecast",lbl:"forecast"},{id:"actual",lbl:"enter actuals"},{id:"compare",lbl:"compare"}].map((m,mi)=>(
            <button key={m.id} onClick={()=>setViewMode(m.id)} style={{fontSize:11,padding:"5px 12px",cursor:"pointer",background:viewMode===m.id?GN:"#f5f5f2",color:viewMode===m.id?"white":"#666",border:BD,borderRadius:mi===0?"8px 0 0 8px":mi===2?"0 8px 8px 0":"0"}}>{m.lbl}</button>
          ))}
        </div>
        {viewMode==="compare"&&!fc ? <span style={{fontSize:11,color:"#c0392b"}}>Run forecast first to compare.</span> : null}
      </div>

      {/* enter actuals view */}
      {viewMode==="actual" ? (
        <div style={{background:"white",border:BD,borderRadius:10,padding:"14px 16px"}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:4}}>Enter actual event data</div>
          <div style={{fontSize:11,color:"#666",marginBottom:14}}>Fill in as weeks go live. Leave blank for weeks that haven't run yet.</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead>
              <tr style={{borderBottom:BD}}>
                <th style={{textAlign:"left",padding:"6px 8px",fontWeight:600,color:"#666",fontSize:10}}>Week</th>
                <th style={{textAlign:"center",padding:"6px 8px",fontWeight:600,color:GN,fontSize:10}}>MAU</th>
                <th style={{textAlign:"center",padding:"6px 8px",fontWeight:600,color:AM,fontSize:10}}>Avg Session (min)</th>
                <th style={{textAlign:"center",padding:"6px 8px",fontWeight:600,color:"#534AB7",fontSize:10}}>D1 Ret %</th>
                <th style={{textAlign:"center",padding:"6px 8px",fontWeight:600,color:"#534AB7",fontSize:10}}>D7 Ret %</th>
                <th style={{textAlign:"center",padding:"6px 8px",fontWeight:600,color:"#534AB7",fontSize:10}}>D30 Ret %</th>
              </tr>
            </thead>
            <tbody>
              {WEEKS.map((w,i)=>(
                <tr key={i} style={{borderBottom:BD}}>
                  <td style={{padding:"8px",fontWeight:600}}>{w}</td>
                  {["mau","session","d1","d7","d30"].map(field=>(
                    <td key={field} style={{padding:"4px 8px"}}>
                      <input
                        type="number"
                        value={actual[i][field]}
                        onChange={e=>setActualField(i,field,e.target.value)}
                        placeholder="—"
                        style={ainp}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop:10,fontSize:10,color:"#999"}}>MAU and session values are absolute numbers. Retention values are percentages (e.g. 38 for 38%).</div>
        </div>
      ) : null}

      {/* forecast view */}
      {viewMode==="forecast"&&fc ? (
        <div style={{background:"white",border:BD,borderRadius:10,padding:"14px 16px"}}>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {[{id:"mau",lbl:"MAU"},{id:"session",lbl:"Session"},{id:"hours",lbl:"Engagement"},{id:"ret",lbl:"Retention"}].map(t=>(
              <button key={t.id} onClick={()=>setMetric(t.id)} style={{fontSize:11,padding:"4px 12px",borderRadius:20,cursor:"pointer",background:metric===t.id?GN:"#f5f5f2",color:metric===t.id?"white":"#666",border:"none"}}>{t.lbl}</button>
            ))}
          </div>
          {metric==="mau" ? (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat("+cfg.eventDuration+",1fr)",gap:8,marginBottom:12}}>
                {WEEKS.map((w,i)=><SBox key={i} label={w} val={fmtN(fc.mau[i])} color={GN} note="est. MAU"/>)}
              </div>
              <svg width="100%" viewBox={"0 0 "+(cfg.eventDuration*60)+" 70"} style={{display:"block"}}>
                {fc.mau.map((v,i)=>{const bh=Math.max(2,v/maxOf(fc.mau)*50);return(<g key={i}><rect x={i*60+10} y={60-bh} width={40} height={bh} fill={GN} rx="3" fillOpacity="0.8"/><text x={i*60+30} y={60-bh-4} textAnchor="middle" fontSize="8" fill={GN}>{fmtN(v)}</text></g>);})}
              </svg>
            </div>
          ) : null}
          {metric==="session" ? (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat("+cfg.eventDuration+",1fr)",gap:8,marginBottom:12}}>
                {WEEKS.map((w,i)=><SBox key={i} label={w} val={fc.session[i]+"m"} color={AM} note="avg session"/>)}
              </div>
              <svg width="100%" viewBox={"0 0 "+(cfg.eventDuration*60)+" 70"} style={{display:"block"}}>
                {fc.session.map((v,i)=>{const bh=Math.max(2,v/maxOf(fc.session)*50);return(<g key={i}><rect x={i*60+10} y={60-bh} width={40} height={bh} fill={AM} rx="3" fillOpacity="0.8"/><text x={i*60+30} y={60-bh-4} textAnchor="middle" fontSize="8" fill={AM}>{v}m</text></g>);})}
              </svg>
            </div>
          ) : null}
          {metric==="hours" ? (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat("+cfg.eventDuration+",1fr)",gap:8,marginBottom:12}}>
                {WEEKS.map((w,i)=><SBox key={i} label={w} val={fmtN(fc.hours[i])} color="#534AB7" note="player-hours"/>)}
              </div>
              <div style={{padding:"8px 12px",background:"#EEEDFE",borderRadius:8,fontSize:10,color:"#3C3489"}}>Total: <strong>{fmtN(fc.hours.reduce((a,b)=>a+b,0))}</strong> player-hours across {cfg.eventDuration} weeks.</div>
            </div>
          ) : null}
          {metric==="ret" ? (
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr style={{borderBottom:BD}}>{["Week","D1","D7","D30"].map(h=><th key={h} style={{textAlign:"left",padding:"6px 8px",fontWeight:600,color:"#666"}}>{h}</th>)}</tr></thead>
              <tbody>
                {WEEKS.map((w,i)=>{
                  const r=fc.ret[i];
                  return(
                    <tr key={i} style={{borderBottom:BD}}>
                      <td style={{padding:"8px",fontWeight:600}}>{w}</td>
                      <td style={{textAlign:"center",padding:"8px",color:r.d1>35?GN:r.d1>25?AM:"#c0392b",fontWeight:600}}>{r.d1}%</td>
                      <td style={{textAlign:"center",padding:"8px",color:r.d7>14?GN:r.d7>10?AM:"#c0392b",fontWeight:600}}>{r.d7}%</td>
                      <td style={{textAlign:"center",padding:"8px",color:r.d30>5?GN:r.d30>3?AM:"#c0392b",fontWeight:600}}>{r.d30}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : null}
        </div>
      ) : null}

      {/* compare view */}
      {viewMode==="compare"&&fc ? (
        <div style={{background:"white",border:BD,borderRadius:10,padding:"14px 16px"}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:4}}>Forecast vs Actuals</div>
          <div style={{fontSize:11,color:"#666",marginBottom:14}}>Variance shows how actuals compare to forecast. Green = beating forecast. Red = behind.</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead>
              <tr style={{borderBottom:BD}}>
                <th style={{textAlign:"left",padding:"6px 8px",fontWeight:600,color:"#666",fontSize:10}}>Week</th>
                <th style={{textAlign:"center",padding:"6px 8px",fontWeight:600,color:"#999",fontSize:10}} colSpan={2}>MAU</th>
                <th style={{textAlign:"center",padding:"6px 8px",fontWeight:600,color:"#999",fontSize:10}} colSpan={2}>Session</th>
                <th style={{textAlign:"center",padding:"6px 8px",fontWeight:600,color:"#999",fontSize:10}} colSpan={2}>D1 Ret</th>
                <th style={{textAlign:"center",padding:"6px 8px",fontWeight:600,color:"#999",fontSize:10}} colSpan={2}>D7 Ret</th>
              </tr>
              <tr style={{borderBottom:BD}}>
                <th style={{padding:"4px 8px"}}/>
                {["est","actual","est","actual","est","actual","est","actual"].map((lbl,i)=>(
                  <th key={i} style={{textAlign:"center",padding:"4px 6px",fontWeight:500,color:"#999",fontSize:9}}>{lbl}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEEKS.map((w,i)=>{
                const a=actual[i];
                const vMau=variance(fc.mau[i],a.mau);
                const vSes=variance(fc.session[i],a.session);
                const vD1=variance(fc.ret[i].d1,a.d1);
                const vD7=variance(fc.ret[i].d7,a.d7);
                const hasData = a.mau||a.session||a.d1||a.d7;
                return (
                  <tr key={i} style={{borderBottom:BD,background:hasData?"white":"#fafafa"}}>
                    <td style={{padding:"8px",fontWeight:600}}>{w}</td>
                    <td style={{textAlign:"center",padding:"6px",color:"#666",fontSize:10}}>{fmtN(fc.mau[i])}</td>
                    <td style={{textAlign:"center",padding:"6px"}}>
                      {a.mau ? <span style={{fontWeight:600,color:varColor(vMau)}}>{fmtN(Number(a.mau))} <span style={{fontSize:9}}>({varLabel(vMau)})</span></span> : <span style={{color:"#ccc"}}>—</span>}
                    </td>
                    <td style={{textAlign:"center",padding:"6px",color:"#666",fontSize:10}}>{fc.session[i]}m</td>
                    <td style={{textAlign:"center",padding:"6px"}}>
                      {a.session ? <span style={{fontWeight:600,color:varColor(vSes)}}>{a.session}m <span style={{fontSize:9}}>({varLabel(vSes)})</span></span> : <span style={{color:"#ccc"}}>—</span>}
                    </td>
                    <td style={{textAlign:"center",padding:"6px",color:"#666",fontSize:10}}>{fc.ret[i].d1}%</td>
                    <td style={{textAlign:"center",padding:"6px"}}>
                      {a.d1 ? <span style={{fontWeight:600,color:varColor(vD1)}}>{a.d1}% <span style={{fontSize:9}}>({varLabel(vD1)})</span></span> : <span style={{color:"#ccc"}}>—</span>}
                    </td>
                    <td style={{textAlign:"center",padding:"6px",color:"#666",fontSize:10}}>{fc.ret[i].d7}%</td>
                    <td style={{textAlign:"center",padding:"6px"}}>
                      {a.d7 ? <span style={{fontWeight:600,color:varColor(vD7)}}>{a.d7}% <span style={{fontSize:9}}>({varLabel(vD7)})</span></span> : <span style={{color:"#ccc"}}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{marginTop:10,fontSize:10,color:"#999"}}>Variance calculated as (actual − forecast) / forecast. Enter actuals in the "enter actuals" tab to populate this view.</div>
        </div>
      ) : null}
    </div>
  );
}

// ── Journey Map ────────────────────────────────────────────────────────────────

// ── Dependency Map ─────────────────────────────────────────────────────────────
const DEP_NODES = [
  {id:"entry",    label:"Festival Entry",     week:"W1", type:"gate",   desc:"Player opens the festival board. Festival Pass and ingredient stall unlock. Flour Tokens begin.", color:"#185FA5"},
  {id:"vien",     label:"Viennoiserie School",week:"W1", type:"content",desc:"First recipe school. Rank up through orders toward gold mastery.",                                  color:"#D85A30"},
  {id:"tarts",    label:"Tarts School",       week:"W1", type:"content",desc:"Second recipe school, unlocked alongside Viennoiserie.",                                            color:"#534AB7"},
  {id:"tokens",   label:"Flour Tokens",       week:"W1", type:"economy",desc:"Earned from completed orders. Feeds the ingredient stall. Rates still open.",                       color:"#c4a832"},
  {id:"choux",    label:"Choux School",       week:"W2", type:"content",desc:"Third recipe school, unlocked in week two.",                                                        color:"#9E3F8E"},
  {id:"macarons", label:"Macarons School",    week:"W2", type:"content",desc:"Fourth recipe school, unlocked in week two.",                                                       color:"#1D9E75"},
  {id:"showcase", label:"Showcase Gate",      week:"W3", type:"gate",   desc:"Requires all four recipe books plus at least one school at gold. UI must not imply all four at gold. OPEN GAP.", color:"#c0392b"},
  {id:"kitchen",  label:"Master Kitchen",     week:"W3", type:"content",desc:"Unlocked by the Showcase ribbon. Permanent menu slot and prestige cosmetics.",                      color:"#4a7c59"},
  {id:"rush",     label:"Dinner Rush",        week:"W4", type:"content",desc:"Cooperative three-wave service event. Team size still open. OPEN GAP.",                             color:"#185FA5"},
  {id:"cards",    label:"Recipe Cards",       week:"W4", type:"economy",desc:"Guaranteed above a modest order threshold in Dinner Rush. Small heritage recipe chance.",           color:"#c17f3a"},
  {id:"exchange", label:"Token Exchange",     week:"W5", type:"economy",desc:"Flour Tokens exchange for rare ingredients and missing books. Rate still open. OPEN GAP.",          color:"#1D9E75"},
  {id:"whisk",    label:"Golden Whisk",       week:"W5", type:"content",desc:"Flawless service run with a full gold-mastery menu. Criteria still open. OPEN GAP.",                color:"#c4a832"},
  {id:"heritage", label:"Heritage Recipe",    week:"W5", type:"content",desc:"Very low chance from recipe cards. The festival's most coveted find.",                              color:"#9E3F8E"},
];

const DEP_EDGES = [
  {from:"entry",   to:"vien",     type:"hard"},
  {from:"entry",   to:"tarts",    type:"hard"},
  {from:"entry",   to:"tokens",   type:"hard"},
  {from:"vien",    to:"showcase", type:"hard"},
  {from:"tarts",   to:"showcase", type:"hard"},
  {from:"choux",   to:"showcase", type:"hard"},
  {from:"macarons",to:"showcase", type:"hard"},
  {from:"showcase",to:"kitchen",  type:"hard"},
  {from:"kitchen", to:"rush",     type:"soft"},
  {from:"rush",    to:"cards",    type:"hard"},
  {from:"tokens",  to:"exchange", type:"hard"},
  {from:"cards",   to:"heritage", type:"soft"},
  {from:"exchange",to:"heritage", type:"soft"},
  {from:"kitchen", to:"whisk",    type:"hard"},
  {from:"rush",    to:"whisk",    type:"hard"},
];

const OPEN_IDS = ["showcase","rush","tokens","exchange","whisk"];
const WEEK_COLS = {W1:100, W2:270, W3:440, W4:610, W5:780};
const NW=140, NH=44, SVG_W=930, SVG_H=430;
const TYPE_COLOR = {gate:"#185FA5", content:"#4a7c59", economy:"#c4a832"};

function DependencyMap({nodes,edges,openIds}) {
  const NODES = nodes || DEP_NODES;
  const EDGES = edges || DEP_EDGES;
  const OPEN = openIds || OPEN_IDS;
  const nodePos = (id) => {
    const node = NODES.find(n=>n.id===id);
    if(!node) return {x:0,y:0};
    const x = WEEK_COLS[node.week]||100;
    const weekNodes = NODES.filter(n=>n.week===node.week);
    const idx = weekNodes.findIndex(n=>n.id===id);
    const total = weekNodes.length;
    const y = 58 + idx * (SVG_H-130) / Math.max(total-1,1);
    return {x, y};
  };
  const [sel,setSel] = useState(null);
  const selNode = sel ? NODES.find(n=>n.id===sel) : null;
  const prereqs = sel ? EDGES.filter(e=>e.to===sel).map(e=>NODES.find(n=>n.id===e.from)).filter(Boolean) : [];
  const unlocks = sel ? EDGES.filter(e=>e.from===sel).map(e=>NODES.find(n=>n.id===e.to)).filter(Boolean) : [];

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:13,fontWeight:600}}>Dependency Map</div>
          <div style={{fontSize:11,color:"#666"}}>Hard and soft gates across the 5-week event. Click any node to see prerequisites and what it unlocks.</div>
        </div>
        <div style={{display:"flex",gap:12,fontSize:10,color:"#666",alignItems:"center",flexWrap:"wrap"}}>
          <span style={{display:"flex",alignItems:"center",gap:4}}><svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#555" strokeWidth="2"/></svg>hard gate</span>
          <span style={{display:"flex",alignItems:"center",gap:4}}><svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#aaa" strokeWidth="1.5" strokeDasharray="4 3"/></svg>soft dependency</span>
          <span style={{background:"#fdeaea",color:"#c0392b",padding:"2px 8px",borderRadius:10,fontWeight:600,fontSize:9}}>! open gap</span>
        </div>
      </div>

      <div style={{overflowX:"auto",borderRadius:10,border:BD,background:"#f7f7f5",marginBottom:12}}>
        <svg width={SVG_W} height={SVG_H} style={{display:"block"}}>
          {Object.entries(WEEK_COLS).map(([w,x])=>(
            <g key={w}>
              <rect x={x-NW/2} y={4} width={NW} height={24} fill={GN} rx="4"/>
              <text x={x} y={20} textAnchor="middle" fontSize="11" fill="white" fontWeight="600">{w}</text>
            </g>
          ))}
          {EDGES.map((e,i)=>{
            const f=nodePos(e.from), t=nodePos(e.to);
            const hi = sel && (e.from===sel||e.to===sel);
            return (
              <line key={i}
                x1={f.x+NW/2} y1={f.y+NH/2}
                x2={t.x-NW/2} y2={t.y+NH/2}
                stroke={hi?"#333":e.type==="hard"?"#bbb":"#ddd"}
                strokeWidth={hi?2.5:e.type==="hard"?1.5:1}
                strokeDasharray={e.type==="soft"?"5 4":"none"}
                strokeOpacity={sel&&!hi?0.2:1}
              />
            );
          })}
          {NODES.map(node=>{
            const {x,y} = nodePos(node.id);
            const isSel = sel===node.id;
            const isOpen = OPEN.includes(node.id);
            const isConn = sel ? EDGES.some(e=>(e.from===sel&&e.to===node.id)||(e.to===sel&&e.from===node.id)) : false;
            const fade = sel&&!isSel&&!isConn ? 0.25 : 1;
            return (
              <g key={node.id} onClick={()=>setSel(isSel?null:node.id)} style={{cursor:"pointer"}} opacity={fade}>
                <rect x={x-NW/2} y={y} width={NW} height={NH} rx="6" fill={isSel?node.color:"white"} stroke={node.color} strokeWidth={isSel?2.5:1.5}/>
                {isOpen ? <rect x={x+NW/2-13} y={y-7} width={13} height={13} rx="3" fill="#c0392b"/> : null}
                {isOpen ? <text x={x+NW/2-6} y={y+4} textAnchor="middle" fontSize="9" fill="white" fontWeight="700">!</text> : null}
                <text x={x} y={y+17} textAnchor="middle" fontSize="10" fontWeight="700" fill={isSel?"white":node.color}>{node.label}</text>
                <text x={x} y={y+31} textAnchor="middle" fontSize="8" fill={isSel?"rgba(255,255,255,0.75)":TYPE_COLOR[node.type]}>{node.type}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {selNode ? (
        <div style={{background:"white",border:"2px solid "+selNode.color,borderRadius:10,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:14,fontWeight:700,color:selNode.color}}>{selNode.label}</span>
              <span style={{fontSize:9,padding:"2px 8px",borderRadius:10,fontWeight:600,background:selNode.color+"22",color:selNode.color,border:"1px solid "+selNode.color+"55"}}>{selNode.type}</span>
              <span style={{fontSize:9,color:"#999"}}>{selNode.week}</span>
              {OPEN.includes(selNode.id) ? <span style={{fontSize:9,background:"#fdeaea",color:"#c0392b",padding:"2px 8px",borderRadius:10,fontWeight:600}}>! open gap</span> : null}
            </div>
            <button onClick={()=>setSel(null)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:16,color:"#666"}}>x</button>
          </div>
          <p style={{margin:"0 0 12px",fontSize:11,color:"#444",lineHeight:1.6}}>{selNode.desc}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:"#666",marginBottom:6}}>REQUIRES</div>
              {prereqs.length===0
                ? <div style={{fontSize:10,color:"#999",fontStyle:"italic"}}>Event start</div>
                : prereqs.map(p=>(
                    <div key={p.id} onClick={()=>setSel(p.id)} style={{fontSize:10,padding:"4px 10px",borderRadius:6,border:"1px solid "+p.color,color:p.color,marginBottom:4,cursor:"pointer",background:p.color+"11",fontWeight:600}}>{p.label}</div>
                  ))}
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:"#666",marginBottom:6}}>UNLOCKS</div>
              {unlocks.length===0
                ? <div style={{fontSize:10,color:"#999",fontStyle:"italic"}}>End state</div>
                : unlocks.map(u=>(
                    <div key={u.id} onClick={()=>setSel(u.id)} style={{fontSize:10,padding:"4px 10px",borderRadius:6,border:"1px solid "+u.color,color:u.color,marginBottom:4,cursor:"pointer",background:u.color+"11",fontWeight:600}}>{u.label}</div>
                  ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{fontSize:10,color:"#666",padding:"8px 12px",background:"#f7f7f5",borderRadius:8}}>Click any node to see its prerequisites and what it unlocks. Red <strong>!</strong> = open GDD gap. Solid lines = hard blocking gates. Dashed = soft dependencies.</div>
      )}
    </div>
  );
}


// ── Endowment Audit: what crosses the boundary out of the event ───────────────
const ENDOW_ITEMS = [
  {name:"Recipe books (x4)", persist:"permanent", lenses:["progression","agency"], seg:"all", loop:"Menu planning and daily orders", note:"Given across W1-W2. Baseline endowment for every segment."},
  {name:"Gold mastery recipes", persist:"permanent", lenses:["progression"], seg:["Endgame","Collector","Midlevel"], loop:"Signature items in daily service", note:"Time-gated. Casual reach depends entirely on the catch-up week."},
  {name:"Showcase ribbon + menu slot", persist:"permanent", lenses:["belonging","agency"], seg:["Endgame","Collector"], loop:"A permanent menu slot used weekly", note:"Gate-locked on the pessimistic path."},
  {name:"Recipe cards", persist:"permanent", lenses:["progression"], seg:["Endgame","Collector","Midlevel"], loop:"New dishes in rotation", note:"Dinner Rush reward with mid-tier reach."},
  {name:"Heritage recipe", persist:"permanent", lenses:["belonging","progression"], seg:["Endgame"], loop:"Signature dish and bragging rights", note:"Lottery tier."},
  {name:"Golden Whisk trophy", persist:"permanent", lenses:["belonging"], seg:["Endgame"], loop:"", note:"Persists but touches no loop. The audit calls it what it is: a souvenir."},
  {name:"Flour Tokens", persist:"expires", lenses:[], seg:"all", loop:"", note:"Dies with the festival."},
  {name:"Festival decorations", persist:"permanent", lenses:["belonging"], seg:"all", loop:"Cafe decor seen by every visitor", note:"Free pass reward. Wide and gentle."},
];
const ENDOW_INSIGHT = "Every segment keeps the recipe books, so nobody leaves empty. Depth concentrates at the top: Endgame leaves with six endowments, New and Social with two. The Golden Whisk persists but feeds no loop, and the token exchange is the only valve that deepens the middle. This event is a foundation for the top two segments and a shallow one for everyone else.";

function EndowmentAudit({items, insight}) {
  const LENSES = [
    {id:"agency", color:"#185FA5"},
    {id:"progression", color:GN2},
    {id:"belonging", color:"#9E3F8E"},
  ];
  const SEGS = ["New","Midlevel","Endgame","Collector","Social"];
  const clsOf = it => it.persist!=="permanent" ? "temp" : (it.loop ? "endowment" : "souvenir");
  const clsColor = it => {
    const c = clsOf(it);
    return c==="endowment" ? GN : c==="souvenir" ? AM : "#c0392b";
  };
  const clsBg = it => {
    const c = clsOf(it);
    return c==="endowment" ? GN3 : c==="souvenir" ? AM3 : "#fdeaea";
  };
  const clsLbl = it => {
    const c = clsOf(it);
    return c==="endowment" ? "endowment" : c==="souvenir" ? "souvenir" : it.persist;
  };
  const covers = (it,seg) => it.seg==="all" || it.seg.includes(seg);
  const lensCovered = (seg,lens) => items.some(it=>clsOf(it)==="endowment" && covers(it,seg) && it.lenses.includes(lens));
  const endowCount = seg => items.filter(it=>clsOf(it)==="endowment" && covers(it,seg)).length;
  const verdict = seg => {
    const n = endowCount(seg);
    const full = LENSES.every(l=>lensCovered(seg,l.id));
    if(!full) return {t:"spike risk", c:"#c0392b"};
    return n>=4 ? {t:"deep foundation", c:GN} : {t:"shallow foundation", c:AM2};
  };
  const lensColor = id => (LENSES.find(l=>l.id===id)||{}).color || "#666";

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:13,fontWeight:600}}>Endowment Audit</div>
          <div style={{fontSize:11,color:"#666"}}>What crosses the boundary out of the event? Reach uses the pessimistic session path from the validator.</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          {LENSES.map(l=>(
            <span key={l.id} style={{fontSize:10,padding:"2px 10px",borderRadius:10,fontWeight:600,background:l.color+"18",color:l.color,border:"1px solid "+l.color+"44"}}>{l.id}</span>
          ))}
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
        {items.map((it,i)=>(
          <div key={i} style={{background:"white",border:BD,borderLeft:"3px solid "+clsColor(it),borderRadius:8,padding:"9px 13px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3}}>
              <span style={{fontSize:12,fontWeight:600}}>{it.name}</span>
              <span style={{fontSize:9,padding:"1px 8px",borderRadius:10,fontWeight:600,background:clsBg(it),color:clsColor(it)}}>{clsLbl(it)}</span>
              {it.lenses.map(l=>(
                <span key={l} style={{fontSize:9,fontWeight:600,color:lensColor(l)}}>{l}</span>
              ))}
              <span style={{fontSize:9,color:"#999",marginLeft:"auto"}}>{it.seg==="all" ? "all segments" : it.seg.join(", ")}</span>
            </div>
            {it.loop ? <div style={{fontSize:10,color:"#555"}}>Shows up in: {it.loop}</div> : <div style={{fontSize:10,color:"#c0392b"}}>Touches no base-game loop.</div>}
            {it.note ? <div style={{fontSize:10,color:"#888",marginTop:2}}>{it.note}</div> : null}
          </div>
        ))}
      </div>

      <div style={{background:"white",border:BD,borderRadius:10,padding:"12px 14px",marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:600,marginBottom:8}}>What each segment leaves with (pessimistic path)</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead>
            <tr style={{borderBottom:BD}}>
              <th style={{textAlign:"left",padding:"5px 8px",fontWeight:600,color:"#666",fontSize:9}}>Segment</th>
              {LENSES.map(l=><th key={l.id} style={{textAlign:"center",padding:"5px 8px",fontWeight:600,color:l.color,fontSize:9}}>{l.id}</th>)}
              <th style={{textAlign:"right",padding:"5px 8px",fontWeight:600,color:"#666",fontSize:9}}>Verdict</th>
            </tr>
          </thead>
          <tbody>
            {SEGS.map(seg=>{
              const v = verdict(seg);
              return (
                <tr key={seg} style={{borderBottom:BD}}>
                  <td style={{padding:"7px 8px",fontWeight:600}}>{seg}</td>
                  {LENSES.map(l=>(
                    <td key={l.id} style={{textAlign:"center",padding:"7px 8px",fontWeight:700,color:lensCovered(seg,l.id)?GN:"#c0392b"}}>{lensCovered(seg,l.id)?"✓":"✗"}</td>
                  ))}
                  <td style={{textAlign:"right",padding:"7px 8px"}}>
                    <span style={{fontSize:10,fontWeight:600,color:v.c}}>{endowCount(seg)} · {v.t}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {insight ? <div style={{fontSize:11,color:"#444",background:"#f7f7f5",padding:"10px 14px",borderRadius:8,lineHeight:1.6,marginBottom:8}}><strong>Read: </strong>{insight}</div> : null}
      <div style={{fontSize:10,color:"#999",padding:"6px 12px"}}>Design-time audit. Persistence and reach are stated design intent read against the pessimistic session path. The measurement half (day-30 endowment engagement, social edge persistence) only exists once the event runs.</div>
    </div>
  );
}

export default function App() {
  const [cfg,setCfg] = useState(null);
  if(!cfg) return <SetupScreen onLoad={setCfg}/>;
  return <JourneyMap cfg={cfg} onReset={()=>setCfg(null)}/>;
}

function JourneyMap({cfg,onReset}) {
  const WEEKS = Array.from({length:cfg.eventDuration},(_,i)=>"Week "+(i+1));
  const P = buildPrompts(cfg);
  const [tab,setTab] = useState("map");
  const isDemo = !!cfg._demo;
  const [cells,setCells] = useState(isDemo ? DEMO.cells : DEFAULT_CELLS);
  const [loading,setLoading] = useState({});
  const [genAll,setGenAll] = useState(false);
  const [aNotes,setANotes] = useState(isDemo ? DEMO.aNotes : {});
  const [eNotes,setENotes] = useState(isDemo ? DEMO.eNotes : {});
  const [aLoad,setALoad] = useState({});
  const [eLoad,setELoad] = useState({});
  const [visA,setVisA] = useState(()=>Object.fromEntries(cfg.archetypes.map(a=>[a.id,true])));
  const [visE,setVisE] = useState(()=>Object.fromEntries(cfg.engagementLevels.map(e=>[e.id,true])));
  const [actA,setActA] = useState(cfg.archetypes[0]?cfg.archetypes[0].id:"");
  const [actE,setActE] = useState(cfg.engagementLevels[1]?cfg.engagementLevels[1].id:"");
  const [curveMode,setCurveMode] = useState("archetype");

  const ck = (l,i) => l+"-"+i;
  const ak = (id,i) => id+"-"+i;
  const ek = (id,i) => "eng-"+id+"-"+i;

  const sentScores = WEEKS.map((_,i)=>{const t=cells[ck("experience",i)];return t?scoreSent(t):null;});

  const gen = useCallback(async(layer,wi)=>{
    const key=ck(layer,wi); setLoading(l=>({...l,[key]:true}));
    try{const t=await callAI(P[layer](WEEKS[wi],cfg.weekThemes[wi]));setCells(c=>({...c,[key]:t}));}
    catch(e){setCells(c=>({...c,[key]:"Error: "+e.message}));}
    setLoading(l=>({...l,[key]:false}));
  },[cfg,WEEKS,P]);

  const genAllCells = useCallback(async()=>{
    setGenAll(true);
    const missing = [];
    for(let wi=0;wi<WEEKS.length;wi++){
      for(const l of["scenario","experience","research","opportunity"]){
        if(!cells[ck(l,wi)]) missing.push([l,wi]);
      }
    }
    await pooled(missing.map(([l,wi])=>()=>gen(l,wi)), 4);
    setGenAll(false);
  },[cells,gen,WEEKS]);


  const genRow = useCallback(async(layer)=>{
    const missing = WEEKS.map((_,wi)=>wi).filter(wi=>!cells[ck(layer,wi)]);
    await pooled(missing.map(wi=>()=>gen(layer,wi)), 4);
  },[cells,gen,WEEKS]);

  const genCol = useCallback(async(wi)=>{
    const missing = ["scenario","experience","research","opportunity"].filter(l=>!cells[ck(l,wi)]);
    await pooled(missing.map(l=>()=>gen(l,wi)), 4);
  },[cells,gen,WEEKS]);

  const genLoading = useCallback((layer,wi)=>{
    if(wi!==undefined) return ["scenario","experience","research","opportunity"].some(l=>loading[ck(l,wi)]);
    return WEEKS.some((_,i)=>loading[ck(layer,i)]);
  },[loading,WEEKS]);

  const genA = useCallback(async(id,wi)=>{
    const key=ak(id,wi),a=cfg.archetypes.find(x=>x.id===id);
    setALoad(l=>({...l,[key]:true}));
    try{const t=await callAI(P.archetype(a,WEEKS[wi],cfg.weekThemes[wi]),400);setANotes(n=>({...n,[key]:t}));}
    catch(e){setANotes(n=>({...n,[key]:"Error: "+e.message}));}
    setALoad(l=>({...l,[key]:false}));
  },[cfg,WEEKS,P]);

  const genE = useCallback(async(id,wi)=>{
    const key=ek(id,wi),e=cfg.engagementLevels.find(x=>x.id===id);
    setELoad(l=>({...l,[key]:true}));
    try{const t=await callAI(P.engagement(e,WEEKS[wi],cfg.weekThemes[wi]),400);setENotes(n=>({...n,[key]:t}));}
    catch(e){setENotes(n=>({...n,[key]:"Error: "+e.message}));}
    setELoad(l=>({...l,[key]:false}));
  },[cfg,WEEKS,P]);

  const genAllA = useCallback(async()=>{
    const missing=[];
    cfg.archetypes.forEach(a=>WEEKS.forEach((_,wi)=>{if(!aNotes[ak(a.id,wi)])missing.push([a.id,wi]);}));
    await pooled(missing.map(([id,wi])=>()=>genA(id,wi)), 4);
  },[cfg,aNotes,genA,WEEKS]);

  const genAllE = useCallback(async()=>{
    const missing=[];
    cfg.engagementLevels.forEach(e=>WEEKS.forEach((_,wi)=>{if(!eNotes[ek(e.id,wi)])missing.push([e.id,wi]);}));
    await pooled(missing.map(([id,wi])=>()=>genE(id,wi)), 4);
  },[cfg,eNotes,genE,WEEKS]);

  const exportTxt = () => {
    const lines=["# "+cfg.name+" Journey Map\n"];
    WEEKS.forEach((w,wi)=>{
      lines.push("\n=== "+w+" ===");
      ["scenario","experience","research","opportunity"].forEach(l=>{const c=cells[ck(l,wi)];if(c)lines.push("\n["+l.toUpperCase()+"]\n"+c);});
    });
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([lines.join("\n")],{type:"text/plain"}));a.download=cfg.name.replace(/\s+/g,"_")+"_journey_map.txt";a.click();
  };

  const filled = ["scenario","experience","research","opportunity"].reduce((n,l)=>n+WEEKS.filter((_,i)=>cells[ck(l,i)]).length,0);
  const total = WEEKS.length*4;
  const gc = "110px repeat("+WEEKS.length+",1fr)";
  const openGaps = (isDemo ? DEMO.gaps : INIT_GAPS).filter(g=>g.status==="open").length;

  const TABS = [{id:"map",lbl:"journey map"},{id:"data",lbl:"data & forecast"},{id:"gaps",lbl:"GDD gaps · "+openGaps+" open"},{id:"deps",lbl:"dependency map"},{id:"session",lbl:"session validator"},{id:"heatmap",lbl:"risk heatmap"},{id:"endow",lbl:"endowment audit"}];

  const LAYERS = ["scenario","experience","research","opportunity"];
  const LAYER_LABELS = {scenario:"a. scenario",experience:"c. experience",research:"b. research",opportunity:"d. opportunities"};

  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",padding:"1rem"}}>
      <style>{"@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>

      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"1rem",flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <span style={{fontSize:11,background:GN3,color:GN2,padding:"2px 10px",borderRadius:20,fontWeight:600}}>{cfg.subtitle||cfg.platform}</span>
            {isDemo ? <span style={{fontSize:10,background:"#EEEDFE",color:"#534AB7",padding:"2px 10px",borderRadius:20,fontWeight:600}}>demo data</span> : null}
            <span style={{fontSize:11,color:"#666"}}>{cfg.eventDuration}-week event</span>
            <button onClick={onReset} style={{fontSize:10,color:"#666",background:"none",border:BD,borderRadius:6,padding:"2px 8px",cursor:"pointer"}}>← switch game</button>
          </div>
          <h2 style={{margin:0,fontSize:18,fontWeight:500}}>progression // engagement: {cfg.name.toLowerCase()}</h2>
        </div>
        {tab==="map" ? (
          <div style={{display:"flex",gap:8}}>
            <button onClick={genAllCells} disabled={genAll||filled===total} style={{fontSize:12,padding:"6px 14px",cursor:"pointer",opacity:genAll||filled===total?0.5:1}}>{genAll?"generating...":"generate all ↗"}</button>
            <button onClick={exportTxt} disabled={filled===0} style={{fontSize:12,padding:"6px 14px",opacity:filled===0?0.4:1}}>export .txt</button>
          </div>
        ) : null}
      </div>

      <div style={{display:"flex",marginBottom:14,borderBottom:BD}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{fontSize:12,padding:"7px 14px",cursor:"pointer",background:"transparent",border:"none",borderBottom:tab===t.id?"2px solid "+GN:"2px solid transparent",color:tab===t.id?GN:"#666",fontWeight:tab===t.id?600:400,marginBottom:-1,whiteSpace:"nowrap"}}>{t.lbl}</button>
        ))}
        {tab==="map" ? <span style={{marginLeft:"auto",fontSize:10,color:"#666",padding:"7px 0"}}>{filled}/{total} cells</span> : null}
      </div>

      {tab==="map" ? (
        <div style={{overflowX:"auto"}}>
          <div style={{minWidth:Math.max(700,WEEKS.length*130)}}>
            {/* headers */}
            <div style={{display:"grid",gridTemplateColumns:gc,gap:6,marginBottom:6}}>
              <div/>
              {WEEKS.map((w,wi)=>(
                <div key={w} style={{textAlign:"center",fontSize:11,fontWeight:600,padding:"4px 0",background:GN,borderRadius:6,color:"white",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  {w}
                  <button onClick={()=>genCol(wi)} title={"Generate all "+w} style={{fontSize:9,padding:"1px 6px",borderRadius:4,border:"none",background:"rgba(255,255,255,0.25)",color:"white",cursor:"pointer",lineHeight:1.4}}>↗</button>
                </div>
              ))}
            </div>

            {/* scenario */}
            <div style={{display:"grid",gridTemplateColumns:gc,gap:6,marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8,gap:4}}>
                <button onClick={()=>genRow("scenario")} title="Generate row" style={{fontSize:9,padding:"1px 5px",borderRadius:4,border:"1px solid "+GN,background:GN3,color:GN2,cursor:"pointer"}}>↗</button>
                <span style={{fontSize:10,fontWeight:600,color:GN2,textAlign:"right"}}>a. scenario</span>
              </div>
              {WEEKS.map((_,wi)=>(
                <Cell key={wi} layer="scenario" content={cells[ck("scenario",wi)]} loading={!!loading[ck("scenario",wi)]} onGenerate={()=>gen("scenario",wi)} onEdit={v=>setCells(c=>({...c,[ck("scenario",wi)]:v}))}/>
              ))}
            </div>

            {/* experience block */}
            <div style={{background:AM3,borderRadius:8,padding:"10px 0 8px",marginBottom:6}}>
              {/* curve controls */}
              <div style={{display:"grid",gridTemplateColumns:gc,gap:6}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"flex-end",paddingRight:8,paddingTop:4}}><span style={{fontSize:10,fontWeight:600,color:AM2,textAlign:"right"}}>c. experience</span></div>
                <div style={{gridColumn:"2 / -1",paddingRight:6}}>
                  <div style={{display:"flex",gap:0,marginBottom:4}}>
                    <button onClick={()=>setCurveMode("archetype")} style={{fontSize:9,padding:"3px 10px",cursor:"pointer",background:curveMode==="archetype"?GN:"transparent",color:curveMode==="archetype"?"white":"#666",border:BD,borderRadius:"6px 0 0 6px"}}>by archetype</button>
                    <button onClick={()=>setCurveMode("engagement")} style={{fontSize:9,padding:"3px 10px",cursor:"pointer",background:curveMode==="engagement"?GN:"transparent",color:curveMode==="engagement"?"white":"#666",border:BD,borderRadius:"0 6px 6px 0"}}>by engagement</button>
                  </div>
                  <EmotionCurve sentScores={sentScores} cfg={cfg} aNotes={aNotes} eNotes={eNotes} mode={curveMode} visA={visA} visE={visE} actA={actA} actE={actE} setActA={setActA} setActE={setActE}/>
                  {/* legend */}
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",padding:"4px 0 6px",alignItems:"center",fontSize:10}}>
                    <span style={{color:AM,fontSize:9}}>— overall sentiment</span>
                    {curveMode==="archetype" ? cfg.archetypes.map(a=>(
                      <button key={a.id} onClick={()=>{setVisA(v=>({...v,[a.id]:!v[a.id]}));setActA(a.id);}} style={{fontSize:9,padding:"2px 8px",borderRadius:10,cursor:"pointer",border:"1px solid "+a.color,background:visA[a.id]?a.color+"22":"transparent",color:visA[a.id]?a.color:"#aaa"}}>{a.label}</button>
                    )) : null}
                    {curveMode==="engagement" ? cfg.engagementLevels.map(e=>(
                      <button key={e.id} onClick={()=>{setVisE(v=>({...v,[e.id]:!v[e.id]}));setActE(e.id);}} style={{fontSize:9,padding:"2px 8px",borderRadius:10,cursor:"pointer",border:"1px solid "+e.color,background:visE[e.id]?e.color+"22":"transparent",color:visE[e.id]?e.color:"#aaa"}}>{e.label}</button>
                    )) : null}
                    <button onClick={curveMode==="archetype"?genAllA:genAllE} style={{marginLeft:"auto",fontSize:9,padding:"2px 8px",cursor:"pointer",color:AM2,background:"transparent",border:"none"}}>generate all ↗</button>
                  </div>
                </div>
              </div>

              {/* overall experience row */}
              <div style={{display:"grid",gridTemplateColumns:gc,gap:6,borderTop:"0.5px solid #f0d8c0",paddingTop:8}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8,gap:4}}>
                  <button onClick={()=>genRow("experience")} title="Generate row" style={{fontSize:9,padding:"1px 5px",borderRadius:4,border:"1px solid "+AM,background:AM3,color:AM2,cursor:"pointer"}}>↗</button>
                  <span style={{fontSize:9,color:AM}}>overall</span>
                </div>
                {WEEKS.map((_,wi)=>(
                  <Cell key={wi} layer="experience" content={cells[ck("experience",wi)]} loading={!!loading[ck("experience",wi)]} onGenerate={()=>gen("experience",wi)} onEdit={v=>setCells(c=>({...c,[ck("experience",wi)]:v}))}/>
                ))}
              </div>

              {/* archetype note rows */}
              {curveMode==="archetype" ? cfg.archetypes.map(a=>{
                if(!visA[a.id]) return null;
                return (
                  <div key={a.id} style={{display:"grid",gridTemplateColumns:gc,gap:6,marginTop:4}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8}}><span style={{fontSize:9,fontWeight:600,color:a.color}}>{a.label}</span></div>
                    {WEEKS.map((_,wi)=>{
                      const key=ak(a.id,wi),note=aNotes[key],isL=!!aLoad[key];
                      return (
                        <div key={wi} style={{background:"white",border:"1px solid "+(note?a.color+"55":"#eee"),borderRadius:6,padding:"7px 8px",minHeight:50}}>
                          {isL ? <span style={{fontSize:10,color:a.color}}>⟳ generating...</span> : note ? (
                            <textarea value={note} onChange={ev=>setANotes(n=>({...n,[key]:ev.target.value}))} style={{width:"100%",minHeight:38,fontSize:10,lineHeight:1.4,border:"none",background:"transparent",resize:"none",color:"#444",fontFamily:"-apple-system,sans-serif",padding:0,outline:"none",boxSizing:"border-box"}}/>
                          ) : (
                            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:38,gap:2}}>
                              <button onClick={()=>genA(a.id,wi)} style={{fontSize:9,padding:"1px 8px",cursor:"pointer",color:a.color,border:"1px solid "+a.color,borderRadius:8,background:"transparent"}}>{a.label} ↗</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              }) : null}

              {/* engagement note rows */}
              {curveMode==="engagement" ? cfg.engagementLevels.map(e=>{
                if(!visE[e.id]) return null;
                return (
                  <div key={e.id} style={{display:"grid",gridTemplateColumns:gc,gap:6,marginTop:4}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8}}><span style={{fontSize:9,fontWeight:600,color:e.color}}>{e.label}</span></div>
                    {WEEKS.map((_,wi)=>{
                      const key=ek(e.id,wi),note=eNotes[key],isL=!!eLoad[key];
                      return (
                        <div key={wi} style={{background:"white",border:"1px solid "+(note?e.color+"55":"#eee"),borderRadius:6,padding:"7px 8px",minHeight:50}}>
                          {isL ? <span style={{fontSize:10,color:e.color}}>⟳ generating...</span> : note ? (
                            <textarea value={note} onChange={ev=>setENotes(n=>({...n,[key]:ev.target.value}))} style={{width:"100%",minHeight:38,fontSize:10,lineHeight:1.4,border:"none",background:"transparent",resize:"none",color:"#444",fontFamily:"-apple-system,sans-serif",padding:0,outline:"none",boxSizing:"border-box"}}/>
                          ) : (
                            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:38,gap:2}}>
                              <button onClick={()=>genE(e.id,wi)} style={{fontSize:9,padding:"1px 8px",cursor:"pointer",color:e.color,border:"1px solid "+e.color,borderRadius:8,background:"transparent"}}>{e.label} ↗</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              }) : null}

              <div style={{height:8}}/>
            </div>

            {/* research */}
            <div style={{display:"grid",gridTemplateColumns:gc,gap:6,marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8,gap:4}}>
                <button onClick={()=>genRow("research")} title="Generate row" style={{fontSize:9,padding:"1px 5px",borderRadius:4,border:"1px solid #7a6a4a",background:"#f5f0e8",color:"#5a4a2a",cursor:"pointer"}}>↗</button>
                <span style={{fontSize:10,fontWeight:600,color:"#5a4a2a",textAlign:"right"}}>b. research</span>
              </div>
              {WEEKS.map((_,wi)=>(
                <Cell key={wi} layer="research" content={cells[ck("research",wi)]} loading={!!loading[ck("research",wi)]} onGenerate={()=>gen("research",wi)} onEdit={v=>setCells(c=>({...c,[ck("research",wi)]:v}))}/>
              ))}
            </div>

            {/* opportunity */}
            <div style={{background:"#fdf8e0",borderRadius:8,padding:"6px 0"}}>
              <div style={{display:"grid",gridTemplateColumns:gc,gap:6}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8,gap:4}}>
                  <button onClick={()=>genRow("opportunity")} title="Generate row" style={{fontSize:9,padding:"1px 5px",borderRadius:4,border:"1px solid #c4a832",background:"#fdf8e0",color:"#8a7010",cursor:"pointer"}}>↗</button>
                  <span style={{fontSize:10,fontWeight:600,color:"#8a7010",textAlign:"right"}}>d. opportunities</span>
                </div>
                {WEEKS.map((_,wi)=>(
                  <Cell key={wi} layer="opportunity" content={cells[ck("opportunity",wi)]} loading={!!loading[ck("opportunity",wi)]} onGenerate={()=>gen("opportunity",wi)} onEdit={v=>setCells(c=>({...c,[ck("opportunity",wi)]:v}))}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {tab==="data" ? <DataForecast cfg={cfg} sentScores={sentScores} demoActuals={isDemo ? DEMO.actuals : null}/> : null}
      {tab==="gaps" ? <GapTracker cfg={cfg} cells={cells} initGaps={isDemo ? DEMO.gaps : null}/> : null}
      {tab==="session" ? <SessionValidator paramDefs={isDemo ? DEMO.sessionParams : null} key={isDemo?"demo":"real"}/> : null}
      {tab==="heatmap" ? <RiskHeatmap cfg={cfg} aNotes={aNotes} eNotes={eNotes} isDemo={isDemo}/> : null}
      {tab==="deps" ? <DependencyMap nodes={isDemo ? DEMO.depNodes : null} edges={isDemo ? DEMO.depEdges : null} openIds={isDemo ? DEMO.depOpen : null}/> : null}
      {tab==="endow" ? <EndowmentAudit items={isDemo ? DEMO.endow : ENDOW_ITEMS} insight={isDemo ? DEMO.endowInsight : ENDOW_INSIGHT}/> : null}
      {tab==="deps" ? <DependencyMap/> : null}
    </div>
  );
}
