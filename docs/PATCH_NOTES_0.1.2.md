# Paper City — Update 0.1.2 "The City Is Awake"

*Patch notes for r/PaperCityRPG · September 23, 2026*

---

The three previous builds gave Paper City systems. This one gives it a **population**. NPCs no longer wait in fixed buildings for you to arrive — they live in the city on their own schedules, talk differently depending on when you find them, and will now walk up to *you*.

## 🚶 Living NPCs

Every major character now follows a **daily schedule** across the city:

- **Ace** handles Coalition business downtown at midday, back on The Block by evening
- **Tommy Two-Times** slips into the Underground Markets after 7 PM
- **Ticker Tess** leaves the Trading Floor for the casino floor at night
- **Aria Vale, DJ Echo, and Kane** work the night shift at Club Lust
- **Mayor McPaper** does evening walkabouts downtown

Nobody is ever unreachable — off-hours NPCs fall back to their home venue. NPCs render as stick figures with **faction-colored glows** (green Angel, purple Ghost, red Demon), roam their venue deterministically, avoid buildings, and stay in bounds. Walk up to anyone and press **E** to talk.

## 🕐 Time-of-Day Dialogue

The city sounds different depending on when you walk it. All 18 scheduled NPCs have **morning / afternoon / evening / night** greeting lines that match what they're actually doing:

- Ace at noon: *"Coalition business downtown ate my whole day. Say it quick."*
- Tess at night: *"The casino's my second market. House edge by day, table edge by night."*
- Jenkins at night: *"Get off my sidewalk! The sidewalk has BEDTIMES!"*

Story state still dominates: faction friction, fear, and relationship overrides come before small talk.

## 🤝 Street Encounters

Roaming NPCs close to you can now **approach first**:

- **Offers**: Tommy's package run (+$40), Jenkins' flat-cat rescue (+Karma), Ghost's whispered intel (+Luck), Tess's casino table tell (evenings only), Rook's collection run (+$60, −Karma), Kane's door shift, Mara's spar
- **Warnings**: Ace flags dangerous blocks; ignore Tommy's pickpocket alert in the markets and lose **$30** from your pockets for real

Rate-limited so the city never nags: one approach per NPC per day, max one per in-game hour, never during combat or dialogue.

## 💼 Portable Services

Services travel with the person, not the building. Tess's **Broker rates** work identically from the casino at 9 PM as from the Trading Floor at noon. The sidebar now has a **Service Contacts** roster showing exactly where every service NPC is right now.

## 🖥️ Desktop (0.1.2 installer)

- New **build stamp** on the main menu showing the installer version
- Fixed a missing-asset 404 (`noise.png`) — the packaged app now loads with **zero failed requests**
- Dialogue paper texture is now generated locally instead of pulled from a third-party website (works fully offline)
- New automated smoke test (`npm run desktop:smoke`) boots the packaged exe and verifies the NPC system loads — **10/10 checks**

## ⚖️ Balance & Systems (since 0.1.0, for newer citizens)

- **The Exchange**: NPC loans with real default consequences, market intel tiers, faction vendors, housing upgrades, rotating daily activities, finance contracts
- **Fight Circuit**: four-tier fight ladder, rivals, faction challenges, fighter reputation, and social/economic ways to defuse fights without throwing a punch
- **Reactive city events**: rivals interrupt contracts, debts come due, recruiters find you, combat can be avoided through leverage
- **NPC economy**: gifts are real items that leave your inventory and get remembered; not every NPC pays you to talk — some cost you karma

## 🔜 Next

Reputation-driven street behavior (a feared player gets *yielded to*), time-gated rumors tied to contracts and markets, and deeper club nightlife rotations.

---

*Play the Windows build: `Paper-City-Setup-0.1.2.exe`. Existing saves carry over — new systems initialize safely on first load.*
