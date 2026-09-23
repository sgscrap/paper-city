# Asset & Content Authoring Procedure

**Version 1.0 · The rulebook for every new building, map, NPC, item, encounter, and event added to Paper City.**

Every piece of generated content ships through the same four gates: **Define → Place → Wire → Verify**. The automated validator (`npm run assets:check`) enforces the mechanical rules; review covers the rest. A contribution is *done* when all four gates pass — not when the file compiles.

---

## 1. Naming & ID Conventions

| Asset | ID pattern | Example | Defined in |
|---|---|---|---|
| Map / venue | `snake_case` | `the_block`, `underground_markets` | `src/data/maps.ts` |
| NPC | `npc_<name>` | `npc_ticker_tess`, `npc_club_dj_echo` | `src/data/npcs.ts` |
| Item | `snake_case` | `coalition_donut`, `smartphone` | `src/data/items.ts` |
| Building action | `open_<thing>` / `enter_<place>` | `open_shop`, `exit_north` | building `action` field |
| Random event | `UPPER_SNAKE` | `RIVAL_INTERRUPTS_CONTRACT` | `src/data/randomEvents.ts` |
| Street encounter | `UPPER_SNAKE` | `TESS_TABLE_TELL` | `src/data/streetEncounters.ts` |
| Contract | `snake_case` | `market_courier_brief` | `src/data/contracts.ts`, `financeContracts.ts` |
| Content flag | `snake_case` | `broker_rates_active`, `faction_angel` | `contentFlags` usage |
| Achievement | `snake_case` | — | `src/data/achievements.ts` |

Rules:

- **IDs are forever.** They persist inside player saves; never rename an existing ID — add a new one and migrate.
- **Key = id.** For every `Record<string, T>` registry, the object key MUST equal its `id` field.
- **No reserved collisions.** IDs never collide with system tokens: `player`, `exit`, `spawn`, `the_block` fallbacks, event/context enums (`work`, `travel`, `combat`, …).
- **Prefix consistency.** `npc_` for NPCs, `npc_club_` for club staff. No other prefixes without updating this table.

## 2. Buildings & Maps

Every new building on a map MUST:

1. **Use the canvas grid.** Coordinates in `MapDef.buildings[]` are pixels on an 800×600 map; keep 8px alignment where practical.
2. **Type must be exact**: `'building'` (interactive), `'exit'` (travel), `'decoration'` (non-interactive, no action).
3. **Carry an `action`** if type is `building` — the `ActionResolver` must route it (see §5).
4. **Never block spawn.** The map `spawn` point plus a 20px player box must not intersect any non-exit building rect.
5. **Never overlap** another building rect on the same map.
6. **Stay in bounds** — fully inside `0,0 → width,height` (no negative or overhanging rects).
7. **Exits are bidirectional by design** — an exit with `target: 'X'` implies X has a way back. If not intentional (one-way), note it in the PR.
8. **New venue ⇒ register the name.** Add the venue to `VENUE_NAMES` in `src/lib/NpcCityAI.ts` and to `sceneNames` consumers if any remain.

**Adding a whole new map**: also add an exit pair from an existing map, an entry in `LOCATIONS` if it is travel-reachable, and confirm `NpcCityAI.findWanderSpot` can spawn NPCs (≥24 seeded attempts must find open space).

## 3. NPCs

Every new NPC MUST:

1. **Have a unique `npc_*` id** and a human `name`.
2. **Declare `location`** matching a real venue id (the schedule fallback home).
3. **Have `baseDialogue`** with ≥2 lines — this is the fallback pool when no daypart/faction state applies.
4. **Have `daypartDialogue`** with at least `morning` and `night` (evening/afternoon optional but encouraged). No empty pools — each declared daypart needs ≥1 line. The sidebars and smoke test read these.
5. **If scheduled**: add a block in `npcSchedules.ts` covering ≥6 hours; gaps fall back to `location`. Quest-critical NPCs keep long morning blocks so the intro never stalls.
6. **If factioned**: `faction: 'angel' | 'ghost' | 'demon'`, and services additionally declare `serviceFaction` (gated at reputation 8 via `canAccessNpcService`).
7. **If social**: `socialEffects` with at least `chat`; positive NPCs give karma/luck, dangerous ones take something. Gift/insult effects encouraged.
8. **Services travel with the person** — never gate a service by venue. Use `serviceFaction` + `specialServiceFlags` only.
9. **Special services** need both a display string and ≥1 ending flag (`angel_ending_*`, `ghost_ending_*`, `demon_ending_*`).
10. **No orphan schedules** — every id in `NPC_SCHEDULES` must exist in `NPCS` (validator-enforced).

**Balance note**: every NPC with a service must have an equivalent on the other two factions (Angel↔Ghost↔Demon parity is tracked in `factionContentMatrix.ts`).

## 4. Items

Every new item MUST:

1. **Match the `Item` type** — `id`, `name`, `type` (one of the six enums), `description`, `cost`.
2. **Cost ≥ 1** unless it is deliberately a gift-only trinket (document why in the description).
3. **Effects reference real stats**: `will`, `power`, `intelligence`, `charisma`, `luck`, `karma`, `worth`, `energy`, `health`. Anything else will silently no-op.
4. **Weapons include `weaponStats`** (`damage`, `accuracy` 0–100, `critChance` 0–100).
5. **Gift-eligible items** (usable via NPC *Offer Favor*) must appear in `GIFT_ITEM_IDS` priority order in `src/lib/NPCSystem.ts` — gifts are consumed and logged, so a gift item without effect lines should still make narrative sense.
6. **Shop placement**: `shopDistrict` values must be real venue ids.
7. **Economy parity**: an item that boosts one faction's playstyle should have an equivalent for the others (price normalized by power).

## 5. Wiring (the gate everyone forgets)

New content must be reachable and routable:

- **Buildings** → `action` string must be handled in `src/lib/ActionResolver.ts` (or `page.tsx` switch). An unrouted action dead-clicks.
- **New tabs/views** → register in `uiStore.activeTab` union + `GameShell`/`Sidebar` routing + `NPCList.sceneLocation` mapping if the venue hosts NPCs.
- **New NPCs** → automatically appear on the map, LocationView, and Service Contacts roster *only if* schedules/venues resolve. If the NPC offers quests or jobs, their `questId`/`jobId` must exist.
- **New events/encounters** → `requirements` must be pure functions of `GameState`; `apply` must return a `patch` + `toast`; never mutate state directly; encounter `venues` must be real map ids.
- **Rewards** must route through existing systems: `modifyStat`, `modifyFactionReputation`, `InventorySystem.addItem`, `completeContract`. Free-floating mutations will not persist correctly through saves.
- **Persistence**: anything stored in `GameState` needs `INITIAL_STATE` defaults + `normalize*State` on load (see `normalizeStreetEncountersState` for the pattern). Old saves must boot safely.
- **Tests**: every new system ships with regression tests in `tests/` (see existing `StreetEncounters.test.ts` for the pattern: data validity + guards + resolution outcomes).

## 6. Art Assets

- Sprites live in `public/sprites/` (PNG). Current: `player.png`.
- Social banners: `docs/social-banner.html` (template with `__VERSION__`) → `npm run social:preview -- <version>` renders + validates 1280×640 automatically.
- Repo/social images should be generated from scripts, not hand-drawn exports — keep the source in the repo.
- Icon/UI chrome follows the existing Tailwind palette (`neon-blue`, `coalition-gold`, faction colors in `npcSchedules.ts`). Do not introduce one-off hex values.

## 7. Definition of Done (copy this into PRs)

- [ ] ID follows the naming table; key === id; no collision (validator ✅)
- [ ] All required fields present per type (validator ✅)
- [ ] References resolve: venues, questIds, jobIds, itemIds, factions (validator ✅)
- [ ] Building rects: in bounds, non-overlapping, spawn-safe (validator ✅)
- [ ] Actions routed; exits bidirectional (validator ✅ + manual click-through)
- [ ] NPC schedules resolve at every in-game minute; no orphan schedules (validator ✅)
- [ ] Daypart dialogue pools non-empty; morning+night present (validator ✅)
- [ ] Save-compat: INITIAL_STATE + normalize added if state shape changed (review)
- [ ] Regression tests added for new systems (review)
- [ ] Faction parity considered (review)
- [ ] `npm run assets:check`, `tsc`, `lint`, `vitest run` all green (CI ✅)

## 8. Running the gates

```bash
npm run assets:check     # mechanical rules from this document
npx tsc --noEmit         # type safety
npm run lint             # style
npx vitest run           # regression suite
npm run desktop:smoke    # packaged app verification (releases only)
```

The validator is the *floor*, not the ceiling. It catches structural mistakes; the review gates catch balance, tone, and parity.
