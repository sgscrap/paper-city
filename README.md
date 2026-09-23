# Paper City

Paper City is a systems-driven urban RPG about identity, influence, survival, and the choices that shape how a city remembers you.

The desktop identity uses a three-faction city sigil: Angel order, Ghost information, and Demon power meet in one mark. The scalable source artwork lives at `public/paper-city-sigil.svg` and is used by the Electron window while remaining ready for future high-resolution installer icon exports.

The canonical implementation lives in this `paper-city/` Next.js application, with an Electron desktop launcher for local testing.

The main menu displays a **build stamp** (`build v0.1.2`) sourced directly from `package.json` at compile time, so it always matches the packaged installer version. Film-grain and paper textures are generated inline via SVG turbulence instead of image files, keeping the packaged app fully offline-safe with a clean console.

### Packaged-app smoke test

`npm run desktop:smoke` boots the packaged desktop executable (default `release/win-unpacked/Paper City.exe`, or pass a path), waits for its embedded game server on a free port, fetches the page and every JS chunk, and asserts the living NPC system compiled into the production bundle:

- Executable exists and stays alive
- App boots and serves the game (HTTP 200)
- Daypart dialogue, street-encounter overlay, service dialogue, and Service Contacts roster markers present
- NPC schedule data (NPC ids and venues) compiled into the bundle
- No legacy missing-asset references

The script kills stale `Paper City.exe` instances first, always cleans up the spawned app, and exits non-zero if any check fails — suitable for CI. A companion unit test (`tests/SmokeTestMarkers.test.ts`) keeps the smoke-test markers in sync with the actual NPC data and components, so data edits cannot silently break the smoke check.

### One-command release

```bash
npm run desktop:release -- 0.1.3 docs/PATCH_NOTES_0.1.3.md
```

Bumps `package.json`, runs typecheck + lint + unit tests, builds, packages the NSIS installer, smoke-tests the packaged exe, then commits, tags `vX.Y.Z`, pushes, and publishes the GitHub release with the installer attached. Flags: `--dry-run` (fully inert except the read-only smoke test) and `--skip-smoke`. Requires an authenticated `gh` CLI.

## Current game systems

### Faction identity

Players choose between three broad directions:

- **Angel — Order & Legitimacy**
  - Protection
  - Civic influence
  - Coalition access
  - Public reputation
  - Legal and institutional power
- **Ghost — Information & Leverage**
  - Intelligence
  - Markets
  - Infiltration
  - Secrets
  - Quiet alliances
- **Demon — Power & Fear**
  - Combat
  - Underworld influence
  - Intimidation
  - High-risk rewards
  - Reputation through force

Faction identity is committed but crossable. Defection changes reputation, access, NPC reactions, contracts, and the player’s persistent narrative history.

### Branching faction arcs

Each faction now has a balanced three-stage arc with branch-specific outcomes:

- **Angel:** First Watch → Public Record → The Coalition Line
  - Civic Steward
  - Paper Authority
- **Ghost:** First Signal → Open Channel → The Price of Knowing
  - Open Channel
  - Quiet Broker
- **Demon:** First Debt → Fight Night → The Seat Below
  - Enforcer
  - Necessary Monster

Arc choices affect rewards, faction reputation, relationships, access flags, achievements, and replay markers. Completing an arc does not end the wider game.

### Combat progression

Combat is an optional progression path rather than a mandatory requirement for every storyline. The **Fight Circuit** includes:

- A four-tier fight ladder with escalating enemies and unique equipment rewards.
- Faction-specific combat challenges for Angel, Ghost, and Demon identities.
- Rival encounters with persistent rival wins and relationship consequences.
- Combat contracts that reward accepted objectives rather than random victories.
- Fighter reputation, ladder progression, rank titles, and faction combat records.
- Build feedback for weapon damage, accuracy, and critical chance.
- Social and economic resolutions for major conflicts when the player has enough Charisma, Intelligence, or cash.
- Combat outcomes that can improve or damage NPC relationships without closing non-combat story routes.

Players can build a fighter identity, pursue high-risk rewards, or ignore the circuit and continue through social, economic, faction, and narrative systems.

### The Exchange: interconnected economy

Money is now a progression path of its own. **The Exchange** (accessible from Downtown Baltimore, the sidebar DEBT panel, or the Economy tab) connects cash, debt, reputation, and the daily scene:

- **NPC loans** — borrow up to $2,000 with a 3-day repayment window. Missed payments seize 10% of the balance from cash, raise the interest rate, count toward default, and cost Demon standing. Three defaults and no lender in Paper City will front money again.
- **Market intelligence** — three intel sources (Street Kid 55%, Ticker Tess 70%, Ghost Channel 85% accuracy) reveal a same-day bull/bear read on a crypto asset before trading.
- **Faction vendors** — reputation-gated supply depots for Angel, Ghost, and Demon sell gear below retail. Relationship with the faction's key NPC applies up to a 10% discount.
- **Housing and safehouse upgrades** — six permanent installs, including the Real Mattress (+10 morning energy), Coffee Station, Security Locks, Police Scanner (better intel accuracy), and Training Corner (cheaper training energy).
- **Daily city activities** — a rotating scene that changes every three in-game days and mixes social, economy, work, and combat opportunities. Faction-specific activities appear once the player is committed or trusted. Activities cost Energy and time and pay cash, XP, relationships, and faction reputation.
- **Finance contracts** — casino marker runs, courier briefs, heat plays, and career referrals that complete through normal play: winning the listed casino game, arriving at the target location, or finishing a work shift. Each contract pays once and is recorded permanently.

### Context-sensitive city events

Paper City now evaluates the player’s context when time advances instead of relying only on a generic random-event roll. Events can react to:

- Current location and venue.
- Activity type: travel, work, training, study, contracts, social, economy, or combat.
- Time of day.
- Faction reputation and identity.
- NPC trust, relationships, debt, and history.
- Cash, karma, energy, health, and completed contracts.
- Recent action context and event cooldowns.

Reactive scenarios include rival contract interruptions, NPC debt calls, faction shortcut offers, market opportunities, public reputation consequences, trusted-contact requests, relationship threats, and social/economic leverage that can avoid combat. The latest outcome is saved and shown in the city HUD, while event cooldowns and daily limits prevent repeated spam.

### Persistent NPC consequences

NPCs track relationship, trust, fear, loyalty, history, alignment, and faction context. After an arc ending, faction-specific NPC scenes remain available and the city reacts to the player’s chosen conclusion.

Arc endings now unlock additional progression instead of changing dialogue only:

- Ending-specific post-arc contract pools.
- NPC services such as civic endorsements, broker rates, underworld protection, and enforcer work.
- These services can be activated directly from NPC dialogue, with daily-use protection and visible service results.
- Ending-based shop discounts on faction equipment and technology.
- Arc summaries persist ending titles, major choices, relationship snapshots, and replay markers.
- Cross-faction consequence contracts can change opposing-faction reputation after an ending.
- Persistent service and contract access through saved ending flags.

### Living city NPCs

NPCs are no longer tied to a single building. The city now runs a lightweight NPC AI:

- **Daily schedules** - Each major NPC follows a time-based routine. Ace handles Coalition business downtown at midday, Tommy Two-Times slips into the Underground Markets after dark, Ticker Tess moves from the Trading Floor to the casino in the evening, and club staff arrive for the night shift.
- **Venue presence** - NPC lists, the sidebar, and each map show exactly who is present at the current in-game time. Unreachable periods do not exist: when a schedule block ends, NPCs fall back to their home venue.
- **Time-of-day dialogue** - Every scheduled NPC greets you differently morning, afternoon, evening, and night. Ace talks Coalition business at midday, Tommy Two-Times gets cagey after dark, Ticker Tess pitches her casino book in the evening, and Mayor McPaper is only doing walkabouts after hours. Greetings resolve through the same world clock as schedules, so dialogue matches where the NPC is and what they are doing. Faction friction, fear, and relationship state still override the time-of-day lines.
- **World rendering** - NPCs appear as stick figures on the visual map with faction-colored glows (green Angel, purple Ghost, red Demon, white neutral), name tags, and walk animation.
- **Roaming behavior** - Present NPCs wander the map deterministically, avoid buildings, slide along obstacles, and stay within map bounds.
- **Proximity interaction** - Walk up to any NPC and press **E** (or tap ACTION on mobile) to start a conversation. A `[ E ] TALK` prompt appears over nearby NPCs.
- **Street encounters** - Roaming NPCs close to the player can approach first with offers or warnings. Tommy hustles deliveries, Jenkins asks for help with his flat cat, Tess pitches a table tell at the casino, Rook offers collection runs, while Ace, Tommy, and Shady Slim deliver warnings with real consequences — ignoring a pickpocket alert literally lightens your pockets. Approaches respect schedules, venue, time of day, cash requirements, one approach per NPC per day, and a global one-approach-per-hour guard. Offers pay rewards; warnings reward heeding them and penalize dismissal. Every resolution is logged in the NPC's relationship history.
- **Deterministic simulation** - NPC paths are seeded from their identity, so the same world state produces the same movement, keeping behavior stable across save/load.

**Services travel with the person.** NPC services are faction-gated rather than venue-gated, so they remain available wherever the NPC currently is:

- Ticker Tess offers her market service and broker rates from the casino after 7 PM exactly as she does from the Trading Floor by day.
- Ghost's intel service is reachable on The Block in the morning, the Underground Markets midday, and Downtown in the evening.
- A **Service Contacts** roster in the sidebar shows every service NPC with their current location, highlighting contacts who are present where you are.
- Venue views (Club Lust, locations) dim NPCs who are scheduled elsewhere and show where to find them.
- LocationView lists each present NPC's service and current venue.

Ordinary conversations are separate from task rewards:

- Most NPCs do not pay cash or XP just for being spoken to.
- Selected NPCs can grant one daily social effect.
- Good contacts may provide karma, luck, donuts, or trust.
- Opportunistic and dangerous contacts may provide leverage at the cost of karma, luck, or safety.
- Gifts are real items: offering a favor consumes a donut, coffee, or lucky charm from inventory, logs the exchange in the NPC's relationship history, and completes matching contact tasks.
- Gifts, insults, and faction alignment change the result.

### Faction districts and services

Unlocked faction standing changes the available city content:

- Faction-specific locations and services.
- Different daily contract pools.
- Unique career postings.
- Corporate, civic, and black-market shop inventories.
- Faction-specific NPC services.
- Locked locations and services with visible unlock requirements.

Contracts are actively accepted from the daily board before they can progress. Players can carry up to three accepted contracts per day, abandon work, and let offers expire at day end. Once an accepted contract’s objective is completed, it resolves immediately and pays exactly once; unaccepted activity never counts.

### Core progression

- Character creation and identity selection
- Stats, karma, XP, levels, traits, and skill points
- Responsive map exploration with keyboard and mobile controls
- Inventory, equipment, consumables, weapons, shops, and clothing
- Combat encounters, optional fight ladders, rivals, faction challenges, contracts, and combat records
- Careers, job applications, work shifts, and promotions
- University study sessions and licensing challenges
- Casino activities
- Club Lust social and nightlife activities with Angel, Ghost, and Demon contract opportunities
- Persistent Club reputation, faction trust, and nightlife heat that unlocks or suppresses different events
- Crypto and stock market systems
- Achievements and arc summaries
- Local persistence and save export/import
- Responsive desktop and mobile HUD layouts
- Guaranteed starter-home access on The Block, independent of Slums faction gates
- Energy-based sleep, work, combat, and activity feedback with daily restoration
- Invalid legacy locations recover safely to The Block during save migration/import
- Multiplayer/networking foundations

## New-player field guide

After character creation, the local application opens a six-step Paper City field guide. It introduces:

1. The city loop and persistent choices.
2. Map movement and building interaction.
3. NPC conversations and relationship memory.
4. Energy, work, contracts, and sleep.
5. Angel, Ghost, and Demon identity paths.
6. Daily returns, Club Lust, and replayable opportunities.

The guide is saved with the local game state. Players can skip it, continue normally, or replay it later from the **REPLAY_FIELD_GUIDE** button in the desktop system sidebar.

## Run in a browser

Install dependencies and start the web version:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Run as a desktop app

Paper City includes a Windows-friendly Electron launcher. It starts the local Next.js server and opens the game in its own desktop window.

```bash
npm install
npm run desktop
```

`npm run desktop:dev` is an equivalent explicit command.

The desktop launcher uses Webpack for development because it is more reliable in OneDrive-synced folders than Turbopack’s persistent filesystem cache.

To use another local port:

```powershell
$env:PAPER_CITY_PORT=3100
npm run desktop
```

Close the Electron window to stop the local Next.js process.

## Production-like desktop test

```bash
npm run desktop:prod
```

This builds the optimized Next.js app, starts it with `next start`, and opens it in Electron. It is a local smoke test, not an installer build.

## Build the Windows desktop launch button

Paper City can also be packaged as a normal Windows application with a desktop shortcut and Start Menu entry. The packaged app includes its production build and does not require Node.js, npm, or a terminal on the player’s machine.

Install the packaging dependency and create the installer:

```bash
npm install
npm run desktop:package
```

The installer is written to `release/Paper-City-Setup-<version>.exe` (currently `release/Paper-City-Setup-0.1.1.exe`). Running it creates a **Paper City** desktop shortcut, a Start Menu entry, and an uninstall entry. The installer is configured for x64 Windows and allows the installation directory to be changed. The packaged Electron window uses the three-faction city sigil, while the existing `.ico` asset remains the Windows executable fallback until final branded ICO artwork is exported.

For an unpacked production build useful for local smoke testing:

```bash
npm run desktop:unpacked
```

The development and production-like commands remain available for contributors:

- `npm run desktop` — run the source checkout through Electron and the local Next.js development server.
- `npm run desktop:prod` — run the optimized build through Electron without creating an installer.
- `npm run desktop:unpacked` — create an unpacked production desktop build.
- `npm run desktop:package` — create the Windows installer and desktop launch button.

If the installer or packaged app cannot start because port `3000` is already in use, close the process using that port before launching Paper City. The source-based launcher can use another port with `PAPER_CITY_PORT`, while installed builds use the default local port.

## Validation

```bash
npx tsc --noEmit
npm run lint
npx vitest run
npm run build
```

The current regression suite covers faction choices, defection, access gates, NPC social effects, item-consuming gift exchanges, immediate NPC contract rewards, branch conclusions, ending markers, persistent ending dialogue, starter-home access, sleep recovery, map activity routing, invalid-location recovery, energy-based work costs, Club activity contract routing, persistent nightlife reputation/heat progression, context-sensitive event filtering and outcomes, and combat ladder, rival, reward, and non-combat resolution behavior.

## Project structure

- `src/app/` — Next.js application entry points and API routes
- `src/components/` — game UI, map, overlays, and views
- `src/stores/` — Zustand game and UI state
- `src/data/` — quests, factions, NPCs, scenes, careers, contracts, locations, and items
- `src/lib/` — progression, access, combat, NPC, save, and quest systems
- `electron/` — desktop launcher process
- `tests/` — unit and store regression tests
